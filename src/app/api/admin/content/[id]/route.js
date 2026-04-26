/**
 * src/app/api/admin/content/[id]/route.js
 * API routes cho quản lý chi tiết đánh giá trang chủ
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminAPI, errorResponse, successResponse, handleAPIError } from '@/lib/api-security';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
    const { id } = await params;
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) return errorResponse('Unauthorized', 401);

    try {
        const body = await request.json();
        const { customer_name, content, rating, avatar_url, status, display_order } = body;

        const { data, error } = await supabaseAdmin
            .from('home_testimonials')
            .update({
                customer_name,
                content,
                rating,
                avatar_url,
                status,
                display_order,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return errorResponse('Không tìm thấy bản ghi', 404);

        return successResponse({ testimonial: data[0] }, 'Cập nhật thành công');
    } catch (error) {
        return handleAPIError(error, `PUT /api/admin/content/${id}`);
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) return errorResponse('Unauthorized', 401);

    try {
        const { error } = await supabaseAdmin
            .from('home_testimonials')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return successResponse(null, 'Xóa thành công');
    } catch (error) {
        return handleAPIError(error, `DELETE /api/admin/content/${id}`);
    }
}
