// src/app/api/admin/orders/[id]/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = params;

        const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order: rows[0] });

    } catch (error) {
        console.error('API Error - GET /api/admin/orders/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}
// --- HÀM MỚI: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG ---
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();

        // Lấy các trường có thể cập nhật từ body
        const { status, payment_status, recipient_name, phone_number, delivery_address, note } = body;

        // Xây dựng câu lệnh UPDATE động
        const fieldsToUpdate = [];
        const values = [];

        if (status) {
            fieldsToUpdate.push('status = ?');
            values.push(status);
        }
        if (payment_status) {
            fieldsToUpdate.push('payment_status = ?');
            values.push(payment_status);
        }
        // Thêm các trường khác nếu cần
        if (recipient_name) {
            fieldsToUpdate.push('recipient_name = ?');
            values.push(recipient_name);
        }
        if (phone_number) {
            fieldsToUpdate.push('phone_number = ?');
            values.push(phone_number);
        }
        if (delivery_address) {
            fieldsToUpdate.push('delivery_address = ?');
            values.push(delivery_address);
        }
         if (note) {
            fieldsToUpdate.push('note = ?');
            values.push(note);
        }

        if (fieldsToUpdate.length === 0) {
            return NextResponse.json({ success: false, message: 'Không có thông tin nào để cập nhật.' }, { status: 400 });
        }

        const query = `UPDATE orders SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        values.push(id);

        await pool.execute(query, values);

        return NextResponse.json({ success: true, message: 'Cập nhật đơn hàng thành công!' });
    } catch (error) {
         console.error('API Error - PUT /api/admin/orders/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

// --- HÀM MỚI: XÓA ĐƠN HÀNG ---
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        const [result] = await pool.execute('DELETE FROM orders WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Xóa đơn hàng thành công!' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}