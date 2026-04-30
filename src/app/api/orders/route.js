/**
 * Orders API route handler
 * @file src/app/api/orders/route.js
 */
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { validateCartItems } from '@/utils/cartValidation';

/**
 * Tạo mã đơn hàng tự động theo format: DH-YYMM####
 * DH-: prefix cố định
 * YYMM: năm/tháng (2 chữ số năm + 2 chữ số tháng)
 * ####: 4 số random ngẫu nhiên, ưu tiên không trùng lặp trên toàn bộ database
 * @returns {Promise<string>} Order code
 */
async function generateOrderCode() {
    let yymm = '';
    try {
        // Luôn lấy thời gian theo múi giờ Hồ Chí Minh
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit'
        });
        
        const parts = formatter.formatToParts(now);
        const year = parts.find(p => p.type === 'year').value.slice(-2);
        const month = parts.find(p => p.type === 'month').value;
        yymm = `${year}${month}`;
    } catch (error) {
        console.error('Error in generateOrderCode (timezone):', error);
        // Fallback to UTC if timezone fails
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        yymm = `${year}${month}`;
    }

    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const orderCode = `DH-${yymm}${random}`;

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('order_code')
                .eq('order_code', orderCode)
                .maybeSingle();

            if (error) throw error;
            if (!data) return orderCode;
        } catch (error) {
            console.error('Error checking order code:', error);
        }
        attempts++;
    }

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
            subtotal,
            shipping_fee,
            items_list,
            customer_note,
            delivery_date,
            delivery_time
        } = body;

        // Final validation before processing order
        const validationResult = await validateCartItems(items_list);
        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, message: validationResult.message },
                { status: 400 }
            );
        }

        // Basic validation
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

        // Thời gian đặt hàng (Lấy đúng múi giờ Hồ Chí Minh để lưu vào DB)
        let order_time;
        try {
            const hcmNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
            const pad = (n) => String(n).padStart(2, '0');
            order_time = `${hcmNow.getFullYear()}-${pad(hcmNow.getMonth() + 1)}-${pad(hcmNow.getDate())}T${pad(hcmNow.getHours())}:${pad(hcmNow.getMinutes())}:${pad(hcmNow.getSeconds())}+07:00`;
        } catch (tzError) {
            console.error('Timezone error in POST /api/orders:', tzError);
            order_time = new Date().toISOString(); // Fallback to UTC ISO
        }

        // Lấy thời gian hiện tại HCMC để làm mặc định
        const hcmNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const pad = (n) => String(n).padStart(2, '0');
        const isoDate = `${hcmNow.getFullYear()}-${pad(hcmNow.getMonth() + 1)}-${pad(hcmNow.getDate())}`;
        const nowTime = `${pad(hcmNow.getHours())}:${pad(hcmNow.getMinutes())}`;

        // Xác định giá trị cuối cùng để lưu vào DB (Dùng format chuẩn ISO cho DATE/TIME types)
        const finalDeliveryDate = delivery_date || isoDate;
        const finalDeliveryTime = delivery_time || nowTime;

        // Xác định status mặc định
        const status = 'Chờ xác nhận';

        console.log('Inserting order into DB:', { order_code, delivery_method, order_time, finalDeliveryDate });

        // Insert vào database
        const { data, error: dbError } = await supabase
            .from('orders')
            .insert([
                {
                    order_code,
                    recipient_name,
                    phone_number,
                    delivery_address: finalDeliveryAddress,
                    subtotal: subtotal || total_amount,
                    shipping_fee: shipping_fee || 0,
                    total_amount,
                    items_list: itemsListString,
                    note: customer_note || '',
                    status,
                    delivery_method: delivery_method || 'delivery',
                    delivery_date: finalDeliveryDate,
                    delivery_time: finalDeliveryTime,
                    order_time: order_time
                }
            ])
            .select();

        if (dbError) {
            console.error('Database Insert Error:', JSON.stringify(dbError, null, 2));
            return NextResponse.json(
                { 
                    success: false, 
                    message: 'Lỗi khi lưu đơn hàng vào database', 
                    details: dbError.message,
                    code: dbError.code
                },
                { status: 500 }
            );
        }

        if (!data || data.length === 0) {
            console.error('No data returned after insert');
            return NextResponse.json(
                { success: false, message: 'Không nhận được phản hồi từ database sau khi lưu' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Đặt hàng thành công!',
            order_id: data[0].id,
            order_code: order_code
        });

    } catch (error) {
        console.error('General API Error - POST /api/orders:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Lỗi server khi tạo đơn hàng',
                error: error.message || 'Unknown error',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

