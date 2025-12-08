/**
 * Menu content component with search params
 * @file src/app/menu/MenuContent.js
 */
'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import CategorySlider from '@/components/CategorySlider';
import HeroSection from '@/components/HeroSection';
import MenuFilters from '@/components/MenuFilters';
import { useSearchParams } from 'next/navigation';
import { Star } from 'lucide-react';

/** Lazy load ProductCard để tối ưu hiệu suất */
const ProductCard = dynamic(() => import('@/components/ProductCard'), {
    loading: () => <ProductCardSkeleton />,
    ssr: true
});

async function getProducts(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });

    const res = await fetch(`/api/products?${params.toString()}`, {
        cache: 'no-store'
    });

    if (!res.ok) {
        console.error("Failed to fetch products");
        return [];
    }

    const data = await res.json();
    return data.products || [];
}


/** Loading component */
function MenuLoading() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export default function MenuContent() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [filters, setFilters] = useState({});
    const searchParams = useSearchParams();

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                const data = await response.json();
                if (data.success) {
                    const preferredOrder = ['Bánh Tằm', 'Món Phụ', 'Thức Uống', 'Trà Sữa', 'Ăn Vặt'];
                    const orderIndex = (name) => {
                        const i = preferredOrder.indexOf(name);
                        return i === -1 ? Number.MAX_SAFE_INTEGER : i;
                    };
                    const sorted = (data.categories || []).slice().sort((a, b) => {
                        const ai = orderIndex(a.name);
                        const bi = orderIndex(b.name);
                        if (ai !== bi) return ai - bi;
                        return a.name.localeCompare(b.name);
                    });
                    setCategories(sorted);
                }
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        };
        loadCategories();
    }, []);

    /**
     * Map category names to category IDs for API calls
     */
    const categoryNameToIdMap = useMemo(() => {
        const map = { 'Tất cả': '' };
        categories.forEach(cat => {
            map[cat.name] = cat.id.toString();
        });
        return map;
    }, [categories]);

    /**
     * Get category names for CategorySlider
     */
    const categoryNames = useMemo(() => {
        return ['Tất cả', ...categories.map(cat => cat.name)];
    }, [categories]);

    /**
     * Load products with category filter and other filters
     */
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const search = searchParams.get('search');
                const categoryId = categoryNameToIdMap[activeCategory] || '';
                const allFilters = {
                    category: categoryId,
                    ...filters
                };
                if (search) allFilters.search = search;

                const productsData = await getProducts(allFilters);
                setProducts(productsData);
            } catch (error) {
                console.error('Error loading products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [activeCategory, filters, searchParams, categoryNameToIdMap]);

    const handleCategoryChange = (categoryName) => {
        setActiveCategory(categoryName || 'Tất cả');
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className="pb-8">
            {/* Hero slider for Menu page (shorter height) */}
            <HeroSection
                heightClass="h-[55vh] min-h-[360px]"
                slides={[
                    {
                        imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
                        title: "Thực đơn đặc sắc",
                        subtitle: "Chọn món yêu thích của bạn ngay hôm nay",
                        buttonText: "Xem món",
                        buttonLink: "/menu"
                    },
                    {
                        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop",
                        title: "Nguyên liệu tươi mới",
                        subtitle: "Đảm bảo chất lượng trong từng món",
                        buttonText: "Khám phá",
                        buttonLink: "/menu"
                    },
                    {
                        imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2070&auto=format&fit=crop",
                        title: "Ưu đãi hấp dẫn",
                        subtitle: "Nhiều lựa chọn với mức giá tốt",
                        buttonText: "Xem ưu đãi",
                        buttonLink: "/menu"
                    }
                ]}
            />

            {/* Explore indicator under hero */}
            <div className="-mt-10 mb-10 flex flex-col items-center justify-center">
                <span className="text-white/90 text-sm mb-2">Khám phá thêm</span>
                <div className="w-6 h-10 border-2 border-white/70 rounded-full flex items-start justify-center">
                    <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse"></div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 mt-6">
                <div className="text-center mb-8 md:mb-12">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-[#FF6F30] bg-[#FF6F30]/10 rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        GỢI Ý HÔM NAY
                        <Star className="w-3 h-3 fill-current" />
                    </span>
                    <h1 className="mt-2 text-4xl md:text-5xl font-lobster text-[#222629]">
                        Thực đơn của chúng tôi
                    </h1>
                </div>

                {/* Category Slider */}
                <div className="-mx-4 md:mx-0">
                    <CategorySlider
                        categories={categoryNames}
                        activeCategory={activeCategory}
                        onSelectCategory={handleCategoryChange}
                    />
                </div>

                {/* Filters */}
                <div className="flex justify-end mb-6">
                    <MenuFilters onFiltersChange={handleFiltersChange} />
                </div>

                {/* Products Grid */}
                {loading ? (
                    <MenuLoading />
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-600 text-lg">
                            Không tìm thấy sản phẩm nào trong danh mục này.
                        </p>
                        <button
                            onClick={() => setActiveCategory('')}
                            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Xem tất cả
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
