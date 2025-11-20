// src/app/api/categories/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Lấy tất cả danh mục cho frontend
export async function GET() {
    try {
        // Thử kết nối database, nếu lỗi thì trả về dữ liệu mẫu
        const [rows] = await pool.execute('SELECT * FROM categories ORDER BY name ASC');
        
        // Xử lý encoding và format dữ liệu
        const categories = rows.map(row => ({
            id: row.id,
            name: row.name || 'Danh mục',
            slug: row.slug || 'danh-muc',
            status: row.status || 'active'
        }));
        
        return NextResponse.json({ success: true, categories }, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
    } catch (error) {
        console.error('API Error - /api/categories:', error);
        // Trả về dữ liệu mẫu nếu database lỗi
        const mockCategories = [
            { id: 1, name: 'Bánh Tằm', slug: 'banh-tam', status: 'active' },
            { id: 2, name: 'Thức Uống', slug: 'thuc-uong', status: 'active' },
            { id: 3, name: 'Tráng Miệng', slug: 'trang-mieng', status: 'active' },
            { id: 4, name: 'Món Khác', slug: 'mon-khac', status: 'active' }
        ];
        return NextResponse.json({ success: true, categories: mockCategories }, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
    }
}
