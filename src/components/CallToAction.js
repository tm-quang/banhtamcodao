// src/components/CallToAction.js
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';

/**
 * CallToAction component - Phần kêu gọi hành động
 */
export default function CallToAction() {
  return (
    <section className="relative overflow-hidden py-10 md:py-16">
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Đặc sản miền Tây</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-gray-900"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span className="text-primary">
              Bánh Tằm
            </span>
            <br />
            <span className="text-gray-900">Hương Vị Quê Nhà</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-sm sm:text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Bánh tằm - món ăn dân dã nhưng đậm đà hương vị miền Tây. Từng sợi bánh dai giòn, kết hợp cùng nước cốt dừa béo ngậy và đậu phộng giòn tan, tạo nên hương vị khó quên. Món ăn gắn liền với ký ức tuổi thơ, mang đến cảm giác ấm áp như về nhà.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 bg-primary text-white font-semibold py-3 px-6 rounded-xl text-sm sm:text-base shadow-[0_8px_30px_rgba(255,123,0,0.25)] hover:shadow-[0_12px_40px_rgba(255,123,0,0.35)] hover:scale-105 transition-all duration-300"
            >
              <span>Xem Toàn Bộ Thực Đơn</span>
              <UtensilsCrossed className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

