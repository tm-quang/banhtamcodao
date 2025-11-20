// src/components/HeroSection.js
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Clock, Truck, ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: '/images/1756037941102-banhtam1.jpg',
    title: 'Bánh Tằm Bì',
    description: 'Sợi bánh mềm dai, nước cốt dừa béo ngậy, bì thính thơm lừng.',
  },
  {
    id: 2,
    image: '/images/1756183233699-xiumai.jpg',
    title: 'Xíu Mại Nhà Làm',
    description: 'Viên xíu mại to tròn, thịt mềm ngọt, sốt cà chua đậm đà.',
  },
  {
    id: 3,
    image: '/images/1756037949635-banhtam2.jpg',
    title: 'Hương Vị Tươi Mới',
    description: 'Nguyên liệu chọn lọc mỗi ngày, đảm bảo vệ sinh an toàn thực phẩm.',
  }
];

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-auto lg:min-h-[700px] bg-[#FFFBF7] overflow-hidden flex items-center pt-32 pb-12 md:py-0">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-100/50 blur-3xl"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left order-1 lg:order-1"
          >
            {/* New Dish Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-orange-100 text-orange-600 font-semibold text-xs md:text-sm mb-3 md:mb-6 shadow-sm border border-orange-200"
            >
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Món mới: Bánh Tằm Bì Đặc Biệt
            </motion.div>

            {/* Headline */}
            <h1 className="font-lobster text-4xl md:text-6xl lg:text-7xl text-gray-900 leading-tight mb-3 md:mb-6">
              Đánh thức <br />
              <span className="text-primary">vị giác</span> với <span className="text-gray-900">Cô Đào</span>
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-base md:text-xl max-w-lg mb-5 md:mb-8 leading-relaxed px-2 md:px-0">
              Trải nghiệm ẩm thực miền Tây đỉnh cao với nguyên liệu tươi ngon nhất.
              Giao hàng nhanh trong 30 phút, đảm bảo nóng hổi khi đến tay bạn.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4 mb-6 md:mb-10">
              <Link
                href="/menu"
                className="px-6 py-3 md:px-8 md:py-4 bg-primary text-white font-bold rounded-full shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm md:text-base"
              >
                Đặt món ngay
              </Link>
              <Link
                href="/menu"
                className="px-6 py-3 md:px-8 md:py-4 bg-white text-gray-700 font-bold rounded-full shadow-md border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center gap-2 group text-sm md:text-base"
              >
                Xem Menu
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 md:gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2 md:-space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative">
                    <Image src={`/images/avatar-${i}.jpg`} alt="User" fill className="object-cover" onError={(e) => e.target.src = `https://i.pravatar.cc/100?img=${i + 10}`} />
                  </div>
                ))}
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] md:text-xs font-bold text-gray-600">
                  +2k
                </div>
              </div>
              <div className="flex flex-col items-start">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" />
                  ))}
                </div>
                <span className="text-xs md:text-sm text-gray-500 font-medium">2,000+ đánh giá 5 sao</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Circular Slider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex justify-center items-center order-2 lg:order-2 mt-6 lg:mt-0"
          >
            {/* Main Circle Container */}
            <div className="relative w-[280px] h-[280px] md:w-[500px] md:h-[500px] rounded-full border-[6px] md:border-[10px] border-white shadow-2xl overflow-hidden bg-white z-10">
              <Swiper
                modules={[Autoplay, EffectFade]}
                effect="fade"
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                loop={true}
                className="h-full w-full"
              >
                {slides.map((slide) => (
                  <SwiperSlide key={slide.id} className="relative h-full w-full bg-gray-100">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority={slide.id === 1}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Decorative Circle Ring */}
            <div className="absolute inset-0 m-auto w-[310px] h-[310px] md:w-[540px] md:h-[540px] rounded-full border border-orange-200/50 z-0 animate-spin-slow"></div>

            {/* Floating Badge 1 - Rating */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[0%] right-[0%] md:top-[10%] md:right-[0%] bg-white p-2 md:p-3 rounded-2xl shadow-xl z-20 flex items-center gap-2 md:gap-3 border border-gray-100"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
                <Star fill="currentColor" className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium">Đánh giá</p>
                <p className="text-xs md:text-sm font-bold text-gray-900">4.9/5.0</p>
              </div>
            </motion.div>

            {/* Floating Badge 2 - Delivery */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[0%] left-[0%] md:bottom-[10%] md:left-[0%] bg-white p-2 md:p-3 rounded-2xl shadow-xl z-20 flex items-center gap-2 md:gap-3 border border-gray-100"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                <Truck className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium">Giao hàng</p>
                <p className="text-xs md:text-sm font-bold text-gray-900">30 Phút</p>
              </div>
            </motion.div>

            {/* Floating Badge 3 - Hot */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[50%] -left-[5%] md:-left-[8%] bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg z-20 border border-orange-100"
            >
              <span className="text-orange-500 font-bold text-xs md:text-sm">🔥 Hot Deal</span>
            </motion.div>

            {/* Call Now FAB (Mobile Only) */}
            <motion.a
              href="tel:0123456789"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="absolute -bottom-4 -right-2 md:hidden w-12 h-12 bg-orange-500 rounded-full shadow-lg flex items-center justify-center text-white z-30 animate-bounce"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </motion.a>

          </motion.div>
        </div>
      </div>
    </section>
  );
}