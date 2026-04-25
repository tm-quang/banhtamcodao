/**
 * src/app/api/admin/settings/route.js
 * API routes cho quản lý cài đặt hệ thống
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminAPI, errorResponse, successResponse, handleAPIError } from '@/lib/api-security';

export const dynamic = 'force-dynamic';

/**
 * Lấy tất cả cài đặt
 */
export async function GET(request) {
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) return errorResponse('Unauthorized', 401);

    try {
        const { data: settings, error } = await supabaseAdmin
            .from('site_settings')
            .select('*');

        if (error) throw error;

        // Chuyển đổi sang dạng object để dễ dùng ở frontend
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });

        return successResponse({ settings: settingsMap }, 'Lấy cài đặt thành công');
    } catch (error) {
        return handleAPIError(error, 'GET /api/admin/settings');
    }
}

/**
 * Cập nhật một nhóm cài đặt
 */
export async function POST(request) {
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) return errorResponse('Unauthorized', 401);

    try {
        const { key, value } = await request.json();

        if (!key || !value) {
            return errorResponse('Thiếu key hoặc giá trị cài đặt', 400);
        }

        const { data, error } = await supabaseAdmin
            .from('site_settings')
            .upsert({
                key,
                value,
                updated_at: new Date().toISOString()
            })
            .select();

        if (error) throw error;

        return successResponse({ data: data[0] }, `Cập nhật cài đặt ${key} thành công`);
    } catch (error) {
        return handleAPIError(error, 'POST /api/admin/settings');
    }
}
