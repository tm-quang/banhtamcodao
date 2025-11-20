// src/components/MenuSection.js
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from './ProductCard';
import AnimateOnScroll from './AnimateOnScroll';
import { UtensilsCrossed } from 'lucide-react';

const MAX_PRODUCTS_PER_CATEGORY = 12;

const categoryImages = {
    default: '/images/menu-icons/default.svg',
    tatca: '/images/menu-icons/all.svg',
    banhtam: '/images/menu-icons/banh-tam.svg',
    monphu: '/images/menu-icons/mon-phu.svg',
    anvat: '/images/menu-icons/mon-phu.svg',
    thucuong: '/images/menu-icons/thuc-uong.svg',
    trasua: '/images/menu-icons/tra-sua.svg',
};

const normalizeCategoryKey = (value = '') =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .toLowerCase();


export default function MenuSection({ products, categoriesList = [] }) {
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const categories = useMemo(() => {
        const categoryMap = products.reduce((acc, product) => {
            const category = product.category_name || 'Khác';
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
            normalizedMap[name] = categoryMap[name] || [];
        });

        return { 'Tất cả': products, ...normalizedMap };
    }, [products, categoriesList]);

    const categoryNames = Object.keys(categories);
    const displayedProducts = categories[activeCategory] || [];
    const hasMoreProducts = displayedProducts.length > MAX_PRODUCTS_PER_CATEGORY;

    return (
        <AnimateOnScroll>
            <div className="text-center mb-8 md:mb-12">
                <span className="inline-flex items-center gap-2 px-3 py-1 text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-primary bg-primary/10 rounded-full">
                    <UtensilsCrossed className="w-3 h-3" />
                    Gợi ý hôm nay
                </span>
                <h2 className="mt-2 md:mt-3 text-3xl sm:text-5xl font-lobster text-secondary drop-shadow-sm">
                    Thực đơn của chúng tôi
                </h2>
                <p className="mt-3 md:mt-4 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto px-4 md:px-0">
                    Chọn ngay món ăn yêu thích và thưởng thức hương vị chuẩn miền Tây được chế biến mỗi ngày.
                </p>
            </div>

            {/* Cập nhật layout để căn giữa */}
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 mb-8 md:mb-10 pt-1">
                {/* Các nút danh mục */}
                {categoryNames.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`group relative flex flex-col items-center justify-center w-20 h-20 md:w-28 md:h-28 p-2 md:p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md ${activeCategory === category
                            ? 'bg-white border-primary/70 shadow-xl shadow-primary/10 scale-105 z-10'
                            : 'bg-white text-gray-500 border-gray-100 hover:border-primary/60'
                            }`}
                    >
                        <span className={`absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary opacity-0 transition-opacity ${activeCategory === category ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />
                        <div className={`flex h-8 w-8 md:h-14 md:w-14 items-center justify-center rounded-full border bg-orange-50 transition-all duration-300 ${activeCategory === category
                            ? 'border-primary/80 shadow-inner'
                            : 'border-transparent group-hover:border-primary/50'
                            }`}>
                            <Image
                                src={categoryImages[normalizeCategoryKey(category)] || categoryImages.default}
                                alt={`Biểu tượng ${category}`}
                                width={44}
                                height={44}
                                className="h-6 w-6 md:h-11 md:w-11"
                                priority={false}
                            />
                        </div>
                        <span className={`mt-1 md:mt-2 text-[9px] md:text-xs font-semibold tracking-wide text-center line-clamp-2 ${activeCategory === category ? 'text-primary' : 'text-gray-600 group-hover:text-primary'
                            }`}>
                            {category}
                        </span>
                    </button>
                ))}
                {/* Nút Xem tất cả */}
                <Link
                    href="/menu"
                    className="flex items-center justify-center h-9 px-3 md:h-11 md:px-5 rounded-xl font-semibold bg-primary text-light hover:bg-orange-600 transition-all duration-300 shadow-md hover:-translate-y-1 text-xs md:text-base whitespace-nowrap"
                >
                    Xem tất cả
                </Link>
            </div>


            {/* Lưới sản phẩm */}
            {displayedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {displayedProducts.slice(0, MAX_PRODUCTS_PER_CATEGORY).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <UtensilsCrossed className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600">Chưa có món ăn nào trong danh mục này</h3>
                    <p className="text-gray-500 text-sm mt-1">Vui lòng chọn danh mục khác hoặc quay lại sau nhé!</p>
                </div>
            )}

            {/* Nút Xem Thêm */}
            {hasMoreProducts && (
                <div className="text-center mt-8 md:mt-12">
                    <Link
                        href="/menu"
                        className="inline-flex items-center justify-center bg-secondary text-light font-bold py-3 px-8 rounded-full text-base md:text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        Xem thêm sản phẩm
                    </Link>
                </div>
            )}
        </AnimateOnScroll>
    );
}