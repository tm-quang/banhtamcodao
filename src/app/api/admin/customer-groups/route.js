/**
 * Customer Groups API route handler
 * @file src/app/api/admin/customer-groups/route.js
 * API để quản lý các nhóm khách hàng
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy danh sách tất cả nhóm khách hàng
 */
export async function GET() {
    try {
        const { data: groups, error } = await supabaseAdmin
            .from('customer_groups')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, groups });
    } catch (error) {
        console.error('API Error - GET /api/admin/customer-groups:', error);
        return NextResponse.json(
            { success: false, message: 'Lỗi khi lấy danh sách nhóm khách hàng' },
            { status: 500 }
        );
    }
}

/**
 * Tạo nhóm khách hàng mới
 */
export async function POST(request) {
    try {
        const { name, description, min_points, points_per_amount, display_order, is_active } = await request.json();

        if (!name || min_points === undefined || points_per_amount === undefined) {
            return NextResponse.json(
                { success: false, message: 'Tên nhóm, điểm tối thiểu và tỷ lệ tích điểm là bắt buộc' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('customer_groups')
            .insert([
                {
                    name,
                    description: description || null,
                    min_points: parseInt(min_points) || 0,
                    points_per_amount: parseFloat(points_per_amount) || 1000,
                    display_order: parseInt(display_order) || 0,
                    is_active: is_active !== undefined ? is_active : true,
                },
            ])
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, group: data[0], message: 'Tạo nhóm khách hàng thành công!' });
    } catch (error) {
        console.error('API Error - POST /api/admin/customer-groups:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Lỗi khi tạo nhóm khách hàng' },
            { status: 500 }
        );
    }
}

/**
 * Cập nhật nhóm khách hàng
 */
export async function PUT(request) {
    try {
        const { id, name, description, min_points, points_per_amount, display_order, is_active } = await request.json();

        if (!id) {
            return NextResponse.json({ success: false, message: 'ID nhóm khách hàng là bắt buộc' }, { status: 400 });
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (min_points !== undefined) updates.min_points = parseInt(min_points);
        if (points_per_amount !== undefined) updates.points_per_amount = parseFloat(points_per_amount);
        if (display_order !== undefined) updates.display_order = parseInt(display_order);
        if (is_active !== undefined) updates.is_active = is_active;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: false, message: 'Không có thông tin nào để cập nhật' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('customer_groups')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;

        // Sau khi cập nhật, cần cập nhật lại membership_level cho tất cả khách hàng
        // Gọi function để cập nhật lại (chạy trong background, không chờ kết quả)
        supabaseAdmin.rpc('update_all_customers_membership_level').catch(err => {
            console.warn('Warning: Could not update all customers membership level:', err);
        });

        return NextResponse.json({ success: true, group: data[0], message: 'Cập nhật nhóm khách hàng thành công!' });
    } catch (error) {
        console.error('API Error - PUT /api/admin/customer-groups:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Lỗi khi cập nhật nhóm khách hàng' },
            { status: 500 }
        );
    }
}

/**
 * Xóa nhóm khách hàng
 */
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: 'ID nhóm khách hàng là bắt buộc' }, { status: 400 });
        }

        // Không cho phép xóa, chỉ cho phép vô hiệu hóa
        const { error } = await supabaseAdmin
            .from('customer_groups')
            .update({ is_active: false })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Vô hiệu hóa nhóm khách hàng thành công!' });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/customer-groups:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Lỗi khi xóa nhóm khách hàng' },
            { status: 500 }
        );
    }
}

