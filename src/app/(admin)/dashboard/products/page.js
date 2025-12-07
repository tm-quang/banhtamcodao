/**
 * Admin products management page
 * @file src/app/(admin)/dashboard/products/page.js
 */
import ProductTable from '@/components/admin/ProductTable';

async function fetchData() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';
    try {
        const [productsRes, categoriesRes] = await Promise.all([
            fetch(`${apiUrl}/api/admin/products`, { cache: 'no-store' }),
            fetch(`${apiUrl}/api/admin/categories`, { cache: 'no-store' })
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        return {
            products: productsData.products || [],
            categories: categoriesData.categories || [],
        };
    } catch (error) {
        console.error("Failed to fetch data for admin products page:", error);
        return { products: [], categories: [] };
    }
}

export const metadata = {
    title: 'Quản lý Sản phẩm - Trang Quản Trị',
};

export default async function ProductsPage() {
    const { products, categories } = await fetchData();
    return (
        <ProductTable products={products} categories={categories} />
    );
}