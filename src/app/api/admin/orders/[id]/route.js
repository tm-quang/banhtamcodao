// src/app/api/admin/orders/[id]/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request, { params }) {
    try {
        const { id } = params;

        const { data: order, error } = await supabase
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
// --- HÀM MỚI: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG ---
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();

        // Lấy các trường có thể cập nhật từ body
        const { status, payment_status, recipient_name, phone_number, delivery_address, note } = body;

        // Xây dựng object update
        const updates = {};
        if (status) updates.status = status;
        if (payment_status) updates.payment_status = payment_status;
        if (recipient_name) updates.recipient_name = recipient_name;
        if (phone_number) updates.phone_number = phone_number;
        if (delivery_address) updates.delivery_address = delivery_address;
        if (note) updates.note = note;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: false, message: 'Không có thông tin nào để cập nhật.' }, { status: 400 });
        }

        const { error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Cập nhật đơn hàng thành công!' });
    } catch (error) {
        console.error('API Error - PUT /api/admin/orders/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

// --- HÀM MỚI: XÓA ĐƠN HÀNG ---
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        const { error } = await supabase.from('orders').delete().eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Xóa đơn hàng thành công!' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}