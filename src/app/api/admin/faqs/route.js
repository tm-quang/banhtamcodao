/**
 * src/app/api/admin/faqs/route.js
 * API routes cho quản lý các câu hỏi thường gặp (FAQs)
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminAPI, errorResponse, successResponse, handleAPIError } from '@/lib/api-security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) return errorResponse('Unauthorized', 401);

    try {
        const { data: faqs, error } = await supabaseAdmin
            .from('faqs')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('id', { ascending: false });

        if (error) throw error;

        return successResponse({ faqs }, 'Lấy danh sách FAQs thành công');
    } catch (error) {
        return handleAPIError(error, 'GET /api/admin/faqs');
    }
}

export async function POST(request) {
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) return errorResponse('Unauthorized', 401);

    try {
        const body = await request.json();
        const { question, answer, sort_order, status } = body;

        if (!question) return errorResponse('Câu hỏi không được để trống', 400);

        const { data, error } = await supabaseAdmin
            .from('faqs')
            .insert([{
                question,
                answer: answer || '',
                sort_order: parseInt(sort_order) || 0,
                status: status || 'active'
            }])
            .select();

        if (error) throw error;

        return successResponse({ faq: data[0] }, 'Thêm câu hỏi thành công');
    } catch (error) {
        return handleAPIError(error, 'POST /api/admin/faqs');
    }
}
