/**
 * Admin products management page
 * @file src/app/(admin)/dashboard/products/page.js
 */
import ProductTable from '@/components/admin/ProductTable';
import ClientNoSSR from '@/components/ClientNoSSR';

// Function để tính số lượng đã bán từ orders
async function calculateSoldQuantities(supabaseAdmin) {
    try {
        // Lấy tất cả đơn hàng đã xác nhận/hoàn thành
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('id, items_list, status')
            .in('status', ['Đã xác nhận', 'Đang vận chuyển', 'Hoàn thành', 'Đã giao']);

        if (error) {
            console.error('Error fetching orders for sold quantity:', error);
            return {};
        }

        const soldQuantities = {}; // { productId: quantity, productName: quantity }

        orders?.forEach(order => {
            if (!order.items_list) return;

            try {
                let items = [];
                const itemsList = order.items_list.trim();

                // Parse items_list
                if (itemsList.startsWith('[')) {
                    items = JSON.parse(itemsList);
                } else if (itemsList.includes('|||')) {
                    items = itemsList.split('|||')
                        .map(item => {
                            try {
                                return JSON.parse(item.trim());
                            } catch {
                                return null;
                            }
                        })
                        .filter(Boolean);
                } else {
                    try {
                        const parsed = JSON.parse(itemsList);
                        items = Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return;
                    }
                }

                // Đếm số lượng đã bán
                items.forEach(item => {
                    const productId = item.id ? parseInt(item.id, 10) : null;
                    const productName = item.name ? item.name.trim() : null;
                    const quantity = parseInt(item.quantity || item.qty || 1, 10);

                    if (productId) {
                        soldQuantities[productId] = (soldQuantities[productId] || 0) + quantity;
                    }
                    if (productName) {
                        soldQuantities[productName] = (soldQuantities[productName] || 0) + quantity;
                    }
                });
            } catch (err) {
                // Bỏ qua nếu parse lỗi
                console.error('Error parsing items_list:', err);
            }
        });

        return soldQuantities;
    } catch (error) {
        console.error('Error calculating sold quantities:', error);
        return {};
    }
}

async function fetchData() {
    try {
        // Import supabaseAdmin để fetch trực tiếp từ database
        const { supabaseAdmin } = await import('@/lib/supabase');
        
        // Fetch products, categories và tính số lượng đã bán
        const [productsResult, categoriesResult, soldQuantities] = await Promise.all([
            supabaseAdmin
                .from('products')
                .select(`
                    id, name, slug, description, price, discount_price,
                    status, image_url, is_special, category_id, inventory,
                    categories(name)
                `)
                .order('id', { ascending: false }),
            supabaseAdmin
                .from('categories')
                .select('*')
                .order('name', { ascending: true }),
            calculateSoldQuantities(supabaseAdmin)
        ]);

        if (productsResult.error) {
            console.error('Error fetching products:', productsResult.error);
            return { products: [], categories: [] };
        }

        if (categoriesResult.error) {
            console.error('Error fetching categories:', categoriesResult.error);
            return { products: [], categories: [] };
        }

        // Transform products data
        const products = (productsResult.data || []).map(p => {
            // Lấy sold_quantity từ productId hoặc productName
            const soldQuantity = soldQuantities[p.id] || soldQuantities[p.name] || 0;
            
            return {
                ...p,
                category_name: p.categories?.name,
                price: parseFloat(p.price),
                discount_price: p.discount_price ? parseFloat(p.discount_price) : null,
                inventory: p.inventory !== undefined ? (p.inventory !== null ? parseInt(p.inventory, 10) : null) : null,
                sold_quantity: soldQuantity,
            };
        }).map(p => {
            delete p.categories;
            return p;
        });

        const categories = categoriesResult.data || [];

        console.log('Fetched products count:', products.length);
        console.log('Fetched categories count:', categories.length);

        return {
            products,
            categories,
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
        <ClientNoSSR>
            <ProductTable products={products} categories={categories} />
        </ClientNoSSR>
    );
}