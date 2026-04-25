/**
 * Test endpoint để kiểm tra combo promotions
 * GET /api/combo-promotions/test
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({
                success: false,
                message: 'Supabase client chưa được khởi tạo'
            }, { status: 500 });
        }

        // Kiểm tra xem bảng có tồn tại không
        const { data: allCombos, error: allError } = await supabaseAdmin
            .from('combo_promotions')
            .select('id, name, status, start_date, end_date, created_at')
            .limit(10);

        if (allError) {
            return NextResponse.json({
                success: false,
                message: 'Lỗi khi truy vấn combo_promotions',
                error: allError.message,
                hint: allError.message.includes('does not exist') 
                    ? 'Bảng combo_promotions chưa được tạo. Chạy file: database_migrations/create_combo_promotions_table.sql'
                    : 'Kiểm tra kết nối database'
            }, { status: 500 });
        }

        // Đếm theo status
        const { data: activeCombos, error: activeError } = await supabaseAdmin
            .from('combo_promotions')
            .select('id, name, status')
            .eq('status', 'active');

        const stats = {
            total: allCombos?.length || 0,
            active: activeCombos?.length || 0,
            allCombos: allCombos || [],
            activeCombos: activeCombos || []
        };

        return NextResponse.json({
            success: true,
            message: 'Test thành công',
            stats,
            tableExists: true
        });
    } catch (error) {
        console.error('[Combo Test API] Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Lỗi Server',
            error: error.toString()
        }, { status: 500 });
    }
}

