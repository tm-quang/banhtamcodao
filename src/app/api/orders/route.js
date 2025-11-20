// src/app/api/orders/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// Tạo mã đơn hàng tự động theo format: DH-YYMM####
// DH-: prefix cố định
// YYMM: năm/tháng (2 chữ số năm + 2 chữ số tháng)
// ####: 4 số random ngẫu nhiên, ưu tiên không trùng lặp trên toàn bộ database
async function generateOrderCode() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // 2 chữ số cuối của năm
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Tháng (01-12)
    const yymm = `${year}${month}`; // Ví dụ: 2510 (năm 2025, tháng 10)

    let attempts = 0;
    const maxAttempts = 20; // Giảm số lần thử để tránh timeout, Supabase check nhanh hơn

    while (attempts < maxAttempts) {
        // Tạo 4 số random (0000-9999)
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const orderCode = `DH-${yymm}${random}`;

        // Kiểm tra xem mã đã tồn tại trong database chưa
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('order_code')
                .eq('order_code', orderCode)
                .maybeSingle();

            if (error) throw error;

            // Nếu không trùng (data là null), trả về mã này
            if (!data) {
                return orderCode;
            }
        } catch (error) {
            console.error('Error checking order code:', error);
            // Nếu lỗi check, cứ return đại để không block, hoặc continue
            // Ở đây ta continue để thử mã khác
        }

        attempts++;
    }

    // Nếu sau nhiều lần thử vẫn trùng, thêm timestamp vào cuối để đảm bảo unique
    const timestamp = Date.now().toString().slice(-4);
    return `DH-${yymm}${timestamp}`;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            phone_number,
            recipient_name,
            delivery_address,
            delivery_method,
            payment_method,
            total_amount,
            items_list,
            customer_note,
            delivery_date,
            delivery_time
        } = body;

        // Validation
        if (!phone_number || !recipient_name || !total_amount || !items_list) {
            return NextResponse.json(
                { success: false, message: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            );
        }

        // Xử lý địa chỉ: nếu là "Tự đến lấy" (pickup) thì địa chỉ là quán
        const finalDeliveryAddress = (delivery_method === 'pickup' || !delivery_address)
            ? 'Tự đến quán lấy'
            : delivery_address;

        // Tạo mã đơn hàng
        const order_code = await generateOrderCode();

        // Chuyển đổi items_list từ array sang string format "|||"
        // Giữ nguyên logic cũ để tương thích
        const itemsListString = Array.isArray(items_list)
            ? items_list.map(item => JSON.stringify(item)).join('|||')
            : items_list;

        // Tạo datetime từ date và time
        let order_time = new Date();
        if (delivery_date && delivery_time) {
            const [year, month, day] = delivery_date.split('-');
            const [hours, minutes] = delivery_time.split(':');
            order_time = new Date(year, month - 1, day, hours, minutes);
        }

        // Xác định status mặc định
        const status = 'Chờ xác nhận';

        // Insert vào database
        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    order_code,
                    recipient_name,
                    phone_number,
                    delivery_address: finalDeliveryAddress,
                    total_amount,
                    items_list: itemsListString,
                    customer_note: customer_note || null,
                    status,
                    order_time: order_time.toISOString() // Supabase timestamptz
                }
            ])
            .select();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Đặt hàng thành công!',
            order_id: data[0].id,
            order_code: order_code
        });

    } catch (error) {
        console.error('API Error - POST /api/orders:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Lỗi server khi tạo đơn hàng',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

