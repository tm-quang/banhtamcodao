// src/app/api/orders/lookup/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const { phoneNumber } = await request.json();

        if (!phoneNumber) {
            return NextResponse.json({ success: false, message: 'Vui lòng nhập số điện thoại.' }, { status: 400 });
        }

        const [rows] = await pool.execute(
            `SELECT * FROM orders WHERE phone_number = ? ORDER BY order_time DESC`,
            [phoneNumber]
        );

        return NextResponse.json({ success: true, orders: rows });

    } catch (error) {
        console.error('API Error - /api/orders/lookup:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}