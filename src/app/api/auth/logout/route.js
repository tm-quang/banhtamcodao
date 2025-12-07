/**
 * src/app/api/auth/logout/route.js
 * API route cho đăng xuất sử dụng Supabase Auth
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const cookieStore = await cookies();

        const accessToken = cookieStore.get('sb-access-token')?.value;

        /**
         * Nếu có access token, gọi signOut từ Supabase
         */
        if (accessToken) {
            const supabase = createClient(supabaseUrl, supabaseAnonKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                },
                global: {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            });

            await supabase.auth.signOut();
        }

        /**
         * Xóa cookies
         */
        cookieStore.delete('sb-access-token');
        cookieStore.delete('sb-refresh-token');
        cookieStore.delete('sessionToken'); // Xóa cookie cũ nếu còn

        return NextResponse.json({ success: true, message: 'Đăng xuất thành công.' });
    } catch (error) {
        console.error('Logout error:', error);
        const cookieStore = await cookies();
        cookieStore.delete('sb-access-token');
        cookieStore.delete('sb-refresh-token');
        return NextResponse.json({ success: true, message: 'Đăng xuất thành công.' });
    }
}