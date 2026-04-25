/**
 * src/app/api/admin/orders/[id]/route.js
 * API routes cho quản lý đơn hàng theo ID
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;

        if (!order) {
            return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order });

    } catch (error) {
        console.error('API Error - GET /api/admin/orders/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}
/**
 * HÀM MỚI: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
 * @param {Request} request - Request object
 * @param {Object} params - Route parameters
 * @returns {Promise<NextResponse>} Response
 */
export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ success: false, message: 'ID đơn hàng không hợp lệ.' }, { status: 400 });
        }

        const body = await request.json();

        // Lấy các trường có thể cập nhật từ body
        const { status, payment_status, recipient_name, phone_number, delivery_address, note } = body;

        // Xây dựng object update
        const updates = {};
        if (status !== undefined && status !== null) {
            updates.status = status;
            // Nếu status là "Đã hủy", tự động set payment_status thành "cancelled"
            if (status === 'Đã hủy') {
                updates.payment_status = 'cancelled';
            }
        }
        // Chỉ cập nhật payment_status nếu status không phải "Đã hủy" (để tránh ghi đè)
        if (payment_status !== undefined && payment_status !== null && status !== 'Đã hủy') {
            updates.payment_status = payment_status;
        }
        if (recipient_name !== undefined && recipient_name !== null) updates.recipient_name = recipient_name;
        if (phone_number !== undefined && phone_number !== null) updates.phone_number = phone_number;
        if (delivery_address !== undefined && delivery_address !== null) updates.delivery_address = delivery_address;
        if (note !== undefined && note !== null) updates.note = note;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: false, message: 'Không có thông tin nào để cập nhật.' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('orders')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Cập nhật đơn hàng thành công!' });
    } catch (error) {
        console.error('API Error - PUT /api/admin/orders/[id]:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi Server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * HÀM MỚI: XÓA ĐƠN HÀNG
 * @param {Request} request - Request object
 * @param {Object} params - Route parameters
 * @returns {Promise<NextResponse>} Response
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ success: false, message: 'ID đơn hàng không hợp lệ.' }, { status: 400 });
        }

        const { error } = await supabaseAdmin.from('orders').delete().eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Xóa đơn hàng thành công!' });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/orders/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}