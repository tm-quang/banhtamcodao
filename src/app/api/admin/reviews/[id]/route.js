// src/app/api/admin/reviews/[id]/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Cập nhật trạng thái (Duyệt/Từ chối)
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const { status } = await request.json();

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json({ success: false, message: 'Trạng thái không hợp lệ.' }, { status: 400 });
        }

        const [result] = await pool.execute(
            'UPDATE product_reviews SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, message: 'Không tìm thấy đánh giá.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Cập nhật trạng thái thành công!' });
    } catch (error) {
        console.error('API Error - PUT /api/admin/reviews/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

// Xóa một đánh giá
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        const [result] = await pool.execute('DELETE FROM product_reviews WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, message: 'Không tìm thấy đánh giá.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Xóa đánh giá thành công!' });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/reviews/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}