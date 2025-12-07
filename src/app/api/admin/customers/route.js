/**
 * src/app/api/admin/customers/route.js
 * API routes cho quản lý khách hàng
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcrypt';

/**
 * Lấy danh sách khách hàng với thống kê đơn hàng
 */
export async function GET() {
    try {
        /**
         * Lấy danh sách khách hàng với role từ customers table
         * Không join accounts vì account_id là UUID, không match với accounts.id (BIGINT)
         */
        const { data: customers, error: customersError } = await supabaseAdmin
            .from('customers')
            .select(`
                id,
                full_name,
                phone_number,
                email,
                role,
                created_at
            `)
            .order('created_at', { ascending: false });

        if (customersError) throw customersError;

        /**
         * Lấy thống kê đơn hàng cho mỗi khách hàng
         */
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select('phone_number, total_amount')
            .not('phone_number', 'is', null);

        if (ordersError) throw ordersError;

        /**
         * Tính tổng đơn và tổng chi tiêu cho mỗi khách hàng
         */
        const orderStats = {};
        orders.forEach(order => {
            if (order.phone_number) {
                if (!orderStats[order.phone_number]) {
                    orderStats[order.phone_number] = { total_orders: 0, total_spent: 0 };
                }
                orderStats[order.phone_number].total_orders += 1;
                orderStats[order.phone_number].total_spent += parseFloat(order.total_amount) || 0;
            }
        });

        /**
         * Kết hợp dữ liệu khách hàng với thống kê đơn hàng
         */
        const customersWithStats = customers.map(c => {
            const stats = orderStats[c.phone_number] || { total_orders: 0, total_spent: 0 };
            return {
                id: c.id,
                full_name: c.full_name,
                phone_number: c.phone_number,
                email: c.email,
                username: null, // Có thể lấy từ user_metadata nếu cần
                role: c.role || 'customer', // Lấy từ customers table
                status: 'active', // Default status
                created_at: c.created_at,
                total_orders: stats.total_orders,
                total_spent: stats.total_spent
            };
        });

        return NextResponse.json({ success: true, customers: customersWithStats });
    } catch (error) {
        console.error('API Error - /api/admin/customers:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Tạo khách hàng mới
 */
export async function POST(request) {
    try {
        const { username, password, full_name, phone_number, email, role, status } = await request.json();
        
        if (!username || !password || !full_name) {
            return NextResponse.json({ 
                success: false, 
                message: 'Tên đăng nhập, mật khẩu và họ tên là bắt buộc.' 
            }, { status: 400 });
        }

        /**
         * 1. Tạo tài khoản trong bảng accounts
         */
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data: accountData, error: accountError } = await supabaseAdmin
            .from('accounts')
            .insert([{
                username,
                password_hash: hashedPassword,
                role: role || 'customer',
                status: status || 'active'
            }])
            .select();

        if (accountError) throw accountError;

        const accountId = accountData[0].id;

        /**
         * 2. Tạo hồ sơ trong bảng customers
         */
        const { error: customerError } = await supabaseAdmin
            .from('customers')
            .insert([{
                account_id: accountId,
                full_name,
                phone_number: phone_number || null,
                email: email || null
            }]);

        if (customerError) throw customerError;

        return NextResponse.json({ success: true, message: 'Tạo khách hàng thành công!' });
    } catch (error) {
        console.error('API Error - POST /api/admin/customers:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Lỗi Server, có thể tên đăng nhập đã tồn tại.' 
        }, { status: 500 });
    }
}