'use client';

import { motion } from 'framer-motion';
import { Truck, UtensilsCrossed, CalendarDays } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    imgSrc: "/images/services/order_online.png", // <--- Thêm link ảnh của bạn vào đây
    title: "ĐẶT MÓN",
    buttonText: "Đặt món",
    link: "/menu"
  },
  {
    imgSrc: "/images/services/delivery.png", // <--- Thêm link ảnh của bạn vào đây
    title: "GIAO HÀNG TẬN NƠI",
    buttonText: "Đặt món",
    link: "/menu"
  },
  {
    imgSrc: "/images/services/payment.png", // <--- Thêm link ảnh của bạn vào đây
    title: "THANH TOÁN",
    buttonText: "Đặt món",
    link: "/menu"
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.15,
      delayChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Services() {
  return (
    <section className="relative py-6 mt-4 mb-4">
      <motion.div
        className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-2 sm:px-6 lg:px-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="text-center">
          <p className="text-md md:text-2xl font-semibold uppercase tracking-[0.3em] text-primary sm:text-base">
            DỊCH VỤ CỦA CHÚNG TÔI
          </p>
        </div>

        {/* Mobile View: Manual Swipe */}
        <div className="block md:hidden overflow-x-auto relative w-full scrollbar-hide">
          <div className="flex gap-9 px-2 justify-center mb-2 mt-2">
            {services.map(({ Icon, title, imgSrc, description, buttonText, link }, index) => (
              <article
                key={index}
                className="w-[110px] flex-shrink-0 flex flex-col items-center text-center"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full text-primary mb-2">
                  {imgSrc ? (
                    <img src={imgSrc} alt={title} className="h-24 w-24 object-contain" />
                  ) : Icon ? (
                    <Icon className="h-24 w-24" strokeWidth={1.2} />
                  ) : null}
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-between items-center">
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-800 whitespace-normal leading-tight">
                      {title}
                    </h3>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Desktop View: Static Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-40 mt-4">
          {services.map(({ Icon, title, imgSrc, description, buttonText, link }, index) => (
            <motion.article
              key={title}
              className="flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300"
              variants={cardVariants}
            >
              <div className="flex h-42 w-42 items-center justify-center rounded-full text-primary mb-4">
                {imgSrc ? (
                  <img src={imgSrc} alt={title} className="h-42 w-42 object-contain" />
                ) : Icon ? (
                  <Icon className="h-42 w-42" strokeWidth={1.2} />
                ) : null}
              </div>

              <div className="space-y-3 flex-1 flex flex-col justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 lg:text-xl">
                    {title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-1.5 max-w-xs leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
