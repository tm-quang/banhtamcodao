// src/app/api/admin/reviews/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Lấy tất cả các đánh giá
export async function GET() {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                pr.id, 
                pr.product_id,
                p.name as product_name,  -- Lấy tên sản phẩm từ bảng products
                pr.customer_name, 
                pr.rating, 
                pr.comment, 
                pr.status, 
                pr.created_at
            FROM product_reviews pr
            LEFT JOIN products p ON pr.product_id = p.id
            ORDER BY pr.created_at DESC
        `);
        return NextResponse.json({ success: true, reviews: rows });
    } catch (error) {
        console.error('API Error - GET /api/admin/reviews:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}