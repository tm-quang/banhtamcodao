'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const reviews = [
    {
        id: 1,
        name: "Nguyễn Thu Hà",
        role: "Thực khách thân thiết",
        content: "Bánh tằm ở đây ngon xuất sắc, nước cốt dừa béo ngậy mà không bị ngán. Sợi bánh dai mềm vừa phải, ăn kèm xíu mại rất hợp. Sẽ ủng hộ dài dài!",
        rating: 5,
        avatar: "H"
    },
    {
        id: 2,
        name: "Trần Minh Tuấn",
        role: "Food Reviewer",
        content: "Không gian quán ấm cúng, nhân viên nhiệt tình. Món ăn được trình bày đẹp mắt, hương vị chuẩn miền Tây. Rất thích món bánh tằm bì ở đây.",
        rating: 5,
        avatar: "T"
    },
    {
        id: 3,
        name: "Lê Thị Mai",
        role: "Khách hàng",
        content: "Giao hàng nhanh, đóng gói cẩn thận. Đồ ăn vẫn còn nóng hổi khi nhận được. Giá cả rất hợp lý cho chất lượng như thế này.",
        rating: 4,
        avatar: "M"
    }
];

export default function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoplay, setAutoplay] = useState(true);

    useEffect(() => {
        if (!autoplay) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [autoplay]);

    const nextReview = () => {
        setAutoplay(false);
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    };

    const prevReview = () => {
        setAutoplay(false);
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    return (
        <section className="py-10 md:py-16 relative overflow-hidden" aria-label="Đánh giá khách hàng">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-8 md:mb-12">
                    <span className="text-secondary font-bold tracking-wider uppercase text-xs md:text-sm">Ý kiến khách hàng</span>
                    <h2 className="text-3xl md:text-4xl font-lobster text-gray-800 mt-2">Khách hàng nói gì về chúng tôi?</h2>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 md:p-12 border border-gray-100">
                        <Quote className="absolute top-4 left-4 md:top-8 md:left-8 text-primary/20 w-10 h-10 md:w-16 md:h-16 -z-0" />

                        <div className="relative z-10">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center text-center"
                                >
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-xl md:text-2xl font-bold mb-4 md:mb-6 shadow-lg">
                                        {reviews[currentIndex].avatar}
                                    </div>

                                    <div className="flex gap-1 mb-3 md:mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 md:w-5 md:h-5 ${i < reviews[currentIndex].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>

                                    <p className="text-gray-600 text-base md:text-xl italic mb-4 md:mb-6 leading-relaxed px-2 md:px-0">
                                        &quot;{reviews[currentIndex].content}&quot;
                                    </p>

                                    <div>
                                        <h4 className="text-lg md:text-xl font-bold text-gray-800">{reviews[currentIndex].name}</h4>
                                        <p className="text-primary text-xs md:text-sm">{reviews[currentIndex].role}</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation Buttons */}
                        <button
                            onClick={prevReview}
                            className="absolute top-1/2 -left-3 md:-left-12 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all duration-300 group"
                            aria-label="Previous review"
                        >
                            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            onClick={nextReview}
                            className="absolute top-1/2 -right-3 md:-right-12 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all duration-300 group"
                            aria-label="Next review"
                        >
                            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-6 md:mt-8">
                        {reviews.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setAutoplay(false);
                                    setCurrentIndex(index);
                                }}
                                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary w-6 md:w-8' : 'bg-gray-300 hover:bg-primary/50'
                                    }`}
                                aria-label={`Go to review ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
