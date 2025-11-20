// src/components/RelatedProducts.js
'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ProductCard from './ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';

export default function RelatedProducts({ products }) {
    if (!products || products.length === 0) return null;
    
    return (
        <div className="py-8 md:py-12">
            <h2 className="text-3xl md:text-4xl font-lobster text-secondary text-center mb-6 md:mb-8">
                Các món gợi ý
            </h2>
            <Swiper
                modules={[Navigation]}
                spaceBetween={16}
                slidesPerView={4}
                navigation
                loop={products.length > 4} // Chỉ lặp lại nếu có nhiều hơn 4 sản phẩm
                breakpoints={{
                    320: { slidesPerView: 2, spaceBetween: 12 },
                    640: { slidesPerView: 2, spaceBetween: 16 },
                    768: { slidesPerView: 3, spaceBetween: 20 },
                    1024: { slidesPerView: 4, spaceBetween: 24 },
                    1200: { slidesPerView: 4, spaceBetween: 30 },
                }}
                className="!pb-4"
            >
                {products.map((product) => (
                    <SwiperSlide key={product.id}>
                        <ProductCard product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}