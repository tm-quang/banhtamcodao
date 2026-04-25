/**
 * src/app/api/admin/analytics/route.js
 * API xử lý thống kê và báo cáo nâng cao (Doanh thu, Món ăn, Khách hàng)
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminAPI, errorResponse, successResponse, handleAPIError } from '@/lib/api-security';

export const dynamic = 'force-dynamic';

const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
};

export async function GET(request) {
    if (!supabaseAdmin) {
        console.error('supabaseAdmin is not initialized. Check your environment variables.');
        return errorResponse('Database configuration error', 500);
    }

    const { error: authError } = await verifyAdminAPI(request);
    if (authError) return errorResponse('Unauthorized', 401);

    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'overview'; // overview, revenue, products, customers
        const dateRange = searchParams.get('dateRange') || 'thisMonth';

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfThisYear = new Date(now.getFullYear(), 0, 1);

        // 1. Overview Stats (Luôn trả về cho phần Header)
        // Thử lấy tất cả đơn hàng để xem có dữ liệu không
        const { data: allOrders, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('*');

        if (fetchError) {
            console.error('Fetch Error:', fetchError);
            return errorResponse('Lỗi truy vấn CSDL: ' + fetchError.message, 500);
        }

        console.log('API Analytics: Found', allOrders?.length, 'orders total');

        let totalRevenue = 0;
        let todayRevenue = 0;
        let monthRevenue = 0;
        let lastMonthRevenue = 0;
        const customerSet = new Set();
        const productSales = {};

        // Bao gồm các đơn hàng có khả năng thành công cao để báo cáo chính xác hơn
        const validStatuses = ['Hoàn thành', 'Đã giao', 'Đã xác nhận', 'Đang vận chuyển'];
        const validOrders = allOrders?.filter(o => validStatuses.includes(o.status)) || [];
        console.log('API Analytics: Found', validOrders.length, 'valid orders for analysis');

        validOrders.forEach(order => {
            const amount = parseFloat(order.total_amount) || 0;
            const date = new Date(order.order_time);
            totalRevenue += amount;
            if (order.phone_number) customerSet.add(order.phone_number);

            if (date >= startOfToday) todayRevenue += amount;
            if (date >= startOfThisMonth) monthRevenue += amount;
            if (date >= startOfLastMonth && date < startOfThisMonth) lastMonthRevenue += amount;

            // Xử lý sản phẩm cho phần Product Analytics
            try {
                if (order.items_list) {
                    const items = typeof order.items_list === 'string' ? JSON.parse(order.items_list) : order.items_list;
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            const name = item.name || 'N/A';
                            if (!productSales[name]) productSales[name] = { qty: 0, revenue: 0 };
                            productSales[name].qty += parseInt(item.quantity || 1);
                            productSales[name].revenue += (parseFloat(item.price || 0) * parseInt(item.quantity || 1));
                        });
                    }
                }
            } catch (e) {
                console.error('Error parsing items_list for order', order.id, e);
            }
        });

        const overview = {
            totalRevenue,
            todayRevenue,
            monthRevenue,
            monthGrowth: calculateGrowth(monthRevenue, lastMonthRevenue),
            totalOrders: validOrders.length,
            totalCustomers: customerSet.size
        };

        // 2. Revenue by Time (Phân tích theo Ngày/Tháng/Năm)
        const revenueByTime = [];
        if (dateRange === 'thisYear') {
            // Doanh thu theo 12 tháng
            for (let i = 0; i < 12; i++) {
                const mStart = new Date(now.getFullYear(), i, 1);
                const mEnd = new Date(now.getFullYear(), i + 1, 0, 23, 59, 59);
                const mRevenue = validOrders.filter(o => {
                    const d = new Date(o.order_time);
                    return d >= mStart && d <= mEnd;
                }).reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0;
                revenueByTime.push({ label: `Tháng ${i + 1}`, value: mRevenue });
            }
        } else {
            // Doanh thu theo 30 ngày gần nhất
            for (let i = 29; i >= 0; i--) {
                const dStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                const dEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59);
                const dRevenue = validOrders.filter(o => {
                    const d = new Date(o.order_time);
                    return d >= dStart && d <= dEnd;
                }).reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0;
                revenueByTime.push({ label: `${dStart.getDate()}/${dStart.getMonth() + 1}`, value: dRevenue });
            }
        }

        // 3. Top Products
        const topProducts = Object.entries(productSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        // 4. Revenue by Category
        const { data: categories } = await supabaseAdmin.from('categories').select('id, name');
        const categoryStats = categories?.map(cat => {
            let catRevenue = 0;
            validOrders.forEach(order => {
                try {
                    const items = typeof order.items_list === 'string' ? JSON.parse(order.items_list) : order.items_list;
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            if (item.category_id === cat.id || item.category === cat.name) {
                                catRevenue += (parseFloat(item.price || 0) * parseInt(item.quantity || 1));
                            }
                        });
                    }
                } catch (e) {}
            });
            return { name: cat.name, revenue: catRevenue };
        }).filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue) || [];

        // 5. Customer Group Analysis
        const { data: customerGroups } = await supabaseAdmin.from('customer_groups').select('id, name');
        const { data: customers } = await supabaseAdmin.from('customers').select('phone_number, membership_level');
        
        const groupRevenue = {};
        customerGroups?.forEach(g => groupRevenue[g.name] = 0);
        groupRevenue['Khách lẻ'] = 0;

        validOrders.forEach(order => {
            const customer = customers?.find(c => c.phone_number === order.phone_number);
            const groupName = customer?.membership_level || 'Khách lẻ';
            if (groupRevenue[groupName] !== undefined) {
                groupRevenue[groupName] += parseFloat(order.total_amount || 0);
            } else {
                groupRevenue['Khách lẻ'] += parseFloat(order.total_amount || 0);
            }
        });

        const customerGroupStats = Object.entries(groupRevenue)
            .map(([name, revenue]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue);

        return successResponse({
            data: {
                overview,
                revenueByTime,
                topProducts,
                categoryStats,
                customerGroupStats,
                debug: {
                    totalOrdersInDb: allOrders?.length,
                    validOrdersCount: validOrders.length,
                    dateRange
                }
            }
        }, 'Lấy dữ liệu phân tích thành công');
    } catch (error) {
        return handleAPIError(error, 'GET /api/admin/analytics');
    }
}
