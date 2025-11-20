// src/components/FeaturedSlider.js
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
// 1. Import thêm Autoplay
import { Navigation, Autoplay } from 'swiper/modules';
import ProductCard from './ProductCard';
import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';

// Import các file CSS của Swiper
import 'swiper/css';
import 'swiper/css/navigation';

export default function FeaturedSlider({ products }) {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  return (
    <AnimateOnScroll>
      <div className="relative">
        {/* Tiêu đề và Nút điều hướng */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-lobster text-secondary">
            Món nổi bật
          </h2>
          <div className="flex gap-3">
            <button
              ref={navigationPrevRef}
              className="w-11 h-11 rounded-full bg-primary text-light flex items-center justify-center hover:bg-orange-600 transition-colors shadow-md disabled:opacity-50"
            >
              <ArrowLeft size={22} />
            </button>
            <button
              ref={navigationNextRef}
              className="w-11 h-11 rounded-full bg-primary text-light flex items-center justify-center hover:bg-orange-600 transition-colors shadow-md disabled:opacity-50"
            >
              <ArrowRight size={22} />
            </button>
          </div>
        </div>

        {/* Slider */}
        <Swiper
          // 2. Thêm Autoplay vào modules
          modules={[Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView={4}
          loop={true}
          // 3. Thêm cấu hình cho autoplay
          autoplay={{
            delay: 3000, // Thời gian chờ giữa các slide (3 giây)
            disableOnInteraction: false, // Không dừng khi người dùng tương tác
          }}
          navigation={{
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = navigationPrevRef.current;
            swiper.params.navigation.nextEl = navigationNextRef.current;
            swiper.navigation.update();
          }}
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
    </AnimateOnScroll>
  );
}