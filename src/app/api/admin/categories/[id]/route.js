// src/app/api/admin/categories/[id]/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// HÀM PUT - Cập nhật danh mục
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const { name, slug, parent_id } = await request.json();

        if (!name) {
            return NextResponse.json({ success: false, message: 'Tên danh mục là bắt buộc.' }, { status: 400 });
        }

        await pool.execute(
            'UPDATE categories SET name = ?, slug = ?, parent_id = ? WHERE id = ?',
            [name, slug || null, parent_id || null, id]
        );

        return NextResponse.json({ success: true, message: 'Cập nhật danh mục thành công!' });

    } catch (error) {
        console.error('API Error - PUT /api/admin/categories/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

// HÀM DELETE - Xóa danh mục
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Xóa danh mục thành công!' });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/categories/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}