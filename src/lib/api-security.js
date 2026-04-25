/**
 * src/lib/api-security.js
 * Security helpers for API routes
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from './supabase-helper';
import { InputSanitizer, InputValidator } from './security';

/**
 * Verify admin authentication for API routes
 * @param {Request} request - Next.js request object
 * @returns {Promise<{error: string|null, user: object|null, customer: object|null}>}
 */
export async function verifyAdminAPI(request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return {
                error: 'Server configuration error',
                user: null,
                customer: null
            };
        }

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;
        const refreshToken = cookieStore.get('sb-refresh-token')?.value;

        if (!accessToken && !refreshToken) {
            return {
                error: 'Unauthorized',
                user: null,
                customer: null
            };
        }

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            global: {
                headers: accessToken ? {
                    Authorization: `Bearer ${accessToken}`
                } : {}
            }
        });

        // Set session
        if (accessToken && refreshToken) {
            await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
        }

        // Get user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                error: 'Unauthorized',
                user: null,
                customer: null
            };
        }

        // Check role from customers table
        const supabaseAdmin = getSupabaseAdmin();
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('account_id', user.id)
            .maybeSingle();

        if (customerError || !customer) {
            return {
                error: 'User not found',
                user,
                customer: null
            };
        }

        if (customer.role !== 'admin') {
            return {
                error: 'Forbidden - Admin only',
                user,
                customer
            };
        }

        return {
            error: null,
            user,
            customer
        };

    } catch (error) {
        console.error('API auth error:', error);
        return {
            error: 'Internal server error',
            user: null,
            customer: null
        };
    }
}

/**
 * Verify user authentication (not necessarily admin)
 * @param {Request} request - Next.js request object
 * @returns {Promise<{error: string|null, user: object|null, customer: object|null}>}
 */
export async function verifyUserAPI(request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return {
                error: 'Server configuration error',
                user: null,
                customer: null
            };
        }

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;
        const refreshToken = cookieStore.get('sb-refresh-token')?.value;

        if (!accessToken && !refreshToken) {
            return {
                error: 'Unauthorized',
                user: null,
                customer: null
            };
        }

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            global: {
                headers: accessToken ? {
                    Authorization: `Bearer ${accessToken}`
                } : {}
            }
        });

        // Set session
        if (accessToken && refreshToken) {
            await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
        }

        // Get user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                error: 'Unauthorized',
                user: null,
                customer: null
            };
        }

        // Get customer data
        const supabaseAdmin = getSupabaseAdmin();
        const { data: customer } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('account_id', user.id)
            .maybeSingle();

        return {
            error: null,
            user,
            customer
        };

    } catch (error) {
        console.error('API auth error:', error);
        return {
            error: 'Internal server error',
            user: null,
            customer: null
        };
    }
}

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {object} extra - Extra data to include
 * @returns {NextResponse}
 */
export function errorResponse(message, status = 500, extra = {}) {
    return NextResponse.json(
        {
            success: false,
            message,
            ...extra
        },
        { status }
    );
}

/**
 * Create success response
 * @param {object} data - Response data
 * @param {string} message - Success message
 * @returns {NextResponse}
 */
export function successResponse(data = {}, message = 'Success') {
    return NextResponse.json({
        success: true,
        message,
        ...data
    });
}

/**
 * Validate request body
 * @param {object} body - Request body
 * @param {object} schema - Validation schema
 * @returns {object} Validation result
 */
