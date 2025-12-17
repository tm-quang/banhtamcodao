/**
 * src/lib/supabase-client.js
 * Client-side Supabase client (only uses public env vars)
 * Safe to import in 'use client' components
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Tạo Supabase client với anon key (cho client-side và public operations)
 * This is safe to use in client components
 */
const supabase = supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Kiểm tra và cảnh báo nếu thiếu cấu hình
 */
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY chưa được cấu hình');
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

export default supabase;
