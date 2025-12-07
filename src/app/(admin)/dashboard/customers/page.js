/**
 * Admin customers management page
 * @file src/app/(admin)/dashboard/customers/page.js
 */
import CustomerTable from '@/components/admin/CustomerTable';

/** Hàm lấy dữ liệu trên server */
async function getCustomers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';
    try {
        const res = await fetch(`${apiUrl}/api/admin/customers`, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.customers || [];
    } catch (error) {
        console.error("Failed to fetch customers:", error);
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
        <CustomerTable customers={customers} />
    );
}