// src/app/api/admin/customers/[id]/orders/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Lấy tất cả đơn hàng của một khách hàng
export async function GET(request, { params }) {
    try {
        const { id: customerId } = params;

        // Lấy số điện thoại của khách hàng
        const [customerRows] = await pool.execute('SELECT phone_number FROM customers WHERE id = ?', [customerId]);
        if (customerRows.length === 0 || !customerRows[0].phone_number) {
            return NextResponse.json({ success: true, orders: [] }); // Trả về mảng rỗng nếu không có SĐT
        }
        const phoneNumber = customerRows[0].phone_number;
        
        // Lấy tất cả đơn hàng có SĐT đó
        const [orderRows] = await pool.execute(
            `SELECT *, 'Đã thanh toán' as payment_status FROM orders WHERE phone_number = ? ORDER BY order_time DESC`,
            [phoneNumber]
        );

        return NextResponse.json({ success: true, orders: orderRows });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}