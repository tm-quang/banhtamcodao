/**
 * src/app/api/admin/products/route.js
 * API routes cho quản lý sản phẩm
 * Enhanced with security features
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { slugify } from '@/lib/slugify';
import { verifyAdminAPI, errorResponse, successResponse, validateRequestBody, handleAPIError } from '@/lib/api-security';

export const dynamic = 'force-dynamic';

// Function để tính số lượng đã bán từ orders
async function calculateSoldQuantities() {
    try {
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('id, items_list, status')
            .in('status', ['Đã xác nhận', 'Đang vận chuyển', 'Hoàn thành', 'Đã giao']);

        if (error) {
            console.error('Error fetching orders for sold quantity:', error);
            return {};
        }

        const soldQuantities = {};

        orders?.forEach(order => {
            if (!order.items_list) return;

            try {
                let items = [];
                const itemsList = order.items_list.trim();

                if (itemsList.startsWith('[')) {
                    items = JSON.parse(itemsList);
                } else if (itemsList.includes('|||')) {
                    items = itemsList.split('|||')
                        .map(item => {
                            try {
                                return JSON.parse(item.trim());
                            } catch {
                                return null;
                            }
                        })
                        .filter(Boolean);
                } else {
                    try {
                        const parsed = JSON.parse(itemsList);
                        items = Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return;
                    }
                }

                items.forEach(item => {
                    const productId = item.id ? parseInt(item.id, 10) : null;
                    const productName = item.name ? item.name.trim() : null;
                    const quantity = parseInt(item.quantity || item.qty || 1, 10);

                    if (productId) {
                        soldQuantities[productId] = (soldQuantities[productId] || 0) + quantity;
                    }
                    if (productName) {
                        soldQuantities[productName] = (soldQuantities[productName] || 0) + quantity;
                    }
                });
            } catch (err) {
                console.error('Error parsing items_list:', err);
            }
        });

        return soldQuantities;
    } catch (error) {
        console.error('Error calculating sold quantities:', error);
        return {};
    }
}

export async function GET(request) {
    // Verify admin authentication
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) {
        return errorResponse(
            authError === 'Unauthorized' ? 'Vui lòng đăng nhập' : 'Chỉ admin mới có quyền truy cập',
            authError === 'Unauthorized' ? 401 : 403
        );
    }

    try {
        // Select tất cả các trường (bao gồm inventory nếu có)
        const [productsResult, soldQuantities] = await Promise.all([
            supabaseAdmin
                .from('products')
                .select(`
id, name, slug, description, price, discount_price,
    status, image_url, is_special, category_id, inventory,
    categories(name)
        `)
                .order('id', { ascending: false }),
            calculateSoldQuantities()
        ]);

        if (productsResult.error) throw productsResult.error;

        const products = productsResult.data.map(p => {
            const soldQuantity = soldQuantities[p.id] || soldQuantities[p.name] || 0;
            return {
                ...p,
                category_name: p.categories?.name,
                price: parseFloat(p.price),
                discount_price: p.discount_price ? parseFloat(p.discount_price) : null,
                inventory: p.inventory !== null && p.inventory !== undefined ? parseInt(p.inventory, 10) : null,
                sold_quantity: soldQuantity,
            };
        }).map(p => {
            delete p.categories;
            return p;
        });

        return successResponse({ products }, 'Lấy danh sách sản phẩm thành công');

    } catch (error) {
        return handleAPIError(error, 'GET /api/admin/products');
    }
}

export async function POST(request) {
    // Verify admin authentication
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) {
        return errorResponse(
            authError === 'Unauthorized' ? 'Vui lòng đăng nhập' : 'Chỉ admin mới có quyền truy cập',
            authError === 'Unauthorized' ? 401 : 403
        );
    }

    try {
        const productData = await request.json();

        // Validate input
        const validation = validateRequestBody(productData, {
            name: {
                required: true,
                type: 'string',
                minLength: 3,
                maxLength: 255
            },
            price: {
                required: true,
                type: 'number',
                min: 0
            },
            category_id: {
                required: true,
                type: 'number'
            },
            description: {
                required: false,
                type: 'string',
                maxLength: 2000
            },
            slug: {
                required: false,
                type: 'string'
            },
            image_url: {
                required: false,
                type: 'string'
            },
            discount_price: {
                required: false,
                type: 'number',
                min: 0
            },
            status: {
                required: false,
                type: 'string'
            },
            is_special: {
                required: false,
                type: 'boolean'
            }
        });

        if (!validation.valid) {
            return errorResponse(validation.message, 400, { errors: validation.errors });
        }

        const { name, slug, description, image_url, price, discount_price, category_id, status, is_special } = validation.data;

        // Generate slug
        const finalSlug = slug ? slugify(slug) : slugify(name);

        // Prepare data
        const insertData = {
            name,
            slug: finalSlug,
            description: description || null,
            image_url: image_url || null,
            price,
            discount_price: discount_price || null,
            category_id,
            status: status || 'active',
            is_special: is_special || false
        };

        const { data: result, error } = await supabaseAdmin
            .from('products')
            .insert([insertData])
            .select();

        if (error) throw error;

        return successResponse(
            { productId: result[0].id, product: result[0] },
            'Thêm sản phẩm thành công!'
        );

    } catch (error) {
        return handleAPIError(error, 'POST /api/admin/products');
    }
}
