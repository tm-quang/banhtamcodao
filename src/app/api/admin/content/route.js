/**
 * src/app/api/admin/content/route.js
 * API routes cho quản lý nội dung đánh giá trang chủ (home_testimonials)
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminAPI, errorResponse, successResponse, handleAPIError } from '@/lib/api-security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) return errorResponse('Unauthorized', 401);

    try {
        const { data: testimonials, error } = await supabaseAdmin
            .from('home_testimonials')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;

        return successResponse({ testimonials }, 'Lấy danh sách đánh giá trang chủ thành công');
    } catch (error) {
        return handleAPIError(error, 'GET /api/admin/content');
    }
}

export async function POST(request) {
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) return errorResponse('Unauthorized', 401);

    try {
        const body = await request.json();
        const { customer_name, content, rating, avatar_url, status, display_order } = body;

        if (!customer_name || !content) {
            return errorResponse('Tên khách hàng và nội dung không được để trống', 400);
        }

        const { data, error } = await supabaseAdmin
            .from('home_testimonials')
            .insert([{
                customer_name,
                content,
                rating: rating || 5,
                avatar_url,
                status: status || 'active',
                display_order: display_order || 0,
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;

        return successResponse({ testimonial: data[0] }, 'Tạo đánh giá thành công');
    } catch (error) {
        return handleAPIError(error, 'POST /api/admin/content');
    }
}
