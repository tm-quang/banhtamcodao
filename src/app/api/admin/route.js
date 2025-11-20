// src/app/api/admin/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// GET /api/admin => trả về thống kê tổng hợp cho dashboard
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get('month') || '0', 10); // 1-12, 0 = all
        const year = parseInt(searchParams.get('year') || '0', 10);

        // Tổng quan
        const { count: total_orders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count: total_products } = await supabase.from('products').select('*', { count: 'exact', head: true });
        const { count: total_categories } = await supabase.from('categories').select('*', { count: 'exact', head: true });

        // Fetch orders for the specific month/year or all if not specified
        let query = supabase.from('orders').select('order_time, status, total_amount');

        if (month > 0 && year > 0) {
            // Construct date range for the month
            const startDate = new Date(year, month - 1, 1).toISOString();
            const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
            query = query.gte('order_time', startDate).lte('order_time', endDate);
        }

        const { data: orders, error } = await query;

        if (error) throw error;

        // Calculate stats in JS
        const month_orders = orders.length;
        const success_orders = orders.filter(o => o.status === 'completed').length;
        const canceled_orders = orders.filter(o => o.status === 'canceled').length;

        // Doanh thu theo ngày (đơn vị: VND)
        const dailyMap = {};
        orders.forEach(order => {
            const date = new Date(order.order_time);
            const day = date.getDate();
            if (!dailyMap[day]) {
                dailyMap[day] = { day, revenue: 0, orders: 0 };
            }
            dailyMap[day].orders += 1;
            // Only count revenue for completed orders? The original query didn't specify status for revenue, 
            // but usually we only count valid orders. The original query:
            // SELECT DAY(order_time) as day, SUM(total_amount) as revenue, COUNT(*) as orders FROM orders ... GROUP BY DAY
            // It didn't filter by status for revenue in the daily query part (only WHERE month/year).
            // So we sum all.
            dailyMap[day].revenue += parseFloat(order.total_amount || 0);
        });

        const dailyRows = Object.values(dailyMap).sort((a, b) => a.day - b.day);

        return NextResponse.json({
            success: true,
            metrics: {
                total_orders: total_orders || 0,
                total_products: total_products || 0,
                total_categories: total_categories || 0,
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


