// src/app/api/reviews/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request) {
    try {
        const { productId, rating, comment, customerName } = await request.json();

        if (!productId || !rating || !customerName) {
            return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' }, { status: 400 });
        }

        const { error } = await supabase
            .from('product_reviews')
            .insert([
                {
                    product_id: productId,
                    customer_name: customerName,
                    rating,
                    comment,
                    status: 'pending'
                }
            ]);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Cảm ơn bạn đã gửi đánh giá! Đánh giá của bạn đang chờ được duyệt.' });

    } catch (error) {
        console.error('API Error - POST /api/reviews:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}