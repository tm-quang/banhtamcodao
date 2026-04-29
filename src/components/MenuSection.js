// src/components/MenuSection.js
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import AnimateOnScroll from './AnimateOnScroll';
import CategorySlider from './CategorySlider';
import { Search, Star, PackageSearch } from 'lucide-react';

const MAX_PRODUCTS_PER_CATEGORY = 12;


export default function MenuSection({ products, categoriesList = [] }) {
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const categories = useMemo(() => {
        const categoryMap = products.reduce((acc, product) => {
            /**
             * Support both database structure (categories.name) and mock structure (category_name)
             */
            const category = product.categories?.name || product.category_name || 'Khác';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(product);
            return acc;
        }, {});

        const productCategoryNames = Object.keys(categoryMap);
        const categoryNamesFromApi = categoriesList.map((item) => item.name);
        const preferredCategoryOrder = ['Bánh Tằm', 'Món Phụ', 'Thức Uống', 'Trà Sữa', 'Ăn Vặt'];
        const orderIndex = (name) => {
            if (!name) return Number.MAX_SAFE_INTEGER;
            const normalized = name.toLowerCase().trim();
            const index = preferredCategoryOrder.findIndex(item => item.toLowerCase() === normalized);
            return index === -1 ? Number.MAX_SAFE_INTEGER : index;
        };
        const allCategoryNames = Array.from(new Set([...categoryNamesFromApi, ...productCategoryNames]))
            .filter(Boolean)
            .sort((a, b) => {
                const ai = orderIndex(a);
                const bi = orderIndex(b);
                if (ai !== bi) return ai - bi;
                return a.localeCompare(b, 'vi');
            });

        const normalizedMap = {};
        allCategoryNames.forEach((name) => {
            if (typeof name === 'string') {
                normalizedMap[name] = categoryMap[name] || [];
            }
        });

        return { 'Tất cả': products, ...normalizedMap };
    }, [products, categoriesList]);

    const categoryNames = Object.keys(categories);
    const displayedProducts = categories[activeCategory] || [];
    const hasMoreProducts = displayedProducts.length > MAX_PRODUCTS_PER_CATEGORY;

    return (
        <AnimateOnScroll>
            <div className="text-center md:mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-[#FF6F30] bg-[#FF6F30]/10 rounded-full">
                    <Star className="w-3 h-3 fill-current" />
                    GỢI Ý HÔM NAY
                    <Star className="w-3 h-3 fill-current" />
                </span>
                <h2 className="mt-2 text-3xl md:text-4xl font-lobster text-[#222629]">
                    Thực đơn của chúng tôi
                </h2>
            </div>

            {/* Category Filters */}
            <div className="w-full md:mx-0">
                <CategorySlider
                    categories={categoryNames}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                />
            </div>


            {/* Product Grid */}
            {displayedProducts.length > 0 ? (
                <div className="product-grid items-stretch">
                    {displayedProducts.slice(0, MAX_PRODUCTS_PER_CATEGORY).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-3xl max-w-2xl mx-auto my-8 relative">
                    {/* Decorative background gradients */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl transition-colors duration-500"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-100/30 rounded-full blur-2xl"></div>

                    <div className="relative mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 relative z-10">
                            <PackageSearch className="w-12 h-12 text-white" strokeWidth={1.5} />
                        </div>
                        {/* Soft glowing rings behind the icon */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full animate-pulse z-0"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-100/40 rounded-full animate-ping z-0" style={{ animationDuration: '3s' }}></div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-3 font-roboto">Chưa có món trong mục này</h3>
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

            {/* Load More Button (if needed) */}
            {hasMoreProducts && (
                <div className="text-center mt-10">
                    <Link
                        href="/menu"
                        className="inline-flex items-center justify-center bg-[#222629] text-white font-bold py-3 px-8 rounded-full hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        Xem thêm sản phẩm
                    </Link>
                </div>
            )}
        </AnimateOnScroll>
    );
}