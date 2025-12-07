/**
 * src/app/api/admin/orders/route.js
 * API routes cho quản lý đơn hàng
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
    try {
        // Lấy thêm các cột mới
        const { data: rows, error } = await supabaseAdmin
            .from('orders')
            .select(`
                id, 
                order_code, 
                recipient_name, 
                phone_number, 
                delivery_address, 
                total_amount, 
                status, 
                order_time,
                delivery_method,
                payment_status
            `)
            .order('order_time', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, orders: rows });
    } catch (error) {
        console.error('API Error - /api/admin/orders:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}