/**
 * Admin Reports API route handler
 * @file src/app/api/admin/reports/route.js
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

        const thisQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const lastQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);

        const thisYearStart = new Date(now.getFullYear(), 0, 1);
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);

        // Get all completed orders
        const { data: allCompletedOrders } = await supabase
            .from('orders')
            .select('total_amount, order_time, status')
            .in('status', ['Hoàn thành', 'Đã giao']);

        // Calculate revenue for different periods
        let todayRevenue = 0;
        let yesterdayRevenue = 0;
        let thisWeekRevenue = 0;
        let lastWeekRevenue = 0;
        let thisMonthRevenue = 0;
        let lastMonthRevenue = 0;
        let thisQuarterRevenue = 0;
        let lastQuarterRevenue = 0;
        let thisYearRevenue = 0;
        let lastYearRevenue = 0;

        allCompletedOrders?.forEach(order => {
            const amount = parseFloat(order.total_amount) || 0;
            const orderDate = new Date(order.order_time);

            if (orderDate >= today) {
                todayRevenue += amount;
            } else if (orderDate >= yesterday && orderDate < today) {
                yesterdayRevenue += amount;
            }

            if (orderDate >= thisWeekStart) {
                thisWeekRevenue += amount;
            } else if (orderDate >= lastWeekStart && orderDate < thisWeekStart) {
                lastWeekRevenue += amount;
            }

            if (orderDate >= thisMonthStart) {
                thisMonthRevenue += amount;
            } else if (orderDate >= lastMonthStart && orderDate < thisMonthStart) {
                lastMonthRevenue += amount;
            }

            if (orderDate >= thisQuarterStart) {
                thisQuarterRevenue += amount;
            } else if (orderDate >= lastQuarterStart && orderDate < thisQuarterStart) {
                lastQuarterRevenue += amount;
            }

            if (orderDate >= thisYearStart) {
                thisYearRevenue += amount;
            } else if (orderDate >= lastYearStart && orderDate < thisYearStart) {
                lastYearRevenue += amount;
            }
        });

        // Top products by revenue
        const { data: ordersWithItems } = await supabase
            .from('orders')
            .select('items_list, total_amount')
            .in('status', ['Hoàn thành', 'Đã giao'])
            .not('items_list', 'is', null);

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

        // Calculate growth for each product (compare this month vs last month)
        const thisMonthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const { data: thisMonthOrders } = await supabase
            .from('orders')
            .select('items_list')
            .gte('order_time', thisMonthStartDate.toISOString())
            .lt('order_time', thisMonthEndDate.toISOString())
            .in('status', ['Hoàn thành', 'Đã giao'])
            .not('items_list', 'is', null);

        const { data: lastMonthOrders } = await supabase
            .from('orders')
            .select('items_list')
            .gte('order_time', lastMonthStartDate.toISOString())
            .lt('order_time', thisMonthStartDate.toISOString())
            .in('status', ['Hoàn thành', 'Đã giao'])
            .not('items_list', 'is', null);

        const thisMonthProductSales = {};
        thisMonthOrders?.forEach(order => {
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
                        const price = parseFloat(item.price || item.total || 0);
                        const quantity = parseInt(item.quantity || item.qty || 1);
                        if (productName) {
                            thisMonthProductSales[productName] = (thisMonthProductSales[productName] || 0) + (price * quantity);
                        }
                    }
                });
            } catch { /* ignore */ }
        });

        const lastMonthProductSales = {};
        lastMonthOrders?.forEach(order => {
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
                        const price = parseFloat(item.price || item.total || 0);
                        const quantity = parseInt(item.quantity || item.qty || 1);
                        if (productName) {
                            lastMonthProductSales[productName] = (lastMonthProductSales[productName] || 0) + (price * quantity);
                        }
                    }
                });
            } catch { /* ignore */ }
        });

        const topProducts = Object.entries(productSales)
            .map(([name, data]) => ({
                name,
                revenue: data.revenue,
                orders: data.orders,
                growth: calculateGrowth(
                    thisMonthProductSales[name] || 0,
                    lastMonthProductSales[name] || 0
                )
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Top categories
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name');

        const categoryRevenue = {};
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
        const topCategories = categories?.map(cat => {
            const revenue = categoryRevenue[cat.id] || 0;
            const percentage = totalCategoryRevenue > 0 ? Math.round((revenue / totalCategoryRevenue) * 100) : 0;
            return {
                name: cat.name,
                revenue: revenue,
                percentage: percentage
            };
        }).filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue) || [];

        // Top customers
        const { data: customerOrders } = await supabase
            .from('orders')
            .select('recipient_name, phone_number, email, total_amount')
            .in('status', ['Hoàn thành', 'Đã giao'])
            .not('phone_number', 'is', null);

        const customerSpending = {};
        customerOrders?.forEach(order => {
            const phone = order.phone_number;
            if (!customerSpending[phone]) {
                customerSpending[phone] = {
                    name: order.recipient_name || 'N/A',
                    email: order.email || '',
                    spent: 0,
                    orders: 0
                };
            }
            customerSpending[phone].spent += parseFloat(order.total_amount) || 0;
            customerSpending[phone].orders += 1;
        });

        const topCustomers = Object.values(customerSpending)
            .sort((a, b) => b.spent - a.spent)
            .slice(0, 5);

        // Inventory (mock data for now - can be enhanced with actual inventory table)
        const { count: inStockProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        const inventory = {
            inStock: inStockProducts || 0,
            lowStock: 0, // Can be calculated if you have stock_quantity field
            outOfStock: 0,
            items: [] // Can be populated with actual inventory data
        };

        return NextResponse.json({
            success: true,
            data: {
                revenueData: {
                    today: { value: todayRevenue, change: calculateGrowth(todayRevenue, yesterdayRevenue) },
                    thisWeek: { value: thisWeekRevenue, change: calculateGrowth(thisWeekRevenue, lastWeekRevenue) },
                    thisMonth: { value: thisMonthRevenue, change: calculateGrowth(thisMonthRevenue, lastMonthRevenue) },
                    thisQuarter: { value: thisQuarterRevenue, change: calculateGrowth(thisQuarterRevenue, lastQuarterRevenue) },
                    thisYear: { value: thisYearRevenue, change: calculateGrowth(thisYearRevenue, lastYearRevenue) }
                },
                topProducts,
                topCategories,
                topCustomers,
                inventory
            }
        });
    } catch (error) {
        console.error('API Error - /api/admin/reports:', error);
        return NextResponse.json(
            { success: false, message: 'Lỗi Server', error: error.message },
            { status: 500 }
        );
    }
}

