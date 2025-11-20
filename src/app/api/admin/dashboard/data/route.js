// src/app/api/admin/dashboard/data/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
    try {
        // Lấy đơn hàng mới nhất (10 đơn)
        const [recentOrdersRows] = await pool.execute(
            `SELECT 
                order_code as id,
                recipient_name as customer,
                total_amount,
                status,
                order_time
            FROM orders
            ORDER BY order_time DESC
            LIMIT 10`
        );

        // Format đơn hàng
        const recentOrders = recentOrdersRows.map(order => ({
            id: order.id,
            customer: order.customer || 'N/A',
            total: `${parseInt(order.total_amount).toLocaleString('vi-VN')} ₫`,
            status: order.status || 'Chờ xác nhận'
        }));

        // Lấy khách hàng mới nhất (10 khách hàng)
        // Lấy từ bảng orders, group by phone_number để lấy khách hàng duy nhất
        const [newCustomersRows] = await pool.execute(
            `SELECT DISTINCT
                recipient_name as name,
                phone_number as phone,
                MAX(order_time) as latest_order_time
            FROM orders
            WHERE recipient_name IS NOT NULL AND phone_number IS NOT NULL
            GROUP BY phone_number, recipient_name
            ORDER BY latest_order_time DESC
            LIMIT 10`
        );

        const newCustomers = newCustomersRows.map(customer => ({
            name: customer.name || 'N/A',
            phone: customer.phone || 'N/A'
        }));

        // Lấy top 5 món bán chạy
        // Parse items_list từ orders để tính số lượng bán
        const [allOrders] = await pool.execute(
            `SELECT items_list FROM orders WHERE status IN ('Hoàn thành', 'Đã giao') AND items_list IS NOT NULL AND items_list != ''`
        );

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

