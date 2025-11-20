// src/app/api/reviews/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
// Giả sử bạn có một hàm helper để lấy thông tin user từ token
// import { getUserFromToken } from '@/lib/auth';

export async function POST(request) {
    try {
        // Tạm thời, chúng ta sẽ không xác thực người dùng ở đây
        // const user = await getUserFromToken(request);
        // if (!user) {
        //     return NextResponse.json({ success: false, message: 'Bạn cần đăng nhập để đánh giá.' }, { status: 401 });
        // }

        const { productId, rating, comment, customerName } = await request.json();

        if (!productId || !rating || !customerName) {
            return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' }, { status: 400 });
        }

        await pool.execute(
            `INSERT INTO product_reviews (product_id, customer_name, rating, comment, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [productId, customerName, rating, comment, 'pending'] // Trạng thái mặc định là "pending"
        );

        return NextResponse.json({ success: true, message: 'Cảm ơn bạn đã gửi đánh giá! Đánh giá của bạn đang chờ được duyệt.' });

    } catch (error) {
        console.error('API Error - POST /api/reviews:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}