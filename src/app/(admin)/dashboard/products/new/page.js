/**
 * Admin new product page
 * @file src/app/(admin)/dashboard/products/new/page.js
 */
import ProductForm from '@/components/admin/ProductModal';

/** Lấy danh sách danh mục để truyền vào form */
async function getCategories() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';
    try {
        const res = await fetch(`${apiUrl}/api/admin/categories`, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.categories || [];
    } catch (error) {
        return [];
    }
}

export const metadata = {
    title: 'Thêm sản phẩm mới - Trang Quản Trị',
};

export default async function NewProductPage() {
    const categories = await getCategories();
    return (
        <ProductForm categories={categories} />
    );
}