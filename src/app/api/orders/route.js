// src/app/api/orders/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

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
    const maxAttempts = 200; // Tăng số lần thử vì kiểm tra trên toàn bộ database
    
    while (attempts < maxAttempts) {
        // Tạo 4 số random (0000-9999)
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const orderCode = `DH-${yymm}${random}`;
        
        // Kiểm tra xem mã đã tồn tại trong database chưa (toàn bộ, không chỉ tháng)
        try {
            const [existing] = await pool.execute(
                `SELECT order_code FROM orders WHERE order_code = ?`,
                [orderCode]
            );
            
            // Nếu không trùng, trả về mã này
            if (existing.length === 0) {
                return orderCode;
            }
        } catch (error) {
            // Nếu có lỗi khi query, vẫn trả về mã (để tránh block việc tạo đơn)
            console.error('Error checking order code:', error);
            return orderCode;
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

        // Insert vào database - chỉ dùng các cột cơ bản
        // Thử insert với các cột cơ bản trước, nếu có lỗi sẽ thử không có delivery_method và payment_method
        let result;
        try {
            // Thử insert với đầy đủ cột (nếu database có các cột này)
            [result] = await pool.execute(
                `INSERT INTO orders (
                    order_code,
                    recipient_name,
                    phone_number,
                    delivery_address,
                    total_amount,
                    items_list,
                    customer_note,
                    status,
                    order_time
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    order_code,
                    recipient_name,
                    phone_number,
                    finalDeliveryAddress,
                    total_amount,
                    itemsListString,
                    customer_note || null,
                    status,
                    order_time
                ]
            );
        } catch (firstError) {
            // Nếu lỗi, có thể do thiếu cột, thử lại với cấu trúc đơn giản hơn
            console.error('First insert attempt failed:', firstError);
            [result] = await pool.execute(
                `INSERT INTO orders (
                    order_code,
                    recipient_name,
                    phone_number,
                    delivery_address,
                    total_amount,
                    items_list,
                    status,
                    order_time
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    order_code,
                    recipient_name,
                    phone_number,
                    finalDeliveryAddress,
                    total_amount,
                    itemsListString,
                    status,
                    order_time
                ]
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Đặt hàng thành công!',
            order_id: result.insertId,
            order_code: order_code
        });

    } catch (error) {
        console.error('API Error - POST /api/orders:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState
        });
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

