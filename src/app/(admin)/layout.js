/**
 * src/app/(admin)/layout.js
 * Admin layout với authentication guard sử dụng Supabase Auth
 */
import Sidebar from "@/components/admin/Sidebar";
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

        if (!accessToken) {
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
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

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
                <Sidebar />
            </div>

            {/* Main area - no margin on mobile, ml-72 on md+ */}
            <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-72">
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