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
import { Star, PackageSearch } from 'lucide-react';

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
        <div className="product-grid">
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
                        if (!name) return Number.MAX_SAFE_INTEGER;
                        const normalized = name.toLowerCase().trim();
                        const index = preferredOrder.findIndex(item => item.toLowerCase() === normalized);
                        return index === -1 ? Number.MAX_SAFE_INTEGER : index;
                    };
                    const sorted = (data.categories || []).slice().sort((a, b) => {
                        const ai = orderIndex(a.name);
                        const bi = orderIndex(b.name);
                        if (ai !== bi) return ai - bi;
                        return (a.name || '').localeCompare(b.name || '', 'vi');
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
                heightClass="min-h-[500px] lg:min-h-[600px]"
            />

            {/* Explore indicator under hero */}
            <div className="py-4 flex flex-col items-center justify-center">
                <span className="text-gray-400 text-[13px] mb-1.5">Khám phá thực đơn</span>
                <div className="w-5 h-8 border-2 border-gray-300 rounded-full flex items-start justify-center">
                    <div className="w-0.5 h-2 bg-gray-400 rounded-full mt-1 animate-pulse"></div>
                </div>
            </div>

            <div className="page-container mt-6">
                <div className="text-center mb-2 md:mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-[#FF6F30] bg-[#FF6F30]/10 rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        GỢI Ý HÔM NAY
                        <Star className="w-3 h-3 fill-current" />
                    </span>
                    <h1 className="mt-2 text-3xl md:text-4xl font-lobster text-[#222629]">
                        Thực đơn của chúng tôi
                    </h1>
                </div>

                {/* Category Slider */}
                <div className="w-full md:mx-0">
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
                    <div className="product-grid">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white/60 backdrop-blur-md rounded-3xl border border-orange-100 shadow-xl max-w-2xl mx-auto my-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        {/* Decorative background gradients */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-100/30 rounded-full blur-2xl"></div>

                        <div className="relative mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 relative z-10">
                                <PackageSearch className="w-12 h-12 text-white" strokeWidth={1.5} />
                            </div>
                            {/* Soft glowing rings behind the icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full animate-pulse z-0"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-100/40 rounded-full animate-ping z-0" style={{ animationDuration: '3s' }}></div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-800 mb-3 font-roboto">Không tìm thấy sản phẩm nào trong danh mục này</h3>
                        <p className="text-gray-500 text-base max-w-md mb-8 leading-relaxed">
                            Vui lòng chọn danh mục khác hoặc quay lại sau nhé!
                        </p>
                        
                        <button
                            onClick={() => setActiveCategory('Tất cả')}
                            className="relative z-10 px-8 py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
                        >
                            Xem tất cả món ăn
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
