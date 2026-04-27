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
        const { id } = await params;
        const body = await request.json();
        const { name, slug, parent_id, status, active } = body;

        if (!name) {
            return NextResponse.json({ success: false, message: 'Tên danh mục là bắt buộc.' }, { status: 400 });
        }

        // Use status if provided, or map from active, or default to 'active'
        const finalStatus = status || (active === false ? 'inactive' : 'active');

        const { error } = await supabaseAdmin
            .from('categories')
            .update({
                name,
                slug: slug || null,
                parent_id: parent_id || null,
                status: finalStatus
            })
            .eq('id', id);

        if (error) {
            console.error('Supabase Error updating category:', error);
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Cập nhật danh mục thành công!' });

    } catch (error) {
        console.error('API Error - PUT /api/admin/categories/[id]:', error);
        return NextResponse.json({ success: false, message: error.message || 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Xóa danh mục
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        
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