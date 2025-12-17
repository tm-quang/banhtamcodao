/**
 * src/lib/supabase-helper.js
 * Helper functions để kiểm tra và sử dụng Supabase clients an toàn
 * 
 * ⚠️ This file should ONLY be used in server-side code (API routes, Server Components, Server Actions)
 * For client components, use @/lib/supabase-client instead
 */
import { supabaseAdmin } from './supabase-server';

/**
 * Kiểm tra và trả về supabaseAdmin, throw error nếu chưa được khởi tạo
 * ⚠️ Server-side only - uses SUPABASE_SERVICE_ROLE_KEY
 */
export function getSupabaseAdmin() {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client chưa được khởi tạo. Vui lòng kiểm tra SUPABASE_SERVICE_ROLE_KEY trong file .env.local');
    }
    return supabaseAdmin;
}

