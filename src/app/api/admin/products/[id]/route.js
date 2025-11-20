// src/app/api/admin/products/[id]/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { slugify } from '@/lib/slugify'; // <-- 1. Import hàm slugify

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const productData = await request.json();
        let { name, slug, description, image_url, price, discount_price, category_id, status, is_special } = productData;

        if (!id || !name || !price || !category_id) {
            return NextResponse.json({ success: false, message: 'Thông tin bắt buộc (ID, Tên, Giá, Danh mục) bị thiếu.' }, { status: 400 });
        }

        // --- 2. TỰ ĐỘNG TẠO SLUG NẾU BỊ TRỐNG ---
        const finalSlug = slug ? slugify(slug) : slugify(name);
        
        const finalDescription = description || null;
        const finalImageUrl = image_url || null;
        const finalDiscountPrice = discount_price ? parseFloat(discount_price) : null;
        const finalIsSpecial = is_special ? 1 : 0;
        
        const [result] = await pool.execute(
            `UPDATE products SET 
                name = ?, slug = ?, description = ?, image_url = ?, price = ?, 
                discount_price = ?, category_id = ?, status = ?, is_special = ?
             WHERE id = ?`,
            [
                name, 
                finalSlug, // <-- Sử dụng finalSlug
                finalDescription, 
                finalImageUrl, 
                parseFloat(price), 
                finalDiscountPrice, 
                parseInt(category_id, 10), 
                status, 
                finalIsSpecial, 
                id
            ]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, message: 'Không tìm thấy sản phẩm để cập nhật.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Cập nhật sản phẩm thành công!' });

    } catch (error) {
        console.error('API Error - PUT /api/admin/products/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server', error: error.message }, { status: 500 });
    }
}
// HÀM DELETE - Xóa sản phẩm (Giữ nguyên)
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, message: 'Không tìm thấy sản phẩm để xóa.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Xóa sản phẩm thành công!' });

    } catch (error) {
        console.error('API Error - DELETE /api/admin/products/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}