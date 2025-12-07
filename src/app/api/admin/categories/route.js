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

        return NextResponse.json({ success: true, categories: rows });
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
        const { name, slug, parent_id, status } = await request.json();
        
        if (!name) {
            return NextResponse.json({ success: false, message: 'Tên danh mục là bắt buộc.' }, { status: 400 });
        }

        const { data: result, error } = await supabaseAdmin
            .from('categories')
            .insert([{
                name,
                slug: slug || null,
                parent_id: parent_id || null,
                status: status || 'active'
            }])
            .select();

        if (error) throw error;

        return NextResponse.json({ 
            success: true, 
            message: 'Tạo danh mục thành công!', 
            categoryId: result[0].id 
        });

    } catch (error) {
        console.error('API Error - POST /api/admin/categories:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}