/**
 * src/lib/supabase-helper.js
 * Helper functions để kiểm tra và sử dụng Supabase clients an toàn
 */
import { supabaseAdmin } from './supabase';

/**
 * Kiểm tra và trả về supabaseAdmin, throw error nếu chưa được khởi tạo
 */
export function getSupabaseAdmin() {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client chưa được khởi tạo. Vui lòng kiểm tra SUPABASE_SERVICE_ROLE_KEY trong file .env.local');
    }
    return supabaseAdmin;
}

