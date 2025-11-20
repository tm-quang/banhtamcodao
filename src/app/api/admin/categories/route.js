// src/app/api/admin/categories/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Lấy tất cả danh mục (giữ nguyên)
export async function GET() {
    try {
        const [rows] = await pool.execute('SELECT * FROM categories ORDER BY name ASC');
        return NextResponse.json({ success: true, categories: rows });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

// --- THÊM HÀM POST ĐỂ TẠO MỚI DANH MỤC ---
export async function POST(request) {
    try {
        const { name, slug, parent_id } = await request.json();
        if (!name) {
            return NextResponse.json({ success: false, message: 'Tên danh mục là bắt buộc.' }, { status: 400 });
        }

        const [result] = await pool.execute(
            'INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)',
            [name, slug || null, parent_id || null]
        );

        return NextResponse.json({ success: true, message: 'Tạo danh mục thành công!', categoryId: result.insertId });

    } catch (error) {
        console.error('API Error - POST /api/admin/categories:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}