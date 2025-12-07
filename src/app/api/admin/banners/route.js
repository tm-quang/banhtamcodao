/**
 * src/app/api/admin/banners/route.js
 * API routes cho quản lý banners
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy danh sách banners
 */
export async function GET() {
    try {
        const { data: rows, error } = await supabaseAdmin
            .from('banners')
            .select('id, title, image_url, link_url, position, sort_order, active, display_seconds, start_date, end_date, show_once')
            .order('position', { ascending: true })
            .order('sort_order', { ascending: true })
            .order('id', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, banners: rows });
    } catch (error) {
        console.error('API Error - GET /api/admin/banners:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Tạo banner mới
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { title, image_url, link_url, position, sort_order, active, display_seconds, start_date, end_date, show_once } = body;
        
        if (!image_url) {
            return NextResponse.json({ success: false, message: 'Thiếu ảnh banner.' }, { status: 400 });
        }

        const { data: result, error } = await supabaseAdmin
            .from('banners')
            .insert([{
                title: title || null,
                image_url,
                link_url: link_url || null,
                position: position || 'home',
                sort_order: sort_order || 0,
                active: active ? true : false,
                display_seconds: display_seconds || null,
                start_date: start_date || null,
                end_date: end_date || null,
                show_once: show_once ? true : false
            }])
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, id: result[0].id });
    } catch (error) {
        console.error('API Error - POST /api/admin/banners:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}


