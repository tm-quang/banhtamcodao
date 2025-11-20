// src/app/api/admin/products/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { slugify } from '@/lib/slugify';

export async function GET(request) {
    try {
        const { data: rows, error } = await supabase
            .from('products')
            .select(`
id, name, slug, description, price, discount_price,
    status, image_url, is_special, category_id,
    categories(name)
        `)
            .order('id', { ascending: false });

        if (error) throw error;

        const products = rows.map(p => ({
            ...p,
            category_name: p.categories?.name,
            price: parseFloat(p.price),
            discount_price: p.discount_price ? parseFloat(p.discount_price) : null,
        })).map(p => {
            delete p.categories;
            return p;
        });

        return NextResponse.json({ success: true, products });

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
        is_special = is_special ? true : false;
        status = status || 'active';

        const { data: result, error } = await supabase
            .from('products')
            .insert([{
                name,
                slug: finalSlug,
                description,
                image_url,
                price,
                discount_price,
                category_id,
                status,
                is_special
            }])
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Thêm sản phẩm thành công!', productId: result[0].id });

    } catch (error) {
        console.error('API Error - POST /api/admin/products:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server', error: error.message }, { status: 500 });
    }
}