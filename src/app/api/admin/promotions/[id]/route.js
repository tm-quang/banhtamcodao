/**
 * src/app/api/admin/promotions/[id]/route.js
 * API routes cho cập nhật và xóa khuyến mãi theo ID
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Cập nhật khuyến mãi
 */
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const data = await request.json();
        const { promo_code, title, discount_type, discount_value, min_order_value, start_date, end_date, status } = data;

        const { error } = await supabaseAdmin
            .from('promotions')
            .update({
                promo_code,
                title,
                discount_type,
                discount_value: parseFloat(discount_value),
                min_order_value: min_order_value || 0,
                start_date,
                end_date,
                status
            })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        console.error('API Error - PUT /api/admin/promotions/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Xóa khuyến mãi
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        
        const { error } = await supabaseAdmin
            .from('promotions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Xóa thành công!' });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/promotions/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}