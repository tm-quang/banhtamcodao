/**
 * src/app/api/flash-sales/active/route.js
 * Public API để lấy Flash Sales đang hoạt động cho frontend
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy tất cả Flash Sales đang active trong khung thời gian hiện tại
 */
export async function GET() {
    try {
        const now = new Date().toISOString();

        const { data: rows, error } = await supabaseAdmin
            .from('flash_sales')
            .select('*')
            .eq('status', 'active')
            .lte('start_date', now)
            .gte('end_date', now)
            .order('priority', { ascending: true });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            flashSales: rows || [],
            count: rows?.length || 0
        });
    } catch (error) {
        console.error('API Error - GET /api/flash-sales/active:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi Server',
            flashSales: [],
            count: 0
        }, { status: 500 });
    }
}
