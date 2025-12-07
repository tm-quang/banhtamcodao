/**
 * src/app/api/admin/promotions/route.js
 * API routes cho quản lý khuyến mãi
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy tất cả khuyến mãi
 */
export async function GET() {
    try {
        const { data: rows, error } = await supabaseAdmin
            .from('promotions')
            .select('*')
            .order('end_date', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, promotions: rows });
    } catch (error) {
        console.error('API Error - GET /api/admin/promotions:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Thêm khuyến mãi mới
 */
export async function POST(request) {
    try {
        const data = await request.json();
        const { promo_code, title, discount_type, discount_value, min_order_value, start_date, end_date, status } = data;

        if (!promo_code || !title || !discount_type || !discount_value || !start_date || !end_date) {
            return NextResponse.json({ 
                success: false, 
                message: 'Vui lòng điền đầy đủ các trường bắt buộc.' 
            }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('promotions')
            .insert([{
                promo_code,
                title,
                discount_type,
                discount_value: parseFloat(discount_value),
                min_order_value: min_order_value || 0,
                start_date,
                end_date,
                status: status || 'active'
            }]);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Tạo khuyến mãi thành công!' });
    } catch (error) {
        console.error('API Error - POST /api/admin/promotions:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}