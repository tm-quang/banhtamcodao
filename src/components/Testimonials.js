'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, MessageSquare, CheckCircle2 } from 'lucide-react';

const MOCK_REVIEWS = [
    {
        id: 1,
        customer_name: "Nguyễn Thu Hà",
        comment: "Bánh tằm ở đây ngon xuất sắc, nước cốt dừa béo ngậy mà không bị ngán. Sợi bánh dai mềm vừa phải, ăn kèm xíu mại rất hợp. Sẽ ủng hộ dài dài!",
        rating: 5,
        products: { name: "Bánh tằm bì xíu mại" }
    },
    {
        id: 2,
        customer_name: "Trần Minh Tuấn",
        comment: "Không gian quán ấm cúng, nhân viên nhiệt tình. Món ăn được trình bày đẹp mắt, hương vị chuẩn miền Tây. Rất thích món bánh tằm bì ở đây.",
        rating: 5,
        products: { name: "Bánh tằm bì" }
    }
];

export default function Testimonials() {
    const [reviews, setReviews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoplay, setAutoplay] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch('/api/home-testimonials?limit=8');
                const data = await res.json();
                if (data.success && data.testimonials && data.testimonials.length > 0) {
                    setReviews(data.testimonials);
                } else {
                    setReviews(MOCK_REVIEWS.map(r => ({ ...r, content: r.comment })));
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setReviews(MOCK_REVIEWS.map(r => ({ ...r, content: r.comment })));
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    useEffect(() => {
        if (!autoplay || reviews.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % reviews.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [autoplay, reviews.length]);

    const nextReview = () => {
        setAutoplay(false);
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    };

    const prevReview = () => {
        setAutoplay(false);
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    if (loading) {
        return (
            <div className="section-spacing container mx-auto px-4 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (reviews.length === 0) return null;

    return (
        <section className="section-spacing relative overflow-hidden" aria-label="Đánh giá khách hàng">
            {/* Background elements - subtler */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
            </div>

            <div className="page-container relative z-10">
                <div className="text-center mt-4 mb-4 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-lobster text-gray-800 leading-tight px-4">
                        Khách hàng nói gì về <br></br><span className="text-primary">Bánh Tằm Cô Đào?</span>
                    </h2>
                </div>

                <div className="relative max-w-2xl mx-auto px-4">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-white rounded-2xl shadow-md shadow-gray-200/50 border border-gray-200 p-6 md:p-10 text-center relative overflow-hidden"
                        >
                            {/* Smaller decorative quotes */}
                            <Quote className="absolute top-6 left-6 text-primary/5 w-12 h-12 pointer-events-none" />
                            <Quote className="absolute bottom-6 right-6 text-primary/5 w-12 h-12 pointer-events-none rotate-180" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="flex gap-0.5 mb-5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={`${i < reviews[currentIndex].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                        />
                                    ))}
                                </div>

                                <p className="text-gray-600 text-base md:text-xl font-medium italic leading-relaxed mb-8 max-w-lg mx-auto">
                                    &quot;{reviews[currentIndex].content}&quot;
                                </p>

                                <div className="flex flex-col items-center">
                                    {reviews[currentIndex].avatar_url ? (
                                        <img
                                            src={reviews[currentIndex].avatar_url}
                                            alt={reviews[currentIndex].customer_name}
                                            className="w-14 h-14 rounded-full border-2 border-white shadow-lg mb-3 object-cover"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white mb-3">
                                            {reviews[currentIndex].customer_name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                            <h4 className="text-base font-bold text-gray-800">{reviews[currentIndex].customer_name}</h4>
                                            <CheckCircle2 size={14} className="text-blue-500" />
                                        </div>
                                        <p className="text-gray-400 font-medium text-[10px] md:text-xs tracking-wider uppercase">Thực khách</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="absolute top-1/2 -left-0 md:-left-8 -translate-y-1/2 z-20">
                        <button
                            onClick={prevReview}
                            className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-gray-800 hover:text-white hover:bg-primary transition-all duration-300 group active:scale-90"
                        >
                            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <div className="absolute top-1/2 -right-0 md:-right-8 -translate-y-1/2 z-20">
                        <button
                            onClick={nextReview}
                            className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-gray-800 hover:text-white hover:bg-primary transition-all duration-300 group active:scale-90"
                        >
                            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Progress indicators */}
                <div className="flex justify-center gap-3 mt-12">
                    {reviews.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setAutoplay(false);
                                setCurrentIndex(index);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex ? 'bg-primary w-12' : 'bg-gray-200 w-4 hover:bg-primary/30'
                                }`}
                            aria-label={`Go to review ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
