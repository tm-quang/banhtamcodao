// src/components/MenuSlider.js
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import Image from 'next/image';

// Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/pagination';

const sliderImages = [
  {
    id: 1,
    src: 'https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png',
    alt: 'Bánh Tằm Cô Đào - Món ăn ngon miền Tây',
    title: 'Bánh Tằm Cô Đào',
    subtitle: 'Hương vị đậm đà miền Tây'
  },
  {
    id: 2,
    src: 'https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png',
    alt: 'Thực đơn đa dạng',
    title: 'Thực đơn phong phú',
    subtitle: 'Nhiều món ăn hấp dẫn'
  }
];

export default function MenuSlider() {
  return (
    <div className="relative -mt-24 mb-8">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet bg-white/50',
          bulletActiveClass: 'swiper-pagination-bullet-active bg-primary',
        }}
        loop={true}
        className="rounded-md overflow-hidden shadow-xl"
      >
        {sliderImages.map((image) => (
          <SwiperSlide key={image.id}>
            <div className="relative h-64 md:h-80 lg:h-96">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority={image.id === 1}
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-lobster mb-2">
                    {image.title}
                  </h2>
                  <p className="text-lg md:text-xl opacity-90">
                    {image.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
