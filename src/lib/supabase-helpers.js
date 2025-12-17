/**
 * src/lib/supabase-helpers.js
 * Helper functions for Supabase clients
 * These are NOT Server Actions - they're utility functions
 */
import supabase, { supabaseAdmin } from './supabase-server';

/**
 * Helper function để kiểm tra supabaseAdmin có sẵn sàng không
 */
export function checkSupabaseAdmin() {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client chưa được khởi tạo. Vui lòng kiểm tra SUPABASE_SERVICE_ROLE_KEY trong file .env.local');
    }
    return supabaseAdmin;
}

/**
 * Helper function để kiểm tra supabase client có sẵn sàng không
 */
export function checkSupabase() {
    if (!supabase) {
        throw new Error('Supabase client chưa được khởi tạo. Vui lòng kiểm tra NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY trong biến môi trường.');
    }
    return supabase;
}
