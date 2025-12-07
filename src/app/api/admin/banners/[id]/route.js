/**
 * src/app/api/admin/banners/[id]/route.js
 * API routes cho cập nhật và xóa banner theo ID
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Cập nhật banner
 */
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { title, image_url, link_url, position, sort_order, active, display_seconds, start_date, end_date, show_once } = body;

        /**
         * Xây dựng object update chỉ với các field được cung cấp
         */
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (link_url !== undefined) updateData.link_url = link_url;
        if (position !== undefined) updateData.position = position;
        if (sort_order !== undefined) updateData.sort_order = sort_order;
        if (active !== undefined) updateData.active = active ? true : false;
        if (display_seconds !== undefined) updateData.display_seconds = display_seconds;
        if (start_date !== undefined) updateData.start_date = start_date;
        if (end_date !== undefined) updateData.end_date = end_date;
        if (show_once !== undefined) updateData.show_once = show_once ? true : false;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: false, message: 'No changes' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('banners')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error - PUT /api/admin/banners/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Xóa banner
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        
        const { error } = await supabaseAdmin
            .from('banners')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/banners/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}


