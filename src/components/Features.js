// src/components/Features.js
'use client';

import { motion } from 'framer-motion';
import { Truck, CreditCard, Award } from 'lucide-react';

const features = [
  {
    Icon: Truck,
    title: "Giao Hàng Nhanh",
    description: "Giao hàng tận nơi nhanh chóng và nóng hổi.",
    accent: "from-primary/20 via-primary/10 to-transparent",
  },
  {
    Icon: CreditCard,
    title: "Thanh Toán Linh Hoạt",
    description: "Hỗ trợ nhiều hình thức: Tiền mặt, Chuyển khoản, Momo.",
    accent: "from-orange-500/10 via-primary/10 to-transparent",
  },
  {
    Icon: Award,
    title: "Chất Lượng Uy Tín",
    description: "Chỉ sử dụng nguyên liệu tươi ngon, đảm bảo chất lượng.",
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
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,123,0,0.08),_transparent_60%)]" />

      <motion.div
        className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8 px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70 sm:text-sm">
            Vì sao khách hàng tin tưởng
          </p>
          <h2 className="mt-2 text-2xl font-bold text-secondary sm:text-3xl lg:text-4xl">
            Trải nghiệm dịch vụ trọn vẹn mỗi ngày
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {features.map(({ Icon, title, description, accent }, index) => (
            <motion.article
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-5 sm:p-6 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.45)] backdrop-blur-sm transition-all duration-300 ease-out hover:border-primary/30 hover:bg-white"
              variants={cardVariants}
              whileHover={{ y: -10 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`absolute -top-20 right-0 h-40 w-40 bg-gradient-to-br ${accent} opacity-80 blur-3xl transition-opacity duration-300 group-hover:opacity-100`} />

              <div className="relative flex flex-col gap-3 sm:gap-4 text-left sm:text-center xl:text-left">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 shadow-[0_10px_25px_rgba(255,123,0,0.22)] transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14 sm:mx-auto xl:mx-0">
                  <Icon className="h-6 w-6 text-primary sm:h-7 sm:w-7" strokeWidth={1.8} />
                </span>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-secondary sm:text-xl lg:text-2xl">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 sm:text-base">
                    {description}
                  </p>
                </div>
              </div>

              <motion.div
                className="pointer-events-none absolute inset-x-5 bottom-5 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent sm:inset-x-6 sm:bottom-6"
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