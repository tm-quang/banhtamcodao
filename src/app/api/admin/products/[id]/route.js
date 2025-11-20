// src/app/api/admin/products/[id]/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
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
        const finalIsSpecial = is_special ? true : false;

        const { error } = await supabase
            .from('products')
            .update({
                name,
                slug: finalSlug,
                description: finalDescription,
                image_url: finalImageUrl,
                price: parseFloat(price),
                discount_price: finalDiscountPrice,
                category_id: parseInt(category_id, 10),
                status,
                is_special: finalIsSpecial
            })
            .eq('id', id);

        if (error) throw error;

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

        const { error } = await supabase.from('products').delete().eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Xóa sản phẩm thành công!' });

    } catch (error) {
        console.error('API Error - DELETE /api/admin/products/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}