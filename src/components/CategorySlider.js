'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Mapping category names to images
 */
const categoryImages = {
    'Tất cả': '/images/menu-icons/hero-dish_4.png',
    'Bánh Tằm': '/images/menu-icons/hero-dish_4.png',
    'Món Phụ': '/images/menu-icons/hero-dish_2.jpg',
    'Thức Uống': '/images/menu-icons/hero-dish_5.png',
    'Trà Sữa': '/images/menu-icons/hero-dish_1.jpg',
    'Ăn Vặt': '/images/menu-icons/hero-dish_3.jpg',
    'default': '/images/menu-icons/hero-dish_5.png'
};

/**
 * CategorySlider component - Hiển thị danh mục dạng slider với circular images
 */
export default function CategorySlider({ categories, activeCategory, onSelectCategory }) {
    return (
        <div className="mb-2 relative">
            <div className="flex justify-center">
                <Swiper
                    spaceBetween={16}
                    slidesPerView="auto"
                    centeredSlides={false}
                    className="category-swiper !py-8 !px-4 md:!px-0 max-w-full md:max-w-4xl mx-auto"
                    breakpoints={{
                        320: { slidesPerView: 'auto', spaceBetween: 12 },
                        768: { slidesPerView: 'auto', spaceBetween: 24 },
                    }}
                >
                    {categories.map((category) => (
                        <SwiperSlide key={category} className="!w-auto">
                            <button
                                onClick={() => onSelectCategory(category)}
                                className={`cursor-pointer relative group flex flex-col items-center justify-center shadow-md w-24 h-26 md:w-28 md:h-32 rounded-2xl transition-all duration-300 ${activeCategory === category
                                    ? 'bg-white border-2 border-[#FF6F30] shadow-xl transform -translate-y-2'
                                    : 'bg-white border border-gray-100 hover:border-[#FF6F30]/50 hover:shadow-lg hover:-translate-y-1'
                                    }`}
                            >
                                {/* Orange Dot for Active State */}
                                {activeCategory === category && (
                                    <span className="absolute top-2 right-2 w-2 h-2 md:w-2.5 md:h-2.5 bg-[#FF6F30] rounded-full animate-pulse"></span>
                                )}

                                <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full mb-2 overflow-hidden shadow-sm transition-transform duration-300 ${activeCategory === category ? 'scale-110' : 'group-hover:scale-110'
                                    }`}>
                                    <img
                                        src={categoryImages[category] || categoryImages.default}
                                        alt={category}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className={`text-[15px] md:text-base font-bold text-center px-1 transition-colors ${activeCategory === category ? 'text-[#FF6F30]' : 'text-gray-600 group-hover:text-[#FF6F30]'
                                    }`}>
                                    {category}
                                </span>
                            </button>
                        </SwiperSlide>
                    ))}

                    {/* "View All" Button as the last slide */}
                    <SwiperSlide className="!w-auto">
                        <Link
                            href="/menu"
                            className="cursor-pointer relative group flex flex-col items-center shadow-md justify-center w-24 h-26 md:w-28 md:h-32 rounded-2xl bg-orange-50 border-2 border-orange-500 hover:border-orange-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform">
                                <ArrowRight className="text-[#FF6F30] w-5 h-5 md:w-8 md:h-8" />
                            </div>
                            <span className="text-[15px] md:text-base font-bold text-center px-1 text-[#FF6F30]">
                                Xem tất cả
                            </span>
                        </Link>
                    </SwiperSlide>
                </Swiper>
            </div>
        </div>
    );
}

