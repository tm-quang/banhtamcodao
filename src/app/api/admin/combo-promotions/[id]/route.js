/**
 * src/app/api/admin/combo-promotions/[id]/route.js
 * API routes cho cập nhật và xóa Combo Promotion (Admin)
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy chi tiết Combo Promotion theo ID
 */
export async function GET(request, { params }) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase client chưa được khởi tạo. Vui lòng kiểm tra biến môi trường.');
            return NextResponse.json({
                success: false,
                message: 'Database chưa được cấu hình. Vui lòng liên hệ quản trị viên.'
            }, { status: 500 });
        }

        const { id } = await params;

        const { data: combo, error } = await supabaseAdmin
            .from('combo_promotions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        if (!combo) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy Combo Promotion'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, comboPromotion: combo });
    } catch (error) {
        console.error('API Error - GET /api/admin/combo-promotions/[id]:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi Server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * Cập nhật Combo Promotion
 */
export async function PUT(request, { params }) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase client chưa được khởi tạo. Vui lòng kiểm tra biến môi trường.');
            return NextResponse.json({
                success: false,
                message: 'Database chưa được cấu hình. Vui lòng liên hệ quản trị viên.'
            }, { status: 500 });
        }

        const { id } = await params;
        const data = await request.json();

        const updateData = {};
        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.description !== undefined) updateData.description = data.description ? data.description.trim() : '';
        if (data.status !== undefined) updateData.status = data.status;
        if (data.start_date !== undefined) updateData.start_date = data.start_date || null;
        if (data.end_date !== undefined) updateData.end_date = data.end_date || null;
        if (data.valid_hours !== undefined) {
            try {
                updateData.valid_hours = typeof data.valid_hours === 'string' ? JSON.parse(data.valid_hours) : data.valid_hours;
            } catch (e) {
                updateData.valid_hours = data.valid_hours;
            }
        }
        if (data.conditions !== undefined) {
            try {
                updateData.conditions = typeof data.conditions === 'string' ? JSON.parse(data.conditions) : data.conditions;
            } catch (e) {
                return NextResponse.json({
                    success: false,
                    message: 'Định dạng JSON không hợp lệ cho conditions.'
                }, { status: 400 });
            }
        }
        if (data.rewards !== undefined) {
            try {
                updateData.rewards = typeof data.rewards === 'string' ? JSON.parse(data.rewards) : data.rewards;
            } catch (e) {
                return NextResponse.json({
                    success: false,
                    message: 'Định dạng JSON không hợp lệ cho rewards.'
                }, { status: 400 });
            }
        }
        if (data.max_uses_per_user !== undefined) updateData.max_uses_per_user = data.max_uses_per_user ? parseInt(data.max_uses_per_user) : null;
        if (data.max_uses_total !== undefined) updateData.max_uses_total = data.max_uses_total ? parseInt(data.max_uses_total) : null;
        if (data.min_order_value !== undefined) updateData.min_order_value = data.min_order_value ? parseInt(data.min_order_value) : 0;
        if (data.max_order_value !== undefined) updateData.max_order_value = data.max_order_value ? parseInt(data.max_order_value) : null;
        if (data.exclude_vouchers !== undefined) updateData.exclude_vouchers = data.exclude_vouchers;
        if (data.only_new_customers !== undefined) updateData.only_new_customers = data.only_new_customers;
        if (data.only_vip_customers !== undefined) updateData.only_vip_customers = data.only_vip_customers;
        if (data.priority !== undefined) updateData.priority = data.priority ? parseInt(data.priority) : 0;

        // Validate dates if both are provided
        if (updateData.start_date && updateData.end_date) {
            const startDate = new Date(updateData.start_date);
            const endDate = new Date(updateData.end_date);
            
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

        const { data: updatedCombo, error } = await supabaseAdmin
            .from('combo_promotions')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Cập nhật Combo Promotion thành công!',
            comboPromotion: updatedCombo
        });
    } catch (error) {
        console.error('API Error - PUT /api/admin/combo-promotions/[id]:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi Server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * Xóa Combo Promotion
 */
export async function DELETE(request, { params }) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase client chưa được khởi tạo. Vui lòng kiểm tra biến môi trường.');
            return NextResponse.json({
                success: false,
                message: 'Database chưa được cấu hình. Vui lòng liên hệ quản trị viên.'
            }, { status: 500 });
        }

        const { id } = await params;

        const { error } = await supabaseAdmin
            .from('combo_promotions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Xóa Combo Promotion thành công!'
        });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/combo-promotions/[id]:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi Server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

