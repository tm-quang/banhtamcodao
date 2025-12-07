/**
 * Admin orders management page
 * @file src/app/(admin)/dashboard/orders/page.js
 */
import OrderTable from '@/components/admin/OrderTable';

async function getOrders() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';
    try {
        const res = await fetch(`${apiUrl}/api/admin/orders`, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.orders || [];
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
    }
}

export const metadata = {
    title: 'Quản lý Đơn hàng - Trang Quản Trị',
};

export default async function OrdersPage() {
    const orders = await getOrders();
    return (
        <OrderTable orders={orders} />
    );
}