/**
 * src/app/api/admin/categories/[id]/route.js
 * API routes cho cập nhật và xóa danh mục theo ID
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Cập nhật danh mục
 */
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const { name, slug, parent_id, status } = await request.json();

        if (!name) {
            return NextResponse.json({ success: false, message: 'Tên danh mục là bắt buộc.' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('categories')
            .update({
                name,
                slug: slug || null,
                parent_id: parent_id || null,
                status: status || 'active'
            })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Cập nhật danh mục thành công!' });

    } catch (error) {
        console.error('API Error - PUT /api/admin/categories/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Xóa danh mục
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        
        const { error } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Xóa danh mục thành công!' });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/categories/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}