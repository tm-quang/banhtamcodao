// src/app/api/admin/promotions/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Lấy tất cả khuyến mãi
export async function GET() {
    try {
        const [rows] = await pool.execute('SELECT * FROM promotions ORDER BY end_date DESC');
        return NextResponse.json({ success: true, promotions: rows });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

// Thêm khuyến mãi mới
export async function POST(request) {
    try {
        const data = await request.json();
        const { promo_code, title, discount_type, discount_value, min_order_value, start_date, end_date, status } = data;

        if (!promo_code || !title || !discount_type || !discount_value || !start_date || !end_date) {
            return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ các trường bắt buộc.' }, { status: 400 });
        }

        await pool.execute(
            `INSERT INTO promotions (promo_code, title, discount_type, discount_value, min_order_value, start_date, end_date, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [promo_code, title, discount_type, discount_value, min_order_value || 0, start_date, end_date, status || 'active']
        );

        return NextResponse.json({ success: true, message: 'Tạo khuyến mãi thành công!' });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}