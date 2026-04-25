/**
 * src/app/api/flash-sales/active/route.js
 * Public API để lấy Flash Sales đang hoạt động cho frontend
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy tất cả Flash Sales đang active trong khung thời gian hiện tại
 */
export async function GET() {
    try {
        // Kiểm tra supabaseAdmin có tồn tại không
        if (!supabaseAdmin) {
            console.warn('Supabase admin client not available');
            return NextResponse.json({
                success: true,
                flashSales: [],
                count: 0
            });
        }

        const now = new Date().toISOString();

        // Query với cả 2 schema (cũ và mới) để đảm bảo tìm được dữ liệu
        // Thử query với start_date/end_date trước
        let { data: rows, error } = await supabaseAdmin
            .from('flash_sales')
            .select('*')
            .eq('status', 'active');

        // Nếu có lỗi hoặc không có kết quả, thử query đơn giản hơn
        if (error) {
            console.error('Error querying flash_sales:', error);
            // Thử query lại không có filter date
            const { data: allRows, error: allError } = await supabaseAdmin
                .from('flash_sales')
                .select('*')
                .eq('status', 'active');
            
            if (!allError && allRows) {
                rows = allRows;
                error = null;
            }
        }

        // Filter theo thời gian trong code (thay vì trong query)
        if (rows && rows.length > 0) {
            rows = rows.filter(row => {
                const startDate = row.start_date || row.start_time;
                const endDate = row.end_date || row.end_time;
                
                if (!startDate || !endDate) {
                    return false; // Bỏ qua nếu thiếu thời gian
                }
                
                const start = new Date(startDate).getTime();
                const end = new Date(endDate).getTime();
                const nowTime = Date.now();
                
                // Flash sale phải đã bắt đầu và chưa kết thúc
                return start <= nowTime && end >= nowTime;
            });
            
            // Sắp xếp theo priority
            rows.sort((a, b) => (a.priority || 0) - (b.priority || 0));
        }

        if (error) {
            console.error('Database error - GET /api/flash-sales/active:', error);
            // Trả về success với mảng rỗng thay vì lỗi
            return NextResponse.json({
                success: true,
                flashSales: [],
                count: 0
            });
        }

        // Map old column names to new ones for consistency
        const mappedRows = (rows || []).map(row => ({
            ...row,
            start_date: row.start_date || row.start_time,
            end_date: row.end_date || row.end_time,
            image_url: row.image_url || row.banner_image,
            badge_color: row.badge_color || row.background_c || '#FFD93D',
            badge_text: row.badge_text || 'FLASH',
            discount_value: row.discount_value || 0,
            discount_type: row.discount_type || 'percent',
            link_url: row.link_url || '/menu',
            priority: row.priority || 0
        }));

        // Debug log (chỉ trong development)
        if (process.env.NODE_ENV === 'development') {
            console.log('Active flash sales found:', mappedRows.length);
            if (mappedRows.length > 0) {
                console.log('Flash sales data:', mappedRows.map(r => ({
                    id: r.id,
                    name: r.name,
                    status: r.status,
                    start_date: r.start_date,
                    end_date: r.end_date,
                    has_image: !!r.image_url
                })));
            }
        }

        return NextResponse.json({
            success: true,
            flashSales: mappedRows,
            count: mappedRows.length
        });
    } catch (error) {
        console.error('API Error - GET /api/flash-sales/active:', error);
        // Luôn trả về success với mảng rỗng để không làm crash frontend
        return NextResponse.json({
            success: true,
            flashSales: [],
            count: 0
        });
    }
}
