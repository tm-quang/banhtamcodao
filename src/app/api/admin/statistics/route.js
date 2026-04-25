/**
 * Admin Statistics API route handler
 * @file src/app/api/admin/statistics/route.js
 */
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * Calculate percentage growth between two values
 */
const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
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

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateRange = searchParams.get('dateRange') || 'thisMonth';

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const thisQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const lastQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);

        const thisYearStart = new Date(now.getFullYear(), 0, 1);
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);

        // Determine date range filter
        let startDate, endDate, prevStartDate, prevEndDate;
        switch (dateRange) {
            case 'today':
                startDate = today;
                endDate = new Date(today);
                endDate.setDate(endDate.getDate() + 1);
                prevStartDate = yesterday;
                prevEndDate = today;
                break;
            case 'thisWeek':
                startDate = thisWeekStart;
                endDate = new Date(today);
                endDate.setDate(endDate.getDate() + 1);
                prevStartDate = lastWeekStart;
                prevEndDate = thisWeekStart;
                break;
            case 'thisMonth':
                startDate = thisMonthStart;
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                prevStartDate = lastMonthStart;
                prevEndDate = thisMonthStart;
                break;
            case 'thisQuarter':
                startDate = thisQuarterStart;
                endDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 1);
                prevStartDate = lastQuarterStart;
                prevEndDate = thisQuarterStart;
                break;
            case 'thisYear':
                startDate = thisYearStart;
                endDate = new Date(now.getFullYear() + 1, 0, 1);
                prevStartDate = lastYearStart;
                prevEndDate = thisYearStart;
                break;
            default:
                startDate = thisMonthStart;
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                prevStartDate = lastMonthStart;
                prevEndDate = thisMonthStart;
        }

        // Get all completed orders
        const { data: allCompletedOrders } = await supabase
            .from('orders')
            .select('total_amount, order_time, status')
            .in('status', ['Hoàn thành', 'Đã giao']);

        // Calculate revenue for current and previous period
        let currentRevenue = 0;
        let previousRevenue = 0;
        let totalRevenue = 0;

        allCompletedOrders?.forEach(order => {
            const amount = parseFloat(order.total_amount) || 0;
            const orderDate = new Date(order.order_time);
            totalRevenue += amount;

            if (orderDate >= startDate && orderDate < endDate) {
                currentRevenue += amount;
            } else if (orderDate >= prevStartDate && orderDate < prevEndDate) {
                previousRevenue += amount;
            }
        });

        // Get order counts
        const { count: totalOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        const { count: currentOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('order_time', startDate.toISOString())
            .lt('order_time', endDate.toISOString());

        const { count: previousOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('order_time', prevStartDate.toISOString())
            .lt('order_time', prevEndDate.toISOString());

        // Get customer counts
        const { data: currentCustomers } = await supabase
            .from('orders')
            .select('phone_number')
            .gte('order_time', startDate.toISOString())
            .lt('order_time', endDate.toISOString())
            .not('phone_number', 'is', null);

        const { data: previousCustomers } = await supabase
            .from('orders')
            .select('phone_number')
            .gte('order_time', prevStartDate.toISOString())
            .lt('order_time', prevEndDate.toISOString())
            .not('phone_number', 'is', null);

        const currentUniqueCustomers = new Set(currentCustomers?.map(c => c.phone_number)).size;
        const previousUniqueCustomers = new Set(previousCustomers?.map(c => c.phone_number)).size;

        // Get product count
        const { count: totalProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        // Calculate average order value
        const avgOrderValue = currentOrders > 0 ? Math.round(currentRevenue / currentOrders) : 0;
        const prevAvgOrderValue = previousOrders > 0 ? Math.round(previousRevenue / previousOrders) : 0;

        // Revenue by month (last 12 months)
        const revenueByMonth = [];
        for (let i = 11; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            
            const monthRevenue = allCompletedOrders?.filter(order => {
                const orderDate = new Date(order.order_time);
                return orderDate >= monthDate && orderDate <= monthEnd;
            }).reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;

            revenueByMonth.push({
                month: `T${monthDate.getMonth() + 1}`,
                value: monthRevenue
            });
        }

        // Category distribution
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name');

        const { data: ordersWithItems } = await supabase
            .from('orders')
            .select('items_list, total_amount')
            .in('status', ['Hoàn thành', 'Đã giao'])
            .not('items_list', 'is', null);

        const categoryRevenue = {};
        const categoryColors = ['#10b981', '#3b82f6', '#2563eb', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

        ordersWithItems?.forEach(order => {
            try {
                let items = [];
                if (order.items_list.trim().startsWith('[')) {
                    items = JSON.parse(order.items_list);
                } else if (order.items_list.includes('|||')) {
                    items = order.items_list.split('|||')
                        .map(item => { try { return JSON.parse(item.trim()); } catch { return null; } })
                        .filter(Boolean);
                } else {
                    try {
                        const parsed = JSON.parse(order.items_list);
                        items = Array.isArray(parsed) ? parsed : [parsed];
                    } catch { return; }
                }

                items.forEach(item => {
                    if (item?.category_id || item?.category) {
                        const catId = item.category_id || item.category;
                        const amount = parseFloat(item.price || item.total || 0) * (parseInt(item.quantity || item.qty || 1));
                        categoryRevenue[catId] = (categoryRevenue[catId] || 0) + amount;
                    }
                });
            } catch { /* ignore */ }
        });

        const totalCategoryRevenue = Object.values(categoryRevenue).reduce((sum, val) => sum + val, 0);
        const categoryStats = categories?.map((cat, index) => {
            const revenue = categoryRevenue[cat.id] || 0;
            const percentage = totalCategoryRevenue > 0 ? Math.round((revenue / totalCategoryRevenue) * 100) : 0;
            return {
                name: cat.name,
                value: percentage,
                color: categoryColors[index % categoryColors.length],
                revenue: revenue
            };
        }).filter(c => c.value > 0) || [];

        // Orders by status
        const { data: ordersByStatusData } = await supabase
            .from('orders')
            .select('status')
            .gte('order_time', startDate.toISOString())
            .lt('order_time', endDate.toISOString());

        const statusCounts = {};
        ordersByStatusData?.forEach(order => {
            const status = order.status || 'Chờ xác nhận';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const ordersByStatus = [
            { status: 'Hoàn thành', value: statusCounts['Hoàn thành'] || statusCounts['Đã giao'] || 0, color: '#10b981' },
            { status: 'Đang giao', value: statusCounts['Đang vận chuyển'] || statusCounts['Đang giao'] || 0, color: '#3b82f6' },
            { status: 'Chờ xác nhận', value: statusCounts['Chờ xác nhận'] || 0, color: '#f59e0b' },
            { status: 'Đã hủy', value: statusCounts['Đã hủy'] || 0, color: '#ef4444' }
        ].filter(s => s.value > 0);

        // Top products
        const productSales = {};
        ordersWithItems?.forEach(order => {
            try {
                let items = [];
                if (order.items_list.trim().startsWith('[')) {
                    items = JSON.parse(order.items_list);
                } else if (order.items_list.includes('|||')) {
                    items = order.items_list.split('|||')
                        .map(item => { try { return JSON.parse(item.trim()); } catch { return null; } })
                        .filter(Boolean);
                } else {
                    try {
                        const parsed = JSON.parse(order.items_list);
                        items = Array.isArray(parsed) ? parsed : [parsed];
                    } catch { return; }
                }

                items.forEach(item => {
                    if (item?.name) {
                        const productName = item.name.trim();
                        const quantity = parseInt(item.quantity || item.qty || 1);
                        const price = parseFloat(item.price || item.total || 0);
                        if (productName) {
                            if (!productSales[productName]) {
                                productSales[productName] = { orders: 0, revenue: 0 };
                            }
                            productSales[productName].orders += quantity;
                            productSales[productName].revenue += price * quantity;
                        }
                    }
                });
            } catch { /* ignore */ }
        });

        const topProducts = Object.entries(productSales)
            .map(([name, data]) => ({ name, orders: data.orders, revenue: data.revenue }))
            .sort((a, b) => b.orders - a.orders)
            .slice(0, 5);

        // Recent activity
        const { data: recentActivityOrders } = await supabase
            .from('orders')
            .select('order_code, recipient_name, order_time, status')
            .order('order_time', { ascending: false })
            .limit(10);

        const recentActivity = (recentActivityOrders || []).map(order => {
            let type = 'order';
            let text = '';

            if (order.status === 'Hoàn thành' || order.status === 'Đã giao') {
                type = 'order';
                text = `Đơn hàng #${order.order_code} đã hoàn thành`;
            } else if (order.status === 'Đang vận chuyển' || order.status === 'Đang giao') {
                type = 'order';
                text = `Đơn hàng #${order.order_code} đang giao`;
            } else if (order.status === 'Chờ xác nhận') {
                type = 'order';
                text = `${order.recipient_name || 'Khách hàng'} đặt đơn #${order.order_code}`;
            } else {
                type = 'order';
                text = `Đơn hàng #${order.order_code} - ${order.status}`;
            }

            return {
                type,
                text,
                time: formatRelativeTime(order.order_time)
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    totalRevenue: totalRevenue,
                    totalOrders: totalOrders || 0,
                    totalCustomers: currentUniqueCustomers,
                    totalProducts: totalProducts || 0,
                    avgOrderValue: avgOrderValue,
                    revenueGrowth: calculateGrowth(currentRevenue, previousRevenue),
                    ordersGrowth: calculateGrowth(currentOrders || 0, previousOrders || 0),
                    customersGrowth: calculateGrowth(currentUniqueCustomers, previousUniqueCustomers)
                },
                revenueByMonth,
                categoryStats,
                ordersByStatus,
                topProducts,
                recentActivity
            }
        });
    } catch (error) {
        console.error('API Error - /api/admin/statistics:', error);
        return NextResponse.json(
            { success: false, message: 'Lỗi Server', error: error.message },
            { status: 500 }
        );
    }
}

