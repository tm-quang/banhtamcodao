// src/components/HeroSection.js
'use client';

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// 2. Import CSS cho tất cả các module cần thiết
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
// Removed fade effect

const defaultSlides = [
  {
    imageUrl: "https://res.cloudinary.com/dgoe8cra8/image/upload/v1759424737/mp8eyqrjdubbld6nuzzf.jpg",
    title: "Bánh Tằm Cô Đào",
    subtitle: "Chuẩn Vị Miền Tây - Giao Hàng Tận Nơi",
    buttonText: "Đặt Món Ngay",
    buttonLink: "/menu"
  },
  {
    imageUrl: "https://res.cloudinary.com/dgoe8cra8/image/upload/v1759424774/d7zwybqybiabifeifkpw.jpg",
    title: "Hương Vị Tươi Mới",
    subtitle: "Nguyên liệu được chọn lọc kỹ càng mỗi ngày.",
    buttonText: "Khám Phá Thực Đơn",
    buttonLink: "/menu"
  },
  {
    imageUrl: "https://res.cloudinary.com/dgoe8cra8/image/upload/v1759424775/poy7n7argfnxkv1g383m.jpg",
    title: "Ưu Đãi Đặc Biệt",
    subtitle: "Nhiều chương trình khuyến mãi hấp dẫn đang chờ bạn.",
    buttonText: "Xem Khuyến Mãi",
    buttonLink: "/promotions" // Ví dụ: liên kết đến trang khuyến mãi
  }
];

export default function HeroSection({ heightClass = 'h-screen', slides = defaultSlides }) {
  return (
    <section className={`relative w-full ${heightClass}`}>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        // no fade effect
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        className="h-full w-full hero-slider"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative h-full w-full bg-cover bg-center text-light flex items-center justify-center hero-slide-bg"
              style={{ backgroundImage: `url('${slide.imageUrl}')` }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 text-center p-4 max-w-3xl animate-fadeInUp">
                <h1 className="text-5xl md:text-7xl font-lobster drop-shadow-lg mb-4">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.buttonLink}
                  className="bg-none text-white border border-white font-bold py-3 px-8 rounded-md text-lg hover:text-black hover:bg-white transition-colors shadow-lg"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}