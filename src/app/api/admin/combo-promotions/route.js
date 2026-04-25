/**
 * src/app/api/admin/combo-promotions/route.js
 * API routes cho quản lý Combo Promotions (Admin)
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy tất cả Combo Promotions
 */
export async function GET() {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase client chưa được khởi tạo. Vui lòng kiểm tra biến môi trường.');
            return NextResponse.json({
                success: false,
                message: 'Database chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
                comboPromotions: []
            }, { status: 500 });
        }

        const { data: rows, error } = await supabaseAdmin
            .from('combo_promotions')
            .select('*')
            .order('priority', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, comboPromotions: rows || [] });
    } catch (error) {
        console.error('API Error - GET /api/admin/combo-promotions:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi Server',
            comboPromotions: [],
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * Thêm Combo Promotion mới
 */
export async function POST(request) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase client chưa được khởi tạo. Vui lòng kiểm tra biến môi trường.');
            return NextResponse.json({
                success: false,
                message: 'Database chưa được cấu hình. Vui lòng liên hệ quản trị viên.'
            }, { status: 500 });
        }

        const data = await request.json();
        const {
            name,
            description,
            status,
            start_date,
            end_date,
            valid_hours,
            conditions,
            rewards,
            max_uses_per_user,
            max_uses_total,
            min_order_value,
            max_order_value,
            exclude_vouchers,
            only_new_customers,
            only_vip_customers,
            priority
        } = data;

        if (!name || !conditions || !rewards) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng điền đầy đủ các trường bắt buộc (tên, điều kiện, phần thưởng).'
            }, { status: 400 });
        }

        // Validate dates if provided
        if (start_date && end_date) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return NextResponse.json({
                    success: false,
                    message: 'Định dạng ngày không hợp lệ.'
                }, { status: 400 });
            }

            if (endDate <= startDate) {
                return NextResponse.json({
                    success: false,
                    message: 'Thời gian kết thúc phải sau thời gian bắt đầu.'
                }, { status: 400 });
            }
        }

        // Validate JSON fields
        let parsedConditions, parsedRewards, parsedValidHours = null;
        try {
            parsedConditions = typeof conditions === 'string' ? JSON.parse(conditions) : conditions;
            parsedRewards = typeof rewards === 'string' ? JSON.parse(rewards) : rewards;
            if (valid_hours) {
                parsedValidHours = typeof valid_hours === 'string' ? JSON.parse(valid_hours) : valid_hours;
            }
        } catch (parseError) {
            return NextResponse.json({
                success: false,
                message: 'Định dạng JSON không hợp lệ cho conditions hoặc rewards.'
            }, { status: 400 });
        }

        const { data: newCombo, error } = await supabaseAdmin
            .from('combo_promotions')
            .insert([{
                name: name.trim(),
                description: description ? description.trim() : '',
                status: status || 'active',
                start_date: start_date || null,
                end_date: end_date || null,
                valid_hours: parsedValidHours,
                conditions: parsedConditions,
                rewards: parsedRewards,
                max_uses_per_user: max_uses_per_user ? parseInt(max_uses_per_user) : null,
                max_uses_total: max_uses_total ? parseInt(max_uses_total) : null,
                min_order_value: min_order_value ? parseInt(min_order_value) : 0,
                max_order_value: max_order_value ? parseInt(max_order_value) : null,
                exclude_vouchers: exclude_vouchers || false,
                only_new_customers: only_new_customers || false,
                only_vip_customers: only_vip_customers || false,
                priority: priority ? parseInt(priority) : 0
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Tạo Combo Promotion thành công!',
            comboPromotion: newCombo
        });
    } catch (error) {
        console.error('API Error - POST /api/admin/combo-promotions:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi Server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

