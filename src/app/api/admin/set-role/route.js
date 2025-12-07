/**
 * src/app/api/admin/set-role/route.js
 * API endpoint để gán role cho user (chỉ admin mới có quyền)
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helper';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Helper để verify admin session
 */
async function verifyAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
        return { error: 'Unauthorized', user: null };
    }

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
        return { error: 'Unauthorized', user: null };
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

    if (customer?.role !== 'admin') {
        return { error: 'Forbidden - Admin only', user: null };
    }

    return { error: null, user };
}

/**
 * POST /api/admin/set-role
 * Gán role cho user
 */
export async function POST(request) {
    try {
        /**
         * Verify admin
         */
        const { error: authError, user: adminUser } = await verifyAdmin();
        if (authError || !adminUser) {
            return NextResponse.json({ 
                success: false, 
                message: authError === 'Forbidden - Admin only' 
                    ? 'Chỉ admin mới có quyền thực hiện thao tác này.' 
                    : 'Unauthorized' 
            }, { status: authError === 'Forbidden - Admin only' ? 403 : 401 });
        }

        const body = await request.json();
        const { email, role } = body;

        if (!email || !role) {
            return NextResponse.json({ 
                success: false, 
                message: 'Vui lòng cung cấp email và role.' 
            }, { status: 400 });
        }

        if (!['admin', 'customer'].includes(role)) {
            return NextResponse.json({ 
                success: false, 
                message: 'Role không hợp lệ. Chỉ chấp nhận: admin, customer.' 
            }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        /**
         * Tìm user trong Supabase Auth
         */
        let authUser = null;
        
        try {
            // Thử dùng getUserByEmail nếu có
            if (supabaseAdmin.auth.admin.getUserByEmail) {
                const result = await supabaseAdmin.auth.admin.getUserByEmail(email);
                if (result?.data?.user) {
                    authUser = result.data;
                }
            } else {
                // Nếu không có, dùng listUsers và filter
                const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                if (!listError && usersData?.users) {
                    const foundUser = usersData.users.find(u => u.email === email);
                    if (foundUser) {
                        authUser = { user: foundUser };
                    }
                }
            }
        } catch (checkError) {
            console.error('Error finding user:', checkError);
        }

        if (!authUser?.user) {
            return NextResponse.json({ 
                success: false, 
                message: `Không tìm thấy user với email: ${email}` 
            }, { status: 404 });
        }

        const userId = authUser.user.id;

        /**
         * Cập nhật role trong customers table
         * account_id là UUID từ Supabase Auth
         */
        const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('id, role')
            .eq('account_id', userId)
            .maybeSingle();

        if (existingCustomer) {
            /**
             * Cập nhật role trong customers table
             */
            const { error: updateError } = await supabaseAdmin
                .from('customers')
                .update({ role: role })
                .eq('account_id', userId);

            if (updateError) {
                throw updateError;
            }
        } else {
            /**
             * Nếu không tìm thấy customer, có thể user chưa có profile
             * Tạo customer record với role
             */
            const { error: insertError } = await supabaseAdmin
                .from('customers')
                .insert([
                    {
                        account_id: userId,
                        full_name: authUser.user.user_metadata?.full_name || email.split('@')[0],
                        email: email,
                        role: role
                    }
                ]);

            if (insertError) {
                throw insertError;
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Đã gán role '${role}' cho user ${email}` 
        });

    } catch (error) {
        console.error('Set role error:', error);
        return NextResponse.json({ 
            success: false, 
            message: process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'Lỗi server' 
        }, { status: 500 });
    }
}

