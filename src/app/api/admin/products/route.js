// src/app/api/admin/products/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { slugify } from '@/lib/slugify';

export async function GET(request) {
    try {
        // --- SỬA LỖI TẠI ĐÂY: Thêm các trường slug, description, category_id vào câu truy vấn ---
        const [rows] = await pool.execute(`
            SELECT 
                p.id, 
                p.name, 
                p.slug,                 -- Thêm slug
                p.description,          -- Thêm description
                p.price, 
                p.discount_price,
                p.status, 
                p.image_url, 
                p.is_special,
                p.category_id,          -- Thêm category_id
                c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id DESC
        `);

        return NextResponse.json({ success: true, products: rows });

    } catch (error) {
        console.error('API Error - /api/admin/products:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const productData = await request.json();
        let { name, slug, description, image_url, price, discount_price, category_id, status, is_special } = productData;

        if (!name || !price || !category_id) {
            return NextResponse.json({ success: false, message: 'Tên, giá và danh mục là bắt buộc.' }, { status: 400 });
        }
        
        const finalSlug = slug ? slugify(slug) : slugify(name);

        price = parseFloat(price);
        discount_price = discount_price ? parseFloat(discount_price) : null;
        category_id = parseInt(category_id, 10);
        is_special = is_special ? 1 : 0;
        status = status || 'active';

        const [result] = await pool.execute(
            `INSERT INTO products (name, slug, description, image_url, price, discount_price, category_id, status, is_special) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, finalSlug, description, image_url, price, discount_price, category_id, status, is_special]
        );

        return NextResponse.json({ success: true, message: 'Thêm sản phẩm thành công!', productId: result.insertId });

    } catch (error) {
        console.error('API Error - POST /api/admin/products:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server', error: error.message }, { status: 500 });
    }
}