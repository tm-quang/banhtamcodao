/**
 * src/lib/security.js
 * Security utilities for CSRF protection and input validation
 */

import { randomBytes } from 'crypto';

/**
 * CSRF Token Management
 */
export class CSRFProtection {
    /**
     * Generate a CSRF token
     * @returns {string} CSRF token
     */
    static generateToken() {
        return randomBytes(32).toString('hex');
    }

    /**
     * Validate CSRF token
     * @param {string} token - Token to validate
     * @param {string} sessionToken - Session token to compare against
     * @returns {boolean} True if valid
     */
    static validateToken(token, sessionToken) {
        if (!token || !sessionToken) {
            return false;
        }

        // Constant-time comparison to prevent timing attacks
        if (token.length !== sessionToken.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < token.length; i++) {
            result |= token.charCodeAt(i) ^ sessionToken.charCodeAt(i);
        }

        return result === 0;
    }
}

/**
 * Input Sanitization
 */
export class InputSanitizer {
    /**
     * Sanitize string input to prevent XSS
     * @param {string} input - Input to sanitize
     * @returns {string} Sanitized input
     */
    static sanitizeString(input) {
        if (typeof input !== 'string') {
            return '';
        }

        return input
            .replace(/[<>]/g, '') // Remove < and >
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }

    /**
     * Sanitize email
     * @param {string} email - Email to sanitize
     * @returns {string} Sanitized email
     */
    static sanitizeEmail(email) {
        if (typeof email !== 'string') {
            return '';
        }

        return email.toLowerCase().trim();
    }

    /**
     * Sanitize phone number
     * @param {string} phone - Phone to sanitize
     * @returns {string} Sanitized phone
     */
    static sanitizePhone(phone) {
        if (typeof phone !== 'string') {
            return '';
        }

        // Remove all non-digit characters except +
        return phone.replace(/[^\d+]/g, '');
    }

    /**
     * Sanitize URL
     * @param {string} url - URL to sanitize
     * @returns {string} Sanitized URL
     */
    static sanitizeUrl(url) {
        if (typeof url !== 'string') {
            return '';
        }

        // Only allow http and https protocols
        try {
            const parsed = new URL(url);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return '';
            }
            return url;
        } catch {
            return '';
        }
    }
}

/**
 * Input Validation
 */
export class InputValidator {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number (Vietnamese format)
     * @param {string} phone - Phone to validate
     * @returns {boolean} True if valid
     */
    static isValidPhone(phone) {
        // Vietnamese phone: 10-11 digits, starts with 0 or +84
        const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {object} Validation result with strength score
     */
    static validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, score: 0, message: 'Mật khẩu không hợp lệ' };
        }

        let score = 0;
        const feedback = [];

        // Length check
        if (password.length < 8) {
            feedback.push('Mật khẩu phải có ít nhất 8 ký tự');
        } else {
            score += 1;
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Nên có ít nhất 1 chữ hoa');
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Nên có ít nhất 1 chữ thường');
        }

        // Number check
        if (/[0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Nên có ít nhất 1 chữ số');
        }

        // Special character check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Nên có ít nhất 1 ký tự đặc biệt');
        }

        const valid = score >= 3 && password.length >= 8;

        return {
            valid,
            score,
            strength: score <= 2 ? 'weak' : score <= 3 ? 'medium' : 'strong',
            message: valid ? 'Mật khẩu hợp lệ' : feedback.join('. '),
            feedback
        };
    }

    /**
     * Validate UUID format
     * @param {string} uuid - UUID to validate
     * @returns {boolean} True if valid
     */
    static isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    /**
     * Validate number range
     * @param {number} value - Value to validate
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {boolean} True if valid
     */
    static isInRange(value, min, max) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }
}

/**
 * SQL Injection Prevention
 */
export class SQLSanitizer {
    /**
     * Escape SQL special characters
     * Note: This is a basic implementation. Always use parameterized queries!
     * @param {string} input - Input to escape
     * @returns {string} Escaped input
     */
    static escape(input) {
        if (typeof input !== 'string') {
            return input;
        }

        return input
            .replace(/'/g, "''")
            .replace(/;/g, '')
            .replace(/--/g, '')
            .replace(/\/\*/g, '')
            .replace(/\*\//g, '');
    }

    /**
     * Validate table/column name (alphanumeric + underscore only)
     * @param {string} name - Name to validate
     * @returns {boolean} True if valid
     */
    static isValidIdentifier(name) {
        const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
        return identifierRegex.test(name);
    }
}

/**
 * Rate Limiting Helper (for client-side)
 */
export class RateLimiter {
    constructor(maxRequests = 10, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }

    /**
     * Check if request is allowed
     * @returns {boolean} True if allowed
     */
    isAllowed() {
        const now = Date.now();

        // Remove old requests outside the window
        this.requests = this.requests.filter(time => now - time < this.windowMs);

        // Check if limit exceeded
        if (this.requests.length >= this.maxRequests) {
            return false;
        }

        // Add current request
        this.requests.push(now);
        return true;
    }

    /**
     * Get remaining requests
     * @returns {number} Number of remaining requests
     */
    getRemaining() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        return Math.max(0, this.maxRequests - this.requests.length);
    }

    /**
     * Reset rate limiter
     */
    reset() {
        this.requests = [];
    }
}

/**
 * Security Headers Validator
 */
export class SecurityHeaders {
    /**
     * Get recommended security headers
     * @returns {object} Security headers
     */
    static getRecommendedHeaders() {
        return {
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
            'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
        };
    }

    /**
     * Validate if response has security headers
     * @param {Headers} headers - Response headers
     * @returns {object} Validation result
     */
    static validateHeaders(headers) {
        const recommended = this.getRecommendedHeaders();
        const missing = [];

        for (const [key, value] of Object.entries(recommended)) {
            if (!headers.get(key)) {
                missing.push(key);
            }
        }

        return {
            valid: missing.length === 0,
            missing,
            message: missing.length === 0
                ? 'All security headers present'
                : `Missing headers: ${missing.join(', ')}`
        };
    }
}

/**
 * Environment Variables Validator
 */
export class EnvValidator {
    /**
     * Check if required environment variables are set
     * @param {string[]} requiredVars - Array of required variable names
     * @returns {object} Validation result
     */
    static validateRequired(requiredVars) {
        const missing = [];

        for (const varName of requiredVars) {
            if (!process.env[varName]) {
                missing.push(varName);
            }
        }

        return {
            valid: missing.length === 0,
            missing,
            message: missing.length === 0
                ? 'All required environment variables are set'
                : `Missing variables: ${missing.join(', ')}`
        };
    }

    /**
     * Validate Supabase environment variables
     * @returns {object} Validation result
     */
    static validateSupabase() {
        return this.validateRequired([
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY'
        ]);
    }
}
