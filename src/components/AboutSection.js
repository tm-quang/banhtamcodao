'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Heart } from 'lucide-react';

/**
 * AboutSection component - Phần giới thiệu về Bánh Tằm Cô Đào
 */
export default function AboutSection() {
    return (
        <section className="relative py-10 md:py-16 overflow-hidden" aria-label="Giới thiệu">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
                    {/* Image Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:w-1/2 relative"
                    >
                        <div className="relative h-[300px] md:h-[400px] w-full rounded-3xl overflow-hidden shadow-lg bg-transparent">
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                style={{
                                    backgroundImage: 'url(/images/bg.png)',
                                    backgroundAttachment: 'fixed',
                                }}
                            >
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary rounded-full opacity-20 blur-2xl"></div>
                    </motion.div>

                    {/* Text Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full lg:w-1/2"
                    >
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70 sm:text-sm">Về chúng tôi</span>
                        <h2 className="text-3xl md:text-5xl font-lobster text-gray-800 mt-2 mb-4 md:mb-6">
                            Bánh Tằm Cô Đào <br />
                        </h2>
                        <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-base md:text-lg">
                            Xuất phát từ niềm đam mê với ẩm thực miền Tây dân dã, <span className="font-lobster text-xl text-gray-800">Bánh Tằm Cô Đào</span> ra đời với mong muốn mang đến những món ăn không chỉ ngon miệng mà còn chứa đựng ký ức tuổi thơ.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-inner">
                                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm md:text-base">Nguyên liệu sạch</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                                    <Heart className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} fill="currentColor" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm md:text-base">Chuẩn vị miền Tây</h4>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
