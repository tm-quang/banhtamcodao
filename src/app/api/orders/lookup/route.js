/**
 * Order lookup API route handler
 * @file src/app/api/orders/lookup/route.js
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helper';

export async function POST(request) {
    try {
        const body = await request.json();
        const searchInput = (body.searchInput || body.phoneNumber || '').trim();

        if (!searchInput) {
            return NextResponse.json({ success: false, message: 'Vui lòng nhập số điện thoại hoặc mã đơn hàng.' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Lấy đơn hàng theo số điện thoại HOẶC mã đơn hàng
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .or(`phone_number.eq.${searchInput},order_code.eq.${searchInput}`)
            .order('order_time', { ascending: false });

        if (ordersError) throw ordersError;

        if (!orders || orders.length === 0) {
            return NextResponse.json({ success: true, orders: [] });
        }

        // Lấy thông tin khách hàng dựa trên số điện thoại của đơn hàng đầu tiên tìm thấy
        const firstOrderPhone = orders[0].phone_number;
        const { data: customer } = await supabaseAdmin
            .from('customers')
            .select('id, full_name, phone_number, email, shipping_address, city, district')
            .eq('phone_number', firstOrderPhone)
            .maybeSingle();

        // Kết hợp thông tin khách hàng vào mỗi đơn hàng
        const ordersWithCustomer = orders.map(order => ({
            ...order,
            customer_name: customer?.full_name || order.recipient_name || '',
            customer_email: customer?.email || '',
            customer_address: customer?.shipping_address || order.delivery_address || '',
            customer_city: customer?.city || '',
            customer_district: customer?.district || '',
            customer_phone: customer?.phone_number || order.phone_number || ''
        }));

        return NextResponse.json({ success: true, orders: ordersWithCustomer });

    } catch (error) {
        console.error('API Error - /api/orders/lookup:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}