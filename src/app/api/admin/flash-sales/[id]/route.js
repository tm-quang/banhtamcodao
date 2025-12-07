/**
 * src/app/api/admin/flash-sales/[id]/route.js
 * API routes cho cập nhật và xóa Flash Sale (Admin)
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy chi tiết Flash Sale theo ID
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const { data: flashSale, error } = await supabaseAdmin
            .from('flash_sales')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!flashSale) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy Flash Sale'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, flashSale });
    } catch (error) {
        console.error('API Error - GET /api/admin/flash-sales/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Cập nhật Flash Sale
 */
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const data = await request.json();

        const {
            name,
            description,
            badge_text,
            badge_color,
            discount_value,
            discount_type,
            image_url,
            link_url,
            start_date,
            end_date,
            priority,
            status
        } = data;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (badge_text !== undefined) updateData.badge_text = badge_text;
        if (badge_color !== undefined) updateData.badge_color = badge_color;
        if (discount_value !== undefined) updateData.discount_value = parseInt(discount_value);
        if (discount_type !== undefined) updateData.discount_type = discount_type;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (link_url !== undefined) updateData.link_url = link_url;
        if (start_date !== undefined) updateData.start_date = start_date;
        if (end_date !== undefined) updateData.end_date = end_date;
        if (priority !== undefined) updateData.priority = parseInt(priority);
        if (status !== undefined) updateData.status = status;

        const { data: updatedFlashSale, error } = await supabaseAdmin
            .from('flash_sales')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Cập nhật Flash Sale thành công!',
            flashSale: updatedFlashSale
        });
    } catch (error) {
        console.error('API Error - PUT /api/admin/flash-sales/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Xóa Flash Sale
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const { error } = await supabaseAdmin
            .from('flash_sales')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Xóa Flash Sale thành công!'
        });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/flash-sales/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}
