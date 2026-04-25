/**
 * Admin dashboard data API route handler - ENHANCED VERSION
 * @file src/app/api/admin/dashboard/data/route.js
 */
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * Calculate percentage growth between two values
 */
const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
};

/**
 * Format relative time
 */
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};

/**
 * GET dashboard data with KPIs, activities, and distributions
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Default range: last 30 days
        let trendStartDate = new Date(today);
        trendStartDate.setDate(trendStartDate.getDate() - 29);
        let trendEndDate = new Date(today);
        trendEndDate.setDate(trendEndDate.getDate() + 1);

        if (startDateParam) {
            trendStartDate = new Date(startDateParam);
            trendStartDate.setHours(0, 0, 0, 0);
        }
        if (endDateParam) {
            trendEndDate = new Date(endDateParam);
            trendEndDate.setHours(23, 59, 59, 999);
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // === KPI QUERIES ===
        const { data: allCompletedOrders } = await supabase
            .from('orders')
            .select('total_amount, order_time, status')
            .in('status', ['Hoàn thành', 'Đã giao']);

        let totalRevenue = 0;
        let dailyRevenue = 0;
        let yesterdayRevenue = 0;
        let weeklyRevenue = 0;
        let lastWeekRevenue = 0;
        let monthlyRevenue = 0;
        let lastMonthRevenue = 0;

        allCompletedOrders?.forEach(order => {
            const amount = parseFloat(order.total_amount) || 0;
            const orderDate = new Date(order.order_time);

            totalRevenue += amount;
            if (orderDate >= today) dailyRevenue += amount;
            else if (orderDate >= yesterday && orderDate < today) yesterdayRevenue += amount;

            if (orderDate >= thisWeekStart) weeklyRevenue += amount;
            else if (orderDate >= lastWeekStart && orderDate < thisWeekStart) lastWeekRevenue += amount;

            if (orderDate >= thisMonthStart) monthlyRevenue += amount;
            else if (orderDate >= lastMonthStart && orderDate < thisMonthStart) lastMonthRevenue += amount;
        });

        // Order counts
        const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count: monthlyOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).gte('order_time', thisMonthStart.toISOString());
        const { count: lastMonthOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).gte('order_time', lastMonthStart.toISOString()).lt('order_time', thisMonthStart.toISOString());
        const { count: completedOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['Hoàn thành', 'Đã giao']);
        const { count: cancelledOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Đã hủy');
        const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
        const { count: categoryCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });

        // === CATEGORY DISTRIBUTION ===
        const { data: categories } = await supabase.from('categories').select('id, name');
        const { data: products } = await supabase.from('products').select('category_id');
        const categoryColors = ['#ff6f30', '#2563eb', '#10b981', '#f59e0b', '#2563eb', '#ec4899', '#06b6d4'];
        const categoryDistribution = categories?.map((cat, index) => ({
            name: cat.name,
            value: products?.filter(p => p.category_id === cat.id).length || 0,
            color: categoryColors[index % categoryColors.length]
        })).filter(c => c.value > 0) || [];

        // === RECENT ORDERS ===
        const { data: recentOrdersRows } = await supabase.from('orders').select('order_code, recipient_name, total_amount, status, order_time').order('order_time', { ascending: false }).limit(10);
        const recentOrders = recentOrdersRows?.map(order => ({
            id: order.order_code,
            customer: order.recipient_name || 'N/A',
            total: `${parseInt(order.total_amount).toLocaleString('vi-VN')} ₫`,
            status: order.status || 'Chờ xác nhận'
        })) || [];

        // === TOP PRODUCTS (Filterable) ===
        const { data: trendOrders } = await supabase
            .from('orders')
            .select('items_list, order_time')
            .in('status', ['Hoàn thành', 'Đã giao'])
            .gte('order_time', trendStartDate.toISOString())
            .lt('order_time', trendEndDate.toISOString());

        const productSales = {};
        trendOrders?.forEach(order => {
            if (order.items_list) {
                try {
                    let items = [];
                    const itemsStr = order.items_list.trim();
                    if (itemsStr.startsWith('[')) items = JSON.parse(itemsStr);
                    else if (itemsStr.includes('|||')) items = itemsStr.split('|||').map(i => { try { return JSON.parse(i.trim()); } catch { return null; } }).filter(Boolean);
                    else { try { const p = JSON.parse(itemsStr); items = Array.isArray(p) ? p : [p]; } catch { return; } }
                    items.forEach(item => {
                        if (item?.name) {
                            const name = item.name.trim();
                            const qty = parseInt(item.quantity) || parseInt(item.qty) || 1;
                            if (name) productSales[name] = (productSales[name] || 0) + qty;
                        }
                    });
                } catch { /* ignore */ }
            }
        });
        const topProducts = Object.entries(productSales).map(([name, sold]) => ({ name, sold })).sort((a, b) => b.sold - a.sold).slice(0, 5);

        // === REVENUE TREND (Filterable) ===
        const diffMs = trendEndDate - trendStartDate;
        const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const trendDays = [];
        for (let i = 0; i < diffDays; i++) {
            const d = new Date(trendStartDate);
            d.setDate(d.getDate() + i);
            trendDays.push(d);
        }

        const revenueTrend = trendDays.map(date => {
            const dStart = new Date(date);
            dStart.setHours(0, 0, 0, 0);
            const dEnd = new Date(date);
            dEnd.setHours(23, 59, 59, 999);

            const dayRevenue = allCompletedOrders?.filter(order => {
                const oDate = new Date(order.order_time);
                return oDate >= dStart && oDate < dEnd;
            }).reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0) || 0;

            return {
                date: date.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' }),
                revenue: Math.round(dayRevenue / 1000),
            };
        });

        const kpiStats = {
            totalOrders: { value: totalOrders || 0, label: 'Đơn hàng' },
            monthlyOrders: { value: monthlyOrders || 0, prevValue: lastMonthOrders || 0, growth: calculateGrowth(monthlyOrders || 0, lastMonthOrders || 0), label: 'Đơn trong tháng' },
            completedOrders: { value: completedOrders || 0, label: 'Thành công' },
            totalRevenue: { value: totalRevenue, label: 'Tổng doanh thu' },
            monthlyRevenue: { value: monthlyRevenue, prevValue: lastMonthRevenue, growth: calculateGrowth(monthlyRevenue, lastMonthRevenue), label: 'Doanh thu tháng' },
            dailyRevenue: { value: dailyRevenue, prevValue: yesterdayRevenue, growth: calculateGrowth(dailyRevenue, yesterdayRevenue), label: 'Doanh thu ngày' }
        };

        return NextResponse.json({
            success: true,
            data: { recentOrders, topProducts, kpiStats, categoryDistribution, revenueTrend }
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}
