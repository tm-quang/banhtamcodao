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
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // === KPI QUERIES ===

        // Total revenue (all completed orders)
        const { data: allCompletedOrders } = await supabase
            .from('orders')
            .select('total_amount, order_time, status')
            .in('status', ['Hoàn thành', 'Đã giao']);

        // Calculate revenues for different periods
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

            if (orderDate >= today) {
                dailyRevenue += amount;
            } else if (orderDate >= yesterday && orderDate < today) {
                yesterdayRevenue += amount;
            }

            if (orderDate >= thisWeekStart) {
                weeklyRevenue += amount;
            } else if (orderDate >= lastWeekStart && orderDate < thisWeekStart) {
                lastWeekRevenue += amount;
            }

            if (orderDate >= thisMonthStart) {
                monthlyRevenue += amount;
            } else if (orderDate >= lastMonthStart && orderDate < thisMonthStart) {
                lastMonthRevenue += amount;
            }
        });

        // Order counts
        const { count: totalOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        const { count: monthlyOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('order_time', thisMonthStart.toISOString());

        const { count: lastMonthOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('order_time', lastMonthStart.toISOString())
            .lt('order_time', thisMonthStart.toISOString());

        const { count: completedOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .in('status', ['Hoàn thành', 'Đã giao']);

        const { count: cancelledOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Đã hủy');

        const { count: productCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        const { count: categoryCount } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true });

        // New customers this week vs last week (from orders unique phone numbers)
        const { data: thisWeekCustomers } = await supabase
            .from('orders')
            .select('phone_number')
            .gte('order_time', thisWeekStart.toISOString())
            .not('phone_number', 'is', null);

        const { data: lastWeekCustomers } = await supabase
            .from('orders')
            .select('phone_number')
            .gte('order_time', lastWeekStart.toISOString())
            .lt('order_time', thisWeekStart.toISOString())
            .not('phone_number', 'is', null);

        const thisWeekUniqueCustomers = new Set(thisWeekCustomers?.map(c => c.phone_number)).size;
        const lastWeekUniqueCustomers = new Set(lastWeekCustomers?.map(c => c.phone_number)).size;

        // === CATEGORY DISTRIBUTION FOR PIE CHART ===
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name');

        const { data: products } = await supabase
            .from('products')
            .select('category_id');

        const categoryColors = ['#ff6f30', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
        const categoryDistribution = categories?.map((cat, index) => ({
            name: cat.name,
            value: products?.filter(p => p.category_id === cat.id).length || 0,
            color: categoryColors[index % categoryColors.length]
        })).filter(c => c.value > 0) || [];

        // === RECENT ORDERS (existing) ===
        const { data: recentOrdersRows } = await supabase
            .from('orders')
            .select('order_code, recipient_name, total_amount, status, order_time')
            .order('order_time', { ascending: false })
            .limit(10);

        const recentOrders = recentOrdersRows?.map(order => ({
            id: order.order_code,
            customer: order.recipient_name || 'N/A',
            total: `${parseInt(order.total_amount).toLocaleString('vi-VN')} ₫`,
            status: order.status || 'Chờ xác nhận'
        })) || [];

        // === NEW CUSTOMERS (existing) ===
        const { data: customerOrders } = await supabase
            .from('orders')
            .select('recipient_name, phone_number, order_time')
            .not('recipient_name', 'is', null)
            .not('phone_number', 'is', null)
            .order('order_time', { ascending: false })
            .limit(50);

        const uniqueCustomers = [];
        const seenPhones = new Set();
        for (const order of customerOrders || []) {
            if (!seenPhones.has(order.phone_number)) {
                seenPhones.add(order.phone_number);
                uniqueCustomers.push({
                    name: order.recipient_name || 'N/A',
                    phone: order.phone_number || 'N/A'
                });
            }
            if (uniqueCustomers.length >= 10) break;
        }

        // === TOP PRODUCTS (existing) ===
        const { data: allOrders } = await supabase
            .from('orders')
            .select('items_list')
            .in('status', ['Hoàn thành', 'Đã giao'])
            .not('items_list', 'is', null)
            .neq('items_list', '');

        const productSales = {};
        allOrders?.forEach(order => {
            if (order.items_list) {
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
                            const quantity = parseInt(item.quantity) || parseInt(item.qty) || 1;
                            if (productName) {
                                productSales[productName] = (productSales[productName] || 0) + quantity;
                            }
                        }
                    });
                } catch { /* ignore */ }
            }
        });

        const topProducts = Object.entries(productSales)
            .map(([name, sold]) => ({ name, sold }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);

        // === RECENT ACTIVITIES ===
        const { data: recentActivityOrders } = await supabase
            .from('orders')
            .select('order_code, recipient_name, order_time, status, total_amount')
            .order('order_time', { ascending: false })
            .limit(15);

        const recentActivities = (recentActivityOrders || []).map(order => {
            let type = 'order';
            let message = '';
            let icon = '📦';

            if (order.status === 'Hoàn thành' || order.status === 'Đã giao') {
                type = 'completed';
                message = `Đơn hàng ${order.order_code} đã giao thành công`;
                icon = '✅';
            } else if (order.status === 'Đã hủy') {
                type = 'cancelled';
                message = `Đơn hàng ${order.order_code} đã bị hủy`;
                icon = '❌';
            } else if (order.status === 'Đang vận chuyển') {
                type = 'shipping';
                message = `Đơn hàng ${order.order_code} đang được giao`;
                icon = '🚚';
            } else {
                message = `${order.recipient_name || 'Khách hàng'} đặt đơn ${order.order_code}`;
                icon = '🛒';
            }

            return {
                type,
                message,
                time: formatRelativeTime(order.order_time),
                icon,
                amount: parseInt(order.total_amount).toLocaleString('vi-VN') + ' ₫'
            };
        });

        // === 7-DAY REVENUE TREND FOR LINE CHART ===
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last7Days.push(date);
        }

        const revenueTrend = last7Days.map(date => {
            const dayStart = new Date(date);
            const dayEnd = new Date(date);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const dayRevenue = allCompletedOrders?.filter(order => {
                const orderDate = new Date(order.order_time);
                return orderDate >= dayStart && orderDate < dayEnd;
            }).reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;

            return {
                date: date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }),
                revenue: Math.round(dayRevenue / 1000), // in thousands
                fullDate: date.toISOString()
            };
        });

        // === BUILD KPI STATS ===
        const kpiStats = {
            totalOrders: {
                value: totalOrders || 0,
                label: 'Đơn hàng'
            },
            monthlyOrders: {
                value: monthlyOrders || 0,
                prevValue: lastMonthOrders || 0,
                growth: calculateGrowth(monthlyOrders || 0, lastMonthOrders || 0),
                label: 'Đơn trong tháng'
            },
            completedOrders: {
                value: completedOrders || 0,
                label: 'Đã giao thành công'
            },
            cancelledOrders: {
                value: cancelledOrders || 0,
                label: 'Đã hủy'
            },
            productCount: {
                value: productCount || 0,
                label: 'Tổng món ăn'
            },
            categoryCount: {
                value: categoryCount || 0,
                label: 'Danh mục'
            },
            totalRevenue: {
                value: totalRevenue,
                label: 'Tổng doanh thu'
            },
            monthlyRevenue: {
                value: monthlyRevenue,
                prevValue: lastMonthRevenue,
                growth: calculateGrowth(monthlyRevenue, lastMonthRevenue),
                label: 'Doanh thu tháng'
            },
            weeklyRevenue: {
                value: weeklyRevenue,
                prevValue: lastWeekRevenue,
                growth: calculateGrowth(weeklyRevenue, lastWeekRevenue),
                label: 'Doanh thu tuần'
            },
            dailyRevenue: {
                value: dailyRevenue,
                prevValue: yesterdayRevenue,
                growth: calculateGrowth(dailyRevenue, yesterdayRevenue),
                label: 'Doanh thu ngày'
            },
            newCustomers: {
                value: thisWeekUniqueCustomers,
                prevValue: lastWeekUniqueCustomers,
                growth: calculateGrowth(thisWeekUniqueCustomers, lastWeekUniqueCustomers),
                label: 'Khách mới tuần này'
            }
        };

        return NextResponse.json({
            success: true,
            data: {
                // Existing data
                recentOrders,
                newCustomers: uniqueCustomers,
                topProducts,
                // New enhanced data
                kpiStats,
                categoryDistribution,
                recentActivities,
                revenueTrend
            }
        });
    } catch (error) {
        console.error('API Error - /api/admin/dashboard/data:', error);
        return NextResponse.json(
            { success: false, message: 'Lỗi Server' },
            { status: 500 }
        );
    }
}
