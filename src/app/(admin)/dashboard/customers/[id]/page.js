/**
 * Admin customer details page
 * @file src/app/(admin)/dashboard/customers/[id]/page.js
 */
import CustomerDetailsClient from '@/components/admin/CustomerDetailsClient';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';

async function getCustomerData(id) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';
    try {
        const [customerRes, ordersRes] = await Promise.all([
            fetch(`${apiUrl}/api/admin/customers/${id}`, { cache: 'no-store' }),
            fetch(`${apiUrl}/api/admin/customers/${id}/orders`, { cache: 'no-store' })
        ]);

        if (!customerRes.ok) return { customer: null, orders: [] };

        const customerData = await customerRes.json();
        const ordersData = await ordersRes.json();

        return {
            customer: customerData.customer || null,
            orders: ordersData.orders || []
        };
    } catch (error) {
        console.error("Failed to fetch customer data:", error);
        return { customer: null, orders: [] };
    }
}

export default async function CustomerDetailsPage({ params }) {
    const { id } = params;
    const { customer, orders } = await getCustomerData(id);

    if (!customer) {
        return (
            <Box>
                <Typography variant="h5">Không tìm thấy khách hàng</Typography>
                <Link href="/admin/customers">Quay lại danh sách</Link>
            </Box>
        );
    }

    return (
        <CustomerDetailsClient customer={customer} initialOrders={orders} />
    );
}