// src/components/Features.js
'use client';

import { motion } from 'framer-motion';
import { Truck, CreditCard, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

const features = [
  {
    Icon: Truck,
    title: "Giao Tận Nơi",
    accent: "from-primary/20 via-primary/10 to-transparent",
  },
  {
    Icon: CreditCard,
    title: "Thanh Toán Linh Hoạt",
    accent: "from-orange-500/10 via-primary/10 to-transparent",
  },
  {
    Icon: Award,
    title: "Chất Lượng Uy Tín",
    accent: "from-yellow-500/20 via-primary/10 to-transparent",
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

export default function Features() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-play carousel on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrentIndex((prev) => (prev + 1) % features.length);
      }
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isDragging]);

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const threshold = 50; // Minimum drag distance to change slide
    const velocity = info.velocity?.x || 0;

    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      if (info.offset.x > 0 || velocity > 0) {
        // Swipe right - go to previous
        setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
      } else {
        // Swipe left - go to next
        setCurrentIndex((prev) => (prev + 1) % features.length);
      }
    }
  };

  return (
    <section className="relative overflow-hidden py-6 sm:py-12">
      <motion.div
        className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-6 sm:gap-8 px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70 sm:text-base">
            Vì sao khách hàng tin tưởng
          </p>
          <h2 className="mt-2 text-2xl font-bold text-secondary sm:text-3xl lg:text-4xl">
            Trải nghiệm hương vị trọn vẹn
          </h2>
        </div>

        {/* Mobile Swipeable Carousel */}
        <div className="block md:hidden">
          <div className="relative overflow-hidden w-full">
            <motion.div
              className="flex"
              drag="x"
              dragElastic={0.15}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              animate={{ 
                x: `-${(currentIndex * 100) / features.length}%`
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30
              }}
              style={{ 
                width: `${features.length * 100}%`
              }}
            >
              {features.map(({ Icon, title, accent }, index) => (
                <div
                  key={title}
                  className="flex-shrink-0 px-2"
                  style={{ 
                    width: `${100 / features.length}%`
                  }}
                >
                  <motion.article
                    className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-md w-full h-full"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`absolute -top-20 right-0 h-40 w-40 bg-gradient-to-br ${accent} opacity-80 blur-3xl transition-opacity duration-300 group-hover:opacity-100`} />

                    <div className="relative flex flex-col gap-4 text-center">
                      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 shadow-[0_10px_25px_rgba(255,123,0,0.22)] transition-transform duration-300 group-hover:scale-105">
                        <Icon className="h-7 w-7 text-primary" strokeWidth={1.8} />
                      </span>

                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-secondary">
                          {title}
                        </h3>
                      </div>
                    </div>

                    <motion.div
                      className="pointer-events-none absolute inset-x-6 bottom-6 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.25 + index * 0.05, duration: 0.4, ease: 'easeOut' }}
                    />
                  </motion.article>
                </div>
              ))}
            </motion.div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-8 h-2 bg-primary'
                      : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {features.map(({ Icon, title, accent }, index) => (
            <motion.article
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 ease-out hover:border-primary/30 hover:shadow-lg"
              variants={cardVariants}
              whileHover={{ y: -10 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`absolute -top-20 right-0 h-40 w-40 bg-gradient-to-br ${accent} opacity-80 blur-3xl transition-opacity duration-300 group-hover:opacity-100`} />

              <div className="relative flex flex-col gap-4 text-left">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 shadow-inner transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-7 w-7 text-primary" strokeWidth={1.8} />
                </span>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-secondary lg:text-2xl">
                    {title}
                  </h3>
                </div>
              </div>

              <motion.div
                className="pointer-events-none absolute inset-x-6 bottom-6 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.25 + index * 0.05, duration: 0.4, ease: 'easeOut' }}
              />
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}