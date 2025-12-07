'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * CategoryHighlights component - Hiển thị các danh mục nổi bật
 */
export default function CategoryHighlights() {
    const categories = [
        {
            id: 1,
            name: 'Bánh Tằm',
            description: 'Hương vị truyền thống',
            image: '/images/hero-dish_4.png',
            color: 'bg-orange-50',
            textColor: 'text-orange-600',
            link: '/menu'
        },
        {
            id: 2,
            name: 'Món Ăn Kèm',
            description: 'Đậm đà khó quên',
            image: '/images/hero-dish_2.jpg',
            color: 'bg-red-50',
            textColor: 'text-red-600',
            link: '/menu'
        },
        {
            id: 3,
            name: 'Giải Khát',
            description: 'Thanh mát ngày hè',
            image: '/images/hero-dish_5.png',
            color: 'bg-green-50',
            textColor: 'text-green-600',
            link: '/menu'
        }
    ];

    return (
        <section className="py-10 md:py-16">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="text-center mb-10">
                    <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Khám phá thực đơn</span>
                    <h2 className="text-3xl md:text-4xl font-lobster text-gray-900 mt-2">Danh Mục Nổi Bật</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {categories.map((cat, index) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                            <Link href={cat.link} className="group block relative h-[300px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                                {/* Background Image with Overlay */}
                                <div className="absolute inset-0">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-white/80 text-sm font-medium mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-2 group-hover:translate-y-0 delay-100">
                                        {cat.description}
                                    </p>
                                    <h3 className="text-2xl md:text-3xl font-lobster text-white mb-4">{cat.name}</h3>

                                    <span className="inline-flex items-center gap-2 text-white font-bold text-sm border-b-2 border-white/0 group-hover:border-white transition-all pb-1">
                                        Xem ngay <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

