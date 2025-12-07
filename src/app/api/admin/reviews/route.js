/**
 * src/app/api/admin/reviews/route.js
 * API routes cho quản lý đánh giá sản phẩm
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy tất cả các đánh giá
 */
export async function GET() {
    try {
        const { data: rows, error } = await supabaseAdmin
            .from('product_reviews')
            .select(`
                id,
                product_id,
                customer_name,
                rating,
                comment,
                status,
                created_at,
                products (
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        /**
         * Format dữ liệu để thêm product_name
         */
        const reviews = rows.map(review => ({
            id: review.id,
            product_id: review.product_id,
            product_name: review.products?.name || 'N/A',
            customer_name: review.customer_name,
            rating: review.rating,
            comment: review.comment,
            status: review.status,
            created_at: review.created_at
        }));

        return NextResponse.json({ success: true, reviews });
    } catch (error) {
        console.error('API Error - GET /api/admin/reviews:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}