/**
 * API endpoint để cập nhật lại membership_level cho tất cả khách hàng
 * dựa trên reward_points và bảng customer_groups
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
    try {
        // Gọi function database để cập nhật tất cả membership_level
        const { data, error } = await supabaseAdmin.rpc('update_all_customers_membership_level');

        if (error) {
            console.error('Error updating membership levels:', error);
            return NextResponse.json(
                { success: false, message: error.message || 'Lỗi khi cập nhật nhóm khách hàng' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Đã cập nhật nhóm khách hàng cho ${data || 0} khách hàng`,
            updated_count: data || 0
        });
    } catch (error) {
        console.error('API Error - POST /api/admin/customers/update-membership-levels:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Lỗi server' },
            { status: 500 }
        );
    }
}

