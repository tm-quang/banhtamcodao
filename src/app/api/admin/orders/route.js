// src/app/api/admin/orders/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
    try {
        // Lấy thêm các cột mới
        const [rows] = await pool.execute(
            `SELECT 
                id, 
                order_code, 
                recipient_name, 
                phone_number, 
                delivery_address, 
                total_amount, 
                status, 
                order_time,
                delivery_method,  -- Thêm cột này
                payment_status    -- Thêm cột này
             FROM orders 
             ORDER BY order_time DESC`
        );
        return NextResponse.json({ success: true, orders: rows });
    } catch (error) {
        console.error('API Error - /api/admin/orders:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}