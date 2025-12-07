/**
 * Get Order by Code API route handler
 * @file src/app/api/orders/[code]/route.js
 */
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request, { params }) {
    try {
        const { code } = await params;

        if (!code) {
            return NextResponse.json(
                { success: false, message: 'Thiếu mã đơn hàng' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('order_code', code)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { success: false, message: 'Không tìm thấy đơn hàng' },
                    { status: 404 }
                );
            }
            throw error;
        }

        return NextResponse.json({
            success: true,
            order: data
        });

    } catch (error) {
        console.error('API Error - GET /api/orders/[code]:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Lỗi server khi lấy thông tin đơn hàng',
                error: error.message
            },
            { status: 500 }
        );
    }
}
