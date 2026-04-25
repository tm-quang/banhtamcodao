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
        const allCategoryNames = Array.from(new Set([...categoryNamesFromApi, ...productCategoryNames])).filter(Boolean).sort();

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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
                    {displayedProducts.slice(0, MAX_PRODUCTS_PER_CATEGORY).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary/30 to-primary/5 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <PackageSearch className="w-10 h-10 md:w-12 md:h-12 text-primary/60" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary/30 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Chưa có món ăn nào trong danh mục này</h3>
                    <p className="text-gray-600 text-sm md:text-base max-w-md px-4">Vui lòng chọn danh mục khác hoặc quay lại sau nhé!</p>
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