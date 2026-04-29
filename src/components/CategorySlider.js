'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
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
        <div className="mb-2 relative w-full">
            <div className="w-full overflow-visible md:overflow-hidden">
                <Swiper
                    modules={[FreeMode]}
                    spaceBetween={16}
                    slidesPerView="auto"
                    freeMode={{
                        enabled: true,
                        sticky: false,
                        momentumBounce: false,
                    }}
                    className="category-swiper !py-6"
                    breakpoints={{
                        320: {
                            slidesPerView: 'auto',
                            spaceBetween: 16,
                            slidesOffsetBefore: 16,
                            slidesOffsetAfter: 16,
                        },
                        768: {
                            slidesPerView: 'auto',
                            spaceBetween: 40,
                            slidesOffsetBefore: 0,
                            slidesOffsetAfter: 0,
                        },
                    }}
                >
                    {categories.map((category, index) => (
                        <SwiperSlide
                            key={category}
                            className="!w-auto !flex-shrink-0"
                        >
                            <button
                                onClick={() => onSelectCategory(category)}
                                className={`cursor-pointer relative group flex flex-col items-center justify-center shadow-md w-28 h-32 rounded-2xl transition-all duration-300 ${activeCategory === category
                                    ? 'bg-white border-2 border-[#FF6F30] shadow-md'
                                    : 'bg-white border border-gray-300 hover:border-[#FF6F30] hover:shadow-md'
                                    }`}
                            >
                                {/* Orange Dot for Active State */}
                                {activeCategory === category && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 md:w-2.5 md:h-2.5 bg-[#FF6F30] rounded-full animate-pulse"></span>
                                )}

                                <div className={`relative w-16 h-16 rounded-full mb-2 overflow-hidden shadow-sm transition-transform duration-300 ${activeCategory === category ? 'scale-110' : 'group-hover:scale-110'
                                    }`}>
                                    <img
                                        src={categoryImages[category] || categoryImages.default}
                                        alt={category}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className={`text-base font-bold text-center px-1 transition-colors ${activeCategory === category ? 'text-[#FF6F30]' : 'text-gray-600 group-hover:text-[#FF6F30]'
                                    }`}>
                                    {category}
                                </span>
                            </button>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}