export function validateRequestBody(body, schema) {
    const errors = [];
    const sanitized = {};

    for (const [field, rules] of Object.entries(schema)) {
        const value = body[field];

        // Required check
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} là bắt buộc`);
            continue;
        }

        // Skip validation if not required and empty
        if (!rules.required && (value === undefined || value === null || value === '')) {
            continue;
        }

        // Type validation
        if (rules.type) {
            switch (rules.type) {
                case 'string':
                    if (typeof value !== 'string') {
                        errors.push(`${field} phải là chuỗi`);
                        continue;
                    }
                    sanitized[field] = InputSanitizer.sanitizeString(value);
                    break;

                case 'email':
                    if (!InputValidator.isValidEmail(value)) {
                        errors.push(`${field} không hợp lệ`);
                        continue;
                    }
                    sanitized[field] = InputSanitizer.sanitizeEmail(value);
                    break;

                case 'phone':
                    if (!InputValidator.isValidPhone(value)) {
                        errors.push(`${field} không hợp lệ`);
                        continue;
                    }
                    sanitized[field] = InputSanitizer.sanitizePhone(value);
                    break;

                case 'number':
                    const num = Number(value);
                    if (isNaN(num)) {
                        errors.push(`${field} phải là số`);
                        continue;
                    }
                    sanitized[field] = num;
                    break;

                case 'boolean':
                    sanitized[field] = Boolean(value);
                    break;

                case 'uuid':
                    if (!InputValidator.isValidUUID(value)) {
                        errors.push(`${field} không hợp lệ`);
                        continue;
                    }
                    sanitized[field] = value;
                    break;

                default:
                    sanitized[field] = value;
            }
        } else {
            sanitized[field] = value;
        }

        // Min length
        if (rules.minLength && sanitized[field].length < rules.minLength) {
            errors.push(`${field} phải có ít nhất ${rules.minLength} ký tự`);
        }

        // Max length
        if (rules.maxLength && sanitized[field].length > rules.maxLength) {
            errors.push(`${field} không được vượt quá ${rules.maxLength} ký tự`);
        }

        // Min value
        if (rules.min !== undefined && sanitized[field] < rules.min) {
            errors.push(`${field} phải lớn hơn hoặc bằng ${rules.min}`);
        }

        // Max value
        if (rules.max !== undefined && sanitized[field] > rules.max) {
            errors.push(`${field} phải nhỏ hơn hoặc bằng ${rules.max}`);
        }

        // Custom validation
        if (rules.validate && typeof rules.validate === 'function') {
            const customError = rules.validate(sanitized[field]);
            if (customError) {
                errors.push(customError);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        data: sanitized,
        message: errors.length === 0 ? 'Validation passed' : errors.join(', ')
    };
}

/**
 * Handle API errors consistently
 * @param {Error} error - Error object
 * @param {string} context - Error context
 * @returns {NextResponse}
 */
export function handleAPIError(error, context = 'API') {
    console.error(`${context} Error:`, error);

    // Supabase errors
    if (error.code) {
        switch (error.code) {
            case '23505': // Unique violation
                return errorResponse('Dữ liệu đã tồn tại', 409);
            case '23503': // Foreign key violation
                return errorResponse('Dữ liệu liên quan không tồn tại', 400);
            case '23502': // Not null violation
                return errorResponse('Thiếu dữ liệu bắt buộc', 400);
            case 'PGRST116': // No rows found
                return errorResponse('Không tìm thấy dữ liệu', 404);
            default:
                break;
        }
    }

    // Development vs Production
    if (process.env.NODE_ENV === 'development') {
        return errorResponse(error.message || 'Internal server error', 500, {
            stack: error.stack,
            code: error.code
        });
    }

    return errorResponse('Đã xảy ra lỗi. Vui lòng thử lại sau.', 500);
}

/**
 * Example usage in API route:
 * 
 * export async function POST(request) {
 *     // Verify admin
 *     const { error: authError, user, customer } = await verifyAdminAPI(request);
 *     if (authError) {
 *         return errorResponse(authError, authError === 'Unauthorized' ? 401 : 403);
 *     }
 *     
 *     // Parse and validate body
 *     const body = await request.json();
 *     const validation = validateRequestBody(body, {
 *         name: { required: true, type: 'string', minLength: 3 },
 *         email: { required: true, type: 'email' },
 *         age: { required: false, type: 'number', min: 0, max: 150 }
 *     });
 *     
 *     if (!validation.valid) {
 *         return errorResponse(validation.message, 400, { errors: validation.errors });
 *     }
 *     
 *     try {
 *         // Your logic here with validation.data
 *         return successResponse({ data: result }, 'Created successfully');
 *     } catch (error) {
 *         return handleAPIError(error, 'Create Item');
 *     }
 * }
 */
