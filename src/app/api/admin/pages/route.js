/**
 * src/app/api/admin/pages/route.js
 * API routes cho quản lý các trang nội dung
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { slugify } from '@/lib/slugify';
import { verifyAdminAPI, errorResponse, successResponse, handleAPIError } from '@/lib/api-security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) return errorResponse('Unauthorized', 401);

    try {
        const { data: pages, error } = await supabaseAdmin
            .from('pages')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        return successResponse({ pages }, 'Lấy danh sách trang thành công');
    } catch (error) {
        return handleAPIError(error, 'GET /api/admin/pages');
    }
}

export async function POST(request) {
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) return errorResponse('Unauthorized', 401);

    try {
        const body = await request.json();
        const { title, slug, content, status } = body;

        if (!title) return errorResponse('Tiêu đề không được để trống', 400);

        const finalSlug = slug ? slugify(slug) : slugify(title);

        const { data, error } = await supabaseAdmin
            .from('pages')
            .insert([{
                title,
                slug: finalSlug,
                content: content || '',
                status: status || 'active',
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            if (error.code === '23505') return errorResponse('Slug đã tồn tại', 400);
            throw error;
        }

        return successResponse({ page: data[0] }, 'Tạo trang thành công');
    } catch (error) {
        return handleAPIError(error, 'POST /api/admin/pages');
    }
}
