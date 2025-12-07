/**
 * src/app/api/admin/customers/[id]/orders/route.js
 * API route để lấy tất cả đơn hàng của một khách hàng
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy tất cả đơn hàng của một khách hàng
 */
export async function GET(request, { params }) {
    try {
        const { id: customerId } = params;

        /**
         * Lấy số điện thoại của khách hàng
         */
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('phone_number')
            .eq('id', customerId)
            .single();

        if (customerError || !customer || !customer.phone_number) {
            return NextResponse.json({ success: true, orders: [] });
        }

        const phoneNumber = customer.phone_number;

        /**
         * Lấy tất cả đơn hàng có SĐT đó
         */
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('phone_number', phoneNumber)
            .order('order_time', { ascending: false });

        if (ordersError) throw ordersError;

        /**
         * Thêm payment_status mặc định
         */
        const ordersWithStatus = orders.map(order => ({
            ...order,
            payment_status: 'Đã thanh toán'
        }));

        return NextResponse.json({ success: true, orders: ordersWithStatus });
    } catch (error) {
        console.error('API Error - GET /api/admin/customers/[id]/orders:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}