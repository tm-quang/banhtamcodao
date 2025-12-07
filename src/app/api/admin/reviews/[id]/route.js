/**
 * src/app/api/admin/reviews/[id]/route.js
 * API routes cho cập nhật và xóa đánh giá theo ID
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Cập nhật trạng thái đánh giá (Duyệt/Từ chối)
 */
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const { status } = await request.json();

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json({ 
                success: false, 
                message: 'Trạng thái không hợp lệ.' 
            }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('product_reviews')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: 'Không tìm thấy đánh giá.' 
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Cập nhật trạng thái thành công!' });
    } catch (error) {
        console.error('API Error - PUT /api/admin/reviews/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Xóa một đánh giá
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        
        const { data, error } = await supabaseAdmin
            .from('product_reviews')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: 'Không tìm thấy đánh giá.' 
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Xóa đánh giá thành công!' });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/reviews/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}