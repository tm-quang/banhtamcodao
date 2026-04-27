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
        const { 
            status, payment_status, recipient_name, phone_number, 
            delivery_address, note, items_list, subtotal, 
            shipping_fee, discount, total_amount, payment_method,
            delivery_method, voucher_code, history_note
        } = body;

        // 1. Lấy trạng thái hiện tại để so sánh và lưu lịch sử
        const { data: currentOrder, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // Xây dựng object update
        const updates = {};
        const historyLogs = Array.isArray(currentOrder.status_history) ? [...currentOrder.status_history] : [];
        const now = new Date().toISOString();
        let changeDescription = history_note || 'Chỉnh sửa thông tin đơn hàng';

        // Danh sách các trường cần kiểm tra thay đổi
        const fieldsToUpdate = {
            status, payment_status, recipient_name, phone_number, 
            delivery_address, note, items_list, subtotal, 
            shipping_fee, discount, total_amount, payment_method,
            delivery_method, voucher_code
        };

        let hasChanges = false;

        // Kiểm tra thay đổi trạng thái đặc biệt
        if (status !== undefined && status !== null && status !== currentOrder.status) {
            updates.status = status;
            hasChanges = true;
            
            historyLogs.push({
                type: 'status',
                from: currentOrder.status,
                to: status,
                time: now,
                note: 'Cập nhật trạng thái đơn hàng'
            });

            // Nếu status là "Đã hủy", tự động set payment_status thành "cancelled"
            if (status === 'Đã hủy' && currentOrder.payment_status !== 'cancelled' && payment_status === undefined) {
                updates.payment_status = 'cancelled';
                historyLogs.push({
                    type: 'payment',
                    from: currentOrder.payment_status,
                    to: 'cancelled',
                    time: now,
                    note: 'Tự động hủy thanh toán do hủy đơn'
                });
            }
        }

        // Kiểm tra các trường còn lại
        Object.keys(fieldsToUpdate).forEach(key => {
            if (key === 'status') return; // Đã xử lý riêng
            
            const newValue = fieldsToUpdate[key];
            const oldValue = currentOrder[key];

            if (newValue !== undefined && newValue !== null && newValue !== oldValue) {
                // Với items_list, so sánh sâu hoặc so sánh string
                if (key === 'items_list') {
                    const normalizedNew = typeof newValue === 'string' ? newValue : JSON.stringify(newValue);
                    const normalizedOld = typeof oldValue === 'string' ? oldValue : JSON.stringify(oldValue);
                    
                    if (normalizedNew !== normalizedOld) {
                        updates[key] = newValue;
                        hasChanges = true;
                    }
                } else {
                    updates[key] = newValue;
                    hasChanges = true;
                }
            }
        });

        if (!hasChanges && !history_note) {
            return NextResponse.json({ success: false, message: 'Không có thông tin nào để cập nhật.' }, { status: 400 });
        }

        // Nếu có ghi chú chỉnh sửa từ admin hoặc có thay đổi lớn (như items_list)
        if (hasChanges || history_note) {
            historyLogs.push({
                type: 'edit',
                time: now,
                note: changeDescription,
                admin_edit: true
            });
            updates.status_history = historyLogs;
        }

        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update(updates)
            .eq('id', id);

        if (updateError) {
            console.error('Supabase update error:', updateError);
            throw updateError;
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