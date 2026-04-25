/**
 * src/app/(admin)/layout.js
 * Admin layout với authentication guard sử dụng Supabase Auth
 */
export const dynamic = 'force-dynamic';

import SidebarSwitcher from "@/components/SidebarSwitcher";
import AdminHeader from "@/components/admin/AdminHeader";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-helper';

export default async function AdminLayout({ children }) {
    /**
     * Guard: only allow authenticated admin
     */
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const cookieStore = await cookies();

        const accessToken = cookieStore.get('sb-access-token')?.value;
        const refreshToken = cookieStore.get('sb-refresh-token')?.value;

        if (!accessToken && !refreshToken) {
            redirect('/login?next=/admin');
        }

        /**
         * Tạo Supabase client và verify session
         */
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

        // Set session nếu có cả access token và refresh token
        if (accessToken && refreshToken) {
            await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
        }

        let { data: { user }, error: authError } = await supabase.auth.getUser();

        // Nếu access token hết hạn, thử refresh
        if ((authError || !user) && refreshToken) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession({
                refresh_token: refreshToken
            });

            if (!refreshError && session) {
                // Cập nhật cookies với session mới
                cookieStore.set('sb-access-token', session.access_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 30,
                    path: '/',
                });
                cookieStore.set('sb-refresh-token', session.refresh_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 30,
                    path: '/',
                });

                // Lấy user lại sau khi refresh
                const { data: { user: refreshedUser }, error: refreshedError } = await supabase.auth.getUser();
                if (!refreshedError && refreshedUser) {
                    user = refreshedUser;
                    authError = null;
                }
            }
        }

        if (authError || !user) {
            redirect('/login?next=/admin');
        }

        /**
         * Kiểm tra role từ customers table
         * account_id là UUID từ Supabase Auth user.id
         */
        const supabaseAdmin = getSupabaseAdmin();
        const { data: customer } = await supabaseAdmin
            .from('customers')
            .select('role')
            .eq('account_id', user.id)
            .maybeSingle();

        const role = customer?.role || 'customer';

        if (role !== 'admin') {
            redirect('/');
        }
    } catch (e) {
        console.error('Admin layout auth error:', e);
        redirect('/login?next=/admin');
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar - Fixed on left, hidden on mobile */}
            <div className="fixed left-0 top-0 h-screen z-40 hidden md:block">
                <SidebarSwitcher />
            </div>

            {/* Main area - no margin on mobile, ml-72 on md+ */}
            <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-52 mb-4">
                {/* Header - Sticky at top */}
                <div className="sticky top-0 z-30 bg-white shadow-sm">
                    <AdminHeader />
                </div>

                {/* Scrollable content area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}