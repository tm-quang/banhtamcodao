/**
 * src/app/api/admin/categories/route.js
 * API routes cho quản lý danh mục sản phẩm
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy tất cả danh mục
 */
export async function GET() {
    try {
        const { data: rows, error } = await supabaseAdmin
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        const categoriesWithActive = rows.map(cat => ({
            ...cat,
            active: cat.status === 'active'
        }));

        return NextResponse.json({ success: true, categories: categoriesWithActive });
    } catch (error) {
        console.error('API Error - GET /api/admin/categories:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Tạo danh mục mới
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, slug, parent_id, status, active } = body;
        
        if (!name) {
            return NextResponse.json({ success: false, message: 'Tên danh mục là bắt buộc.' }, { status: 400 });
        }

        // Use status if provided, or map from active, or default to 'active'
        const finalStatus = status || (active === false ? 'inactive' : 'active');

        const { data: result, error } = await supabaseAdmin
            .from('categories')
            .insert([{
                name,
                slug: slug || null,
                parent_id: parent_id || null,
                status: finalStatus
            }])
            .select();

        if (error) {
            console.error('Supabase Error creating category:', error);
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Tạo danh mục thành công!', 
            categoryId: result?.[0]?.id 
        });

    } catch (error) {
        console.error('API Error - POST /api/admin/categories:', error);
        return NextResponse.json({ success: false, message: error.message || 'Lỗi Server' }, { status: 500 });
    }
}