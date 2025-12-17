/**
 * src/lib/supabase-server.js
 * Server-side Supabase client (uses private env vars)
 * ONLY import in Server Components, Server Actions, or API Routes
 * NEVER import in 'use client' components
 * 
 * Note: This file does NOT use 'use server' directive because it's not a Server Actions file.
 * It's a utility module that can be imported in API routes and Server Components.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Tạo Supabase client với anon key (cho server-side public operations)
 */
const supabase = supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Tạo Supabase client với service role key (cho server-side admin operations)
 * Service role key bypasses Row Level Security (RLS)
 * ⚠️ NEVER expose this to client-side code
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

// Export clients only - helper functions are in supabase-helpers.js
export default supabase;
export { supabaseAdmin };
