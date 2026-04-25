/**
 * Admin customers management page
 * @file src/app/(admin)/dashboard/customers/page.js
 */
import CustomerTableWrapper from '@/components/admin/CustomerTableWrapper';
import { supabaseAdmin } from '@/lib/supabase';

/** Hàm lấy dữ liệu trên server - gọi trực tiếp database thay vì fetch API */
async function getCustomers() {
    try {
        // Lấy danh sách khách hàng trực tiếp từ database
        const { data: customers, error: customersError } = await supabaseAdmin
            .from('customers')
            .select(`
                id,
                full_name,
                phone_number,
                email,
                role,
                membership_level,
                reward_points,
                created_at
            `)
            .order('created_at', { ascending: false });

        if (customersError) {
            console.error("Database error:", customersError);
            return [];
        }

        // Lấy thống kê đơn hàng
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select('phone_number, total_amount')
            .not('phone_number', 'is', null);

        if (ordersError) {
            console.error("Orders error:", ordersError);
        }

        // Tính tổng đơn và tổng chi tiêu cho mỗi khách hàng
        const orderStats = {};
        if (orders) {
            orders.forEach(order => {
                if (order.phone_number) {
                    if (!orderStats[order.phone_number]) {
                        orderStats[order.phone_number] = { total_orders: 0, total_spent: 0 };
                    }
                    orderStats[order.phone_number].total_orders += 1;
                    orderStats[order.phone_number].total_spent += parseFloat(order.total_amount) || 0;
                }
            });
        }

        // Kết hợp dữ liệu khách hàng với thống kê đơn hàng
        const customersWithStats = (customers || []).map(c => {
            const stats = orderStats[c.phone_number] || { total_orders: 0, total_spent: 0 };
            return {
                id: c.id,
                full_name: c.full_name,
                phone_number: c.phone_number,
                email: c.email,
                username: null,
                role: c.role || 'customer',
                membership_level: c.membership_level || null,
                reward_points: c.reward_points || 0,
                status: 'active',
                created_at: c.created_at,
                total_orders: stats.total_orders,
                total_spent: stats.total_spent
            };
        });

        return customersWithStats;
    } catch (error) {
        console.error("Failed to get customers:", error);
        return [];
    }
}

export const metadata = {
    title: 'Quản lý Khách hàng - Trang Quản Trị',
};

/** Chuyển thành Server Component và truyền data xuống */
export default async function CustomersPage() {
    const customers = await getCustomers();
    return (
        <CustomerTableWrapper customers={customers} />
    );
}