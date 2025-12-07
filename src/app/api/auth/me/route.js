/**
 * src/app/api/auth/me/route.js
 * API routes cho lấy và cập nhật thông tin người dùng sử dụng Supabase Auth
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helper';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Helper để tạo Supabase client với session từ cookies
 */
async function createSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

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

    if (accessToken && refreshToken) {
        await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });
    }

    return supabase;
}

/**
 * Lấy thông tin người dùng đang đăng nhập
 */
export async function GET(request) {
    try {
        const supabase = await createSupabaseClient();

        /**
         * Lấy user từ Supabase Auth session
         */
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        /**
         * Lấy thông tin từ customers table
         * account_id là UUID từ Supabase Auth user.id
         */
        const supabaseAdmin = getSupabaseAdmin();
        const { data: customers, error } = await supabaseAdmin
            .from('customers')
            .select(`
                id, full_name, phone_number, email, 
                shipping_address, city, district, reward_points, role, created_at
            `)
            .eq('account_id', authUser.id)
            .maybeSingle();

        if (error) throw error;

        if (!customers) {
            return NextResponse.json({ success: false, message: 'User profile not found.' }, { status: 404 });
        }

        /**
         * Lấy thống kê đơn hàng của khách hàng này
         */
        let orderStats = {
            total_orders: 0,
            successful_orders: 0,
            cancelled_orders: 0,
            total_spent: 0,
            pending_orders: 0
        };

        // Tìm đơn hàng theo phone_number vì orders lưu customer_phone
        if (customers.phone_number) {
            const { data: orders, error: ordersError } = await supabaseAdmin
                .from('orders')
                .select('id, status, total_amount')
                .eq('customer_phone', customers.phone_number);

            if (!ordersError && orders) {
                orderStats.total_orders = orders.length;
                orders.forEach(order => {
                    const status = order.status?.toLowerCase();
                    if (status === 'delivered' || status === 'completed' || status === 'giao thành công') {
                        orderStats.successful_orders++;
                        orderStats.total_spent += order.total_amount || 0;
                    } else if (status === 'cancelled' || status === 'đã hủy') {
                        orderStats.cancelled_orders++;
                    } else if (status === 'pending' || status === 'processing' || status === 'chờ xác nhận' || status === 'đang xử lý') {
                        orderStats.pending_orders++;
                    }
                });
            }
        }

        /**
         * Xác định membership level dựa trên tổng chi tiêu
         */
        let membershipLevel = 'Thành viên thân thiết';
        if (orderStats.total_spent >= 5000000) {
            membershipLevel = 'Thành viên VIP';
        } else if (orderStats.total_spent >= 2000000) {
            membershipLevel = 'Thành viên Vàng';
        } else if (orderStats.total_spent >= 500000) {
            membershipLevel = 'Thành viên Bạc';
        }

        /**
         * Lấy username từ user_metadata của Supabase Auth
         */
        const username = authUser.user_metadata?.username || null;

        const user = {
            id: customers.id,
            username: username,
            full_name: customers.full_name,
            phone_number: customers.phone_number,
            email: customers.email || authUser.email,
            shipping_address: customers.shipping_address,
            city: customers.city,
            district: customers.district,
            role: customers.role || 'customer',
            reward_points: customers.reward_points || 0,
            created_at: customers.created_at,
            // Thêm thống kê đơn hàng
            total_orders: orderStats.total_orders,
            successful_orders: orderStats.successful_orders,
            cancelled_orders: orderStats.cancelled_orders,
            pending_orders: orderStats.pending_orders,
            total_spent: orderStats.total_spent,
            membership_level: membershipLevel
        };

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Get user error:', error);

        // Chỉ xóa cookies khi lỗi thực sự liên quan đến authentication
        // Không xóa session khi lỗi database hoặc lỗi khác
        const isAuthError = error.message?.includes('JWT') ||
            error.message?.includes('session') ||
            error.message?.includes('token') ||
            error.message?.includes('Unauthorized');

        if (isAuthError) {
            const cookieStore = await cookies();
            cookieStore.delete('sb-access-token');
            cookieStore.delete('sb-refresh-token');
            return NextResponse.json({ success: false, message: 'Invalid session.' }, { status: 401 });
        }

        // Với các lỗi khác (database, network, etc.), trả về lỗi server nhưng không đăng xuất user
        return NextResponse.json({
            success: false,
            message: 'Lỗi khi lấy thông tin tài khoản. Vui lòng thử lại.'
        }, { status: 500 });
    }
}

/**
 * Cập nhật thông tin người dùng
 */
export async function PUT(request) {
    try {
        const supabase = await createSupabaseClient();

        /**
         * Lấy user từ Supabase Auth session
         */
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        const body = await request.json();
        const { fullName, phone, email, address, city, district, newPassword } = body;

        /**
         * Cập nhật bảng customers
         */
        const { error: updateCustomerError } = await supabaseAdmin
            .from('customers')
            .update({
                full_name: fullName,
                phone_number: phone,
                email: email,
                shipping_address: address,
                city: city,
                district: district
            })
            .eq('account_id', authUser.id);

        if (updateCustomerError) throw updateCustomerError;

        /**
         * Nếu có mật khẩu mới, cập nhật password trong Supabase Auth
         */
        if (newPassword) {
            const { error: updatePasswordError } = await supabaseAdmin.auth.admin.updateUserById(
                authUser.id,
                { password: newPassword }
            );

            if (updatePasswordError) throw updatePasswordError;
        }

        /**
         * Cập nhật email trong Supabase Auth nếu có thay đổi
         */
        if (email && email !== authUser.email) {
            const { error: updateEmailError } = await supabaseAdmin.auth.admin.updateUserById(
                authUser.id,
                { email: email }
            );

            if (updateEmailError) {
                console.warn('Could not update email in Auth:', updateEmailError);
            }
        }

        return NextResponse.json({ success: true, message: 'Cập nhật thông tin thành công!' });
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json({
            success: false,
            message: process.env.NODE_ENV === 'development' ? error.message : 'Lỗi Server'
        }, { status: 500 });
    }
}