import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/admin => trả về thống kê tổng hợp cho dashboard
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get('month') || '0', 10); // 1-12, 0 = all
        const year = parseInt(searchParams.get('year') || '0', 10);

        // Tổng quan
        const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) AS total_orders FROM orders');
        const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products');
        const [[{ total_categories }]] = await pool.query('SELECT COUNT(*) AS total_categories FROM categories');

        // Theo trạng thái tháng hiện tại
        const whereMonth = month > 0 && year > 0 ? 'WHERE MONTH(order_time) = ? AND YEAR(order_time) = ?' : '';
        const params = month > 0 && year > 0 ? [month, year] : [];

        const [successRows] = await pool.execute(
            `SELECT COUNT(*) AS success_orders FROM orders ${whereMonth} AND status = 'completed'`.replace('WHERE  AND', 'WHERE '),
            params
        );
        const success_orders = successRows[0]?.success_orders || 0;

        const [cancelRows] = await pool.execute(
            `SELECT COUNT(*) AS canceled_orders FROM orders ${whereMonth} AND status = 'canceled'`.replace('WHERE  AND', 'WHERE '),
            params
        );
        const canceled_orders = cancelRows[0]?.canceled_orders || 0;

        const [monthOrdersRows] = await pool.execute(
            `SELECT COUNT(*) AS month_orders FROM orders ${whereMonth}`,
            params
        );
        const month_orders = monthOrdersRows[0]?.month_orders || 0;

        // Doanh thu theo ngày (đơn vị: VND) -> frontend chuyển sang ngàn đồng nếu cần
        const [dailyRows] = await pool.execute(
            `SELECT DAY(order_time) as day, SUM(total_amount) as revenue, COUNT(*) as orders
             FROM orders ${whereMonth}
             GROUP BY DAY(order_time)
             ORDER BY day`,
            params
        );

        return NextResponse.json({
            success: true,
            metrics: {
                total_orders,
                total_products,
                total_categories,
                month_orders,
                success_orders,
                canceled_orders,
            },
            daily: dailyRows,
        });
    } catch (error) {
        console.error('API Error - /api/admin:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}


