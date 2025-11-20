'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AboutSection() {
    return (
        <section className="py-10 md:py-16 bg-orange-50 overflow-hidden" aria-label="Giới thiệu">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
                    {/* Image Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:w-1/2 relative"
                    >
                        <div className="relative h-[300px] md:h-[400px] w-full rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src="/images/hero-bg.jpg" // Fallback/Placeholder, replace with specific about image if available
                                alt="Không gian Bánh Tằm Cô Đào"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 md:p-8">
                                <div className="text-white">
                                    <p className="font-lobster text-xl md:text-2xl">Hương vị truyền thống</p>
                                    <p className="text-xs md:text-sm opacity-90">Đậm đà bản sắc miền Tây</p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary rounded-full opacity-20 blur-2xl"></div>
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary rounded-full opacity-20 blur-2xl"></div>
                    </motion.div>

                    {/* Text Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full lg:w-1/2"
                    >
                        <span className="text-primary font-bold tracking-wider uppercase text-xs md:text-sm">Về chúng tôi</span>
                        <h2 className="text-3xl md:text-5xl font-lobster text-gray-800 mt-2 mb-4 md:mb-6">
                            Bánh Tằm Cô Đào <br />
                            <span className="text-secondary">Gói trọn tình quê</span>
                        </h2>
                        <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-base md:text-lg">
                            Xuất phát từ niềm đam mê với ẩm thực miền Tây dân dã, <strong>Bánh Tằm Cô Đào</strong> ra đời với mong muốn mang đến những món ăn không chỉ ngon miệng mà còn chứa đựng ký ức tuổi thơ.
                        </p>
                        <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                            Chúng tôi cam kết sử dụng nguyên liệu tươi ngon nhất mỗi ngày, từ sợi bánh tằm dẻo thơm đến nước cốt dừa béo ngậy, tất cả đều được chế biến thủ công tỉ mỉ để giữ trọn hương vị truyền thống.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm md:text-base">Nguyên liệu sạch</h4>
                                    <p className="text-xs md:text-sm text-gray-500">Tươi ngon mỗi ngày</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm md:text-base">Làm bằng cả trái tim</h4>
                                    <p className="text-xs md:text-sm text-gray-500">Hương vị chuẩn vị</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
