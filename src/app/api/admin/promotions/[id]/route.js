// src/app/api/admin/promotions/[id]/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Cập nhật khuyến mãi
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const data = await request.json();
        const { promo_code, title, discount_type, discount_value, min_order_value, start_date, end_date, status } = data;

        await pool.execute(
            `UPDATE promotions SET promo_code = ?, title = ?, discount_type = ?, discount_value = ?, 
             min_order_value = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?`,
            [promo_code, title, discount_type, discount_value, min_order_value || 0, start_date, end_date, status, id]
        );

        return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

// Xóa khuyến mãi
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        await pool.execute('DELETE FROM promotions WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Xóa thành công!' });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}