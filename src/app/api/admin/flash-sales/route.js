/**
 * src/app/api/admin/flash-sales/route.js
 * API routes cho quản lý Flash Sale (Admin)
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy tất cả Flash Sales
 */
export async function GET() {
    try {
        const { data: rows, error } = await supabaseAdmin
            .from('flash_sales')
            .select('*')
            .order('priority', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, flashSales: rows });
    } catch (error) {
        console.error('API Error - GET /api/admin/flash-sales:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Thêm Flash Sale mới
 */
export async function POST(request) {
    try {
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

        if (!name || !start_date || !end_date) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng điền đầy đủ các trường bắt buộc (tên, thời gian bắt đầu, thời gian kết thúc).'
            }, { status: 400 });
        }

        const { data: newFlashSale, error } = await supabaseAdmin
            .from('flash_sales')
            .insert([{
                name,
                description: description || '',
                badge_text: badge_text || 'FLASH',
                badge_color: badge_color || '#FFD93D',
                discount_value: parseInt(discount_value) || 0,
                discount_type: discount_type || 'percent',
                image_url: image_url || '',
                link_url: link_url || '/menu',
                start_date,
                end_date,
                priority: parseInt(priority) || 0,
                status: status || 'active'
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Tạo Flash Sale thành công!',
            flashSale: newFlashSale
        });
    } catch (error) {
        console.error('API Error - POST /api/admin/flash-sales:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}
