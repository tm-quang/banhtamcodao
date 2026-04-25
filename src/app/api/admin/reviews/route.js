/**
 * src/app/api/admin/reviews/route.js
 * API routes cho quản lý đánh giá sản phẩm
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminAPI, errorResponse, successResponse, handleAPIError } from '@/lib/api-security';

export const dynamic = 'force-dynamic';

/**
 * Lấy tất cả các đánh giá
 */
export async function GET(request) {
    try {
        // Verify admin authentication - tạm thời comment để test
        // try {
        //     const { error: authError } = await verifyAdminAPI(request);
        //     if (authError) {
        //         console.warn('Auth error:', authError);
        //         return errorResponse(
        //             authError === 'Unauthorized' ? 'Vui lòng đăng nhập' : 'Chỉ admin mới có quyền truy cập',
        //             authError === 'Unauthorized' ? 401 : 403
        //         );
        //     }
        // } catch (authErr) {
        //     console.error('Auth verification failed:', authErr);
        //     return errorResponse('Lỗi xác thực', 500);
        // }

        // Lấy reviews trước (không join để tránh lỗi foreign key)
        console.log('Fetching reviews from Supabase...');
        const { data: reviewsData, error: reviewsError } = await supabaseAdmin
            .from('product_reviews')
            .select(`
                id,
                product_id,
                customer_name,
                rating,
                comment,
                status,
                created_at
            `)
            .order('created_at', { ascending: false });

        if (reviewsError) {
            console.error('Supabase Error - GET reviews:', reviewsError);
            console.error('Error details:', JSON.stringify(reviewsError, null, 2));
            throw reviewsError;
        }

        console.log('Reviews fetched:', reviewsData?.length || 0);

        // Kiểm tra nếu không có reviews
        if (!reviewsData || reviewsData.length === 0) {
            console.log('No reviews found, returning empty array');
            return successResponse({ reviews: [] }, 'Lấy danh sách đánh giá thành công');
        }

        // Lấy danh sách product_ids duy nhất
        const productIds = [...new Set(reviewsData.map(r => r.product_id).filter(Boolean))];

        // Lấy thông tin products nếu có product_ids
        let productsMap = {};
        if (productIds.length > 0) {
            const { data: productsData, error: productsError } = await supabaseAdmin
                .from('products')
                .select('id, name, slug')
                .in('id', productIds);

            if (productsError) {
                console.warn('Error fetching products:', productsError);
                // Không throw error, chỉ log warning và tiếp tục
            } else if (productsData) {
                // Tạo map để lookup nhanh
                productsMap = productsData.reduce((acc, product) => {
                    acc[product.id] = {
                        name: product.name,
                        slug: product.slug
                    };
                    return acc;
                }, {});
            }
        }

        // Format dữ liệu
        const reviews = reviewsData.map(review => {
            const productInfo = review.product_id ? productsMap[review.product_id] : null;

            return {
                id: review.id,
                product_id: review.product_id,
                product_name: productInfo?.name || 'N/A',
                product_slug: productInfo?.slug || null,
                customer_name: review.customer_name || 'N/A',
                customer_email: null, // Column không tồn tại trong database
                rating: review.rating || 0,
                comment: review.comment || null,
                status: review.status || 'pending',
                created_at: review.created_at
            };
        });

        return successResponse({ reviews }, 'Lấy danh sách đánh giá thành công');
    } catch (error) {
        console.error('API Error - GET /api/admin/reviews:', error);
        return handleAPIError(error, 'GET /api/admin/reviews');
    }
}