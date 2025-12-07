import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Tạo Supabase client với anon key (cho client-side và public operations)
 */
const supabase = supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Tạo Supabase client với service role key (cho server-side admin operations)
 * Service role key bypasses Row Level Security (RLS)
 */
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

/**
 * Kiểm tra và cảnh báo nếu thiếu cấu hình
 */
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY chưa được cấu hình');
}

if (!supabaseServiceRoleKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình. Các API routes admin có thể không hoạt động.');
}

/**
 * Helper function để kiểm tra supabaseAdmin có sẵn sàng không
 */
export function checkSupabaseAdmin() {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client chưa được khởi tạo. Vui lòng kiểm tra SUPABASE_SERVICE_ROLE_KEY trong file .env.local');
    }
    return supabaseAdmin;
}

export default supabase;
export { supabaseAdmin };
