/**
 * Reviews API route handler
 * @file src/app/api/reviews/route.js
 */
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * GET: Lấy danh sách đánh giá đã duyệt
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 10;
        const random = searchParams.get('random') === 'true';

        let query = supabase
            .from('product_reviews')
            .select('*, products(name, image_url)')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Shuffle nếu yêu cầu random
        let reviews = data || [];
        if (random) {
            reviews = reviews.sort(() => Math.random() - 0.5);
        }

        return NextResponse.json({ success: true, reviews });

    } catch (error) {
        console.error('API Error - GET /api/reviews:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

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