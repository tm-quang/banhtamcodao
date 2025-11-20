// src/app/api/admin/dashboard/data/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
    try {
        // Lấy đơn hàng mới nhất (10 đơn)
        const { data: recentOrdersRows, error: recentError } = await supabase
            .from('orders')
            .select('order_code, recipient_name, total_amount, status, order_time')
            .order('order_time', { ascending: false })
            .limit(10);

        if (recentError) throw recentError;

        // Format đơn hàng
        const recentOrders = recentOrdersRows.map(order => ({
            id: order.order_code,
            customer: order.recipient_name || 'N/A',
            total: `${parseInt(order.total_amount).toLocaleString('vi-VN')} ₫`,
            status: order.status || 'Chờ xác nhận'
        }));

        // Lấy khách hàng mới nhất (10 khách hàng)
        // Lấy từ bảng orders, group by phone_number để lấy khách hàng duy nhất
        // Supabase doesn't support DISTINCT ON directly in select without RPC easily for this case
        // So we fetch more orders and filter in JS, or use a separate query if we had a good way.
        // Fetching last 50 orders to extract unique customers
        const { data: customerOrders, error: customerError } = await supabase
            .from('orders')
            .select('recipient_name, phone_number, order_time')
            .not('recipient_name', 'is', null)
            .not('phone_number', 'is', null)
            .order('order_time', { ascending: false })
            .limit(50);

        if (customerError) throw customerError;

        const uniqueCustomers = [];
        const seenPhones = new Set();

        for (const order of customerOrders) {
            if (!seenPhones.has(order.phone_number)) {
                seenPhones.add(order.phone_number);
                uniqueCustomers.push({
                    name: order.recipient_name || 'N/A',
                    phone: order.phone_number || 'N/A'
                });
            }
            if (uniqueCustomers.length >= 10) break;
        }

        const newCustomers = uniqueCustomers;

        // Lấy top 5 món bán chạy
        // Parse items_list từ orders để tính số lượng bán
        const { data: allOrders, error: allOrdersError } = await supabase
            .from('orders')
            .select('items_list')
            .in('status', ['Hoàn thành', 'Đã giao'])
            .not('items_list', 'is', null)
            .neq('items_list', '');

        if (allOrdersError) throw allOrdersError;

        // Parse items_list và tính tổng số lượng bán
        const productSales = {};
        allOrders.forEach(order => {
            if (order.items_list) {
                try {
                    let items = [];

                    // Thử parse như array JSON trước
                    if (order.items_list.trim().startsWith('[')) {
                        items = JSON.parse(order.items_list);
                    }
                    // Nếu có "|||" thì split và parse từng item
                    else if (order.items_list.includes('|||')) {
                        items = order.items_list.split('|||')
                            .map(item => {
                                try {
                                    return JSON.parse(item.trim());
                                } catch {
                                    return null;
                                }
                            })
                            .filter(Boolean);
                    }
                    // Nếu là JSON object đơn
                    else {
                        try {
                            const parsed = JSON.parse(order.items_list);
                            items = Array.isArray(parsed) ? parsed : [parsed];
                        } catch {
                            // Nếu không parse được, bỏ qua
                            return;
                        }
                    }

                    // Tính tổng số lượng bán cho mỗi sản phẩm
                    items.forEach(item => {
                        if (item && item.name) {
                            const productName = item.name.trim();
                            const quantity = parseInt(item.quantity) || parseInt(item.qty) || 1;
                            if (productName) {
                                productSales[productName] = (productSales[productName] || 0) + quantity;
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error parsing items_list:', error, 'Items:', order.items_list?.substring(0, 100));
                }
            }
        });

        // Chuyển đổi thành array và sort
        const topProducts = Object.entries(productSales)
            .map(([name, sold]) => ({ name, sold }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);

        return NextResponse.json({
            success: true,
            data: {
                recentOrders,
                newCustomers,
                topProducts
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

