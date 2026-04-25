'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Timer, ArrowRight, Sparkles, Gift, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PromotionBanner component - Hiển thị Flash Sale với countdown timer
 * Fetches data từ API và hiển thị với UI/UX hiện đại
 */
export default function PromotionBanner() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [flashSales, setFlashSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({});

    /**
     * Fetch active flash sales from API
     */
    useEffect(() => {
        const fetchFlashSales = async () => {
            try {
                const res = await fetch('/api/flash-sales/active', {
                    cache: 'no-store' // Đảm bảo luôn fetch dữ liệu mới nhất
                });
                
                // Kiểm tra response status
                if (!res.ok) {
                    console.warn('Flash sales API returned non-OK status:', res.status);
                    setFlashSales([]);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                
                console.log('Flash sales API response:', data); // Debug log
                
                // Xử lý cả trường hợp success: true/false và có/không có flashSales
                if (data && Array.isArray(data.flashSales) && data.flashSales.length > 0) {
                    console.log('Found flash sales:', data.flashSales.length); // Debug log
                    setFlashSales(data.flashSales);
                } else {
                    console.log('No flash sales found or empty array'); // Debug log
                    setFlashSales([]);
                }
            } catch (error) {
                console.error('Failed to fetch flash sales:', error);
                // Đặt mảng rỗng để component không bị lỗi
                setFlashSales([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFlashSales();
    }, []);

    /**
     * Calculate time left for current flash sale
     */
    const calculateTimeLeft = useCallback(() => {
        if (flashSales.length === 0) return {};

        const currentSale = flashSales[currentSlide];
        if (!currentSale?.end_date) return {};

        const endTime = new Date(currentSale.end_date).getTime();
        const now = Date.now();
        const difference = endTime - now;

        if (difference <= 0) {
            return { hours: 0, minutes: 0, seconds: 0, expired: true };
        }

        return {
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / (1000 * 60)) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            expired: false
        };
    }, [flashSales, currentSlide]);

    /**
     * Countdown timer
     */
    useEffect(() => {
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    /**
     * Auto slide
     */
    useEffect(() => {
        if (flashSales.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % flashSales.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [flashSales.length]);

    /**
     * Navigation handlers
     */
    const goToSlide = (index) => setCurrentSlide(index);
    const goToPrev = () => setCurrentSlide((prev) => (prev - 1 + flashSales.length) % flashSales.length);
    const goToNext = () => setCurrentSlide((prev) => (prev + 1) % flashSales.length);

    // Don't render if loading, no flash sales, or all expired
    if (loading) {
        return null; // Đang tải, không hiển thị gì
    }

    // Không có flash sale
    if (flashSales.length === 0) {
        return null; // Không có flash sale, không hiển thị
    }

    // Kiểm tra nếu flash sale hiện tại đã hết hạn
    const currentPromo = flashSales[currentSlide];
    if (!currentPromo || timeLeft.expired) {
        return null; // Flash sale đã hết hạn hoặc không tồn tại, không hiển thị
    }
    const badgeColor = currentPromo?.badge_color || '#FFD93D';
    const isDarkBadge = !['#FFD93D', '#4ECDC4', '#1ABC9C'].includes(badgeColor);

    return (
        <section className="py-4 md:py-2">
            <div className="max-w-[1200px] mx-auto px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="relative rounded-3xl overflow-hidden shadow-md"
                        style={{
                            background: `linear-gradient(135deg, ${badgeColor} 0%, ${badgeColor}dd 50%, ${badgeColor}aa 100%)`
                        }}
                    >
                        {/* Glassmorphism Overlay */}
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>

                        {/* Animated Background Pattern - Dots */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                                backgroundSize: '25px 25px',
                                animation: 'moveBackground 30s linear infinite'
                            }}></div>
                        </div>

                        {/* Animated Background Pattern - Large Circles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <motion.div
                                animate={{
                                    y: [0, -15, 0],
                                    rotate: [0, 8, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute top-8 left-8 text-white/25"
                            >
                                <Sparkles size={35} />
                            </motion.div>
                            <motion.div
                                animate={{
                                    y: [0, 15, 0],
                                    rotate: [0, -10, 0]
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.5
                                }}
                                className="absolute top-20 right-1/4 text-white/20"
                            >
                                <Gift size={30} />
                            </motion.div>
                            <motion.div
                                animate={{
                                    y: [0, -20, 0],
                                    x: [0, 10, 0]
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                                className="absolute bottom-16 left-1/4 text-white/20"
                            >
                                <Zap size={28} />
                            </motion.div>
                        </div>

                        {/* Main Content */}
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-start p-4 md:p-6 lg:p-8 gap-4 md:gap-6">
                            {/* Left Content */}
                            <div className={`text-left max-w-2xl w-full ${isDarkBadge ? 'text-white' : 'text-gray-900'}`}>
                                {/* Badge */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                >
                                   
                                </motion.div>

                                {/* Title */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-lobster mb-3 leading-tight drop-shadow-lg"
                                >
                                    <span className={`inline-flex items-center gap-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl ${isDarkBadge ? 'text-yellow-300' : 'text-red-600'}`}>
                                        Giảm Ngay {currentPromo.discount_value}{currentPromo.discount_type === 'percent' ? '%' : 'đ'}
                                    </span>
                                </motion.h2>

                                {/* Description */}
                                {currentPromo.description && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className={`${isDarkBadge ? 'text-white/90' : 'text-gray-700'} text-sm sm:text-base md:text-lg mb-5 leading-relaxed drop-shadow max-w-lg`}
                                    >
                                        {currentPromo.description}
                                    </motion.p>
                                )}

                                {/* Countdown Timer */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="mb-6"
                                >
                                    <div className="flex items-center justify-start gap-2 mb-3">
                                        <Timer size={18} className={isDarkBadge ? 'text-yellow-300' : 'text-red-500'} />
                                        <span className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${isDarkBadge ? 'text-white/90' : 'text-gray-800'}`}>
                                            Kết thúc sau
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-start gap-1.5 sm:gap-2">
                                        {/* Days (if > 0) */}
                                        {timeLeft.days > 0 && (
                                            <>
                                                <div className="flex flex-col items-center bg-red-500 rounded-lg sm:rounded-xl p-2 sm:p-3 min-w-[50px] sm:min-w-[65px] md:min-w-[75px] shadow-md">
                                                    <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tabular-nums text-white">
                                                        {String(timeLeft.days).padStart(2, '0')}
                                                    </span>
                                                    <span className="text-[10px] sm:text-xs uppercase opacity-90 font-semibold mt-0.5 text-white">Ngày</span>
                                                </div>
                                                <span className={`text-lg sm:text-xl md:text-2xl ${isDarkBadge ? 'text-white/60' : 'text-gray-600'}`}>:</span>
                                            </>
                                        )}
                                        {/* Hours */}
                                        <div className="flex flex-col items-center bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 min-w-[50px] sm:min-w-[65px] md:min-w-[75px] border border-gray-200 shadow-md">
                                            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tabular-nums text-gray-900">
                                                {String(timeLeft.hours || 0).padStart(2, '0')}
                                            </span>
                                            <span className="text-[10px] sm:text-xs uppercase opacity-70 font-semibold mt-0.5 text-gray-700">Giờ</span>
                                        </div>
                                        <span className={`text-lg sm:text-xl md:text-2xl ${isDarkBadge ? 'text-white/60' : 'text-gray-600'}`}>:</span>
                                        {/* Minutes */}
                                        <div className="flex flex-col items-center bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 min-w-[50px] sm:min-w-[65px] md:min-w-[75px] border border-gray-200 shadow-md">
                                            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tabular-nums text-gray-900">
                                                {String(timeLeft.minutes || 0).padStart(2, '0')}
                                            </span>
                                            <span className="text-[10px] sm:text-xs uppercase opacity-70 font-semibold mt-0.5 text-gray-700">Phút</span>
                                        </div>
                                        <span className={`text-lg sm:text-xl md:text-2xl ${isDarkBadge ? 'text-white/60' : 'text-gray-600'}`}>:</span>
                                        {/* Seconds */}
                                        <div className="flex flex-col items-center bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 min-w-[50px] sm:min-w-[65px] md:min-w-[75px] border border-gray-200 shadow-md">
                                            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tabular-nums text-gray-900">
                                                {String(timeLeft.seconds || 0).padStart(2, '0')}
                                            </span>
                                            <span className="text-[10px] sm:text-xs uppercase opacity-70 font-semibold mt-0.5 text-gray-700">Giây</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* CTA Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Link
                                        href={currentPromo.link_url || '/menu'}
                                        className={`inline-flex items-center gap-2 ${isDarkBadge ? 'bg-white text-orange-600 hover:bg-yellow-50' : 'bg-gray-900 text-white hover:bg-gray-800'} font-bold py-3 sm:py-3.5 px-5 sm:px-7 rounded-3xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 active:scale-95`}
                                    >
                                        <span className="text-base sm:text-lg">Đặt Ngay</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                            </div>

                            {/* Right Image - Hidden on smaller screens, shown on larger screens */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 0.6 }}
                                className="hidden lg:block relative w-1/3 max-w-md"
                            >
                                <div className="aspect-square relative">
                                    {/* Glow Effect */}
                                    <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl transform scale-90 animate-pulse"></div>

                                    {/* Product Image */}
                                    <motion.div
                                        whileHover={{ scale: 1.05, rotate: 2 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="relative z-10 w-full h-full"
                                    >
                                        {currentPromo.image_url ? (
                                            <Image
                                                src={currentPromo.image_url}
                                                alt={currentPromo.name}
                                                fill
                                                className="object-contain drop-shadow-2xl"
                                                priority
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
                                                    <Zap size={48} className="text-white/60" />
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Discount Badge */}
                                    <motion.div
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 12 }}
                                        transition={{ type: "spring", delay: 0.4 }}
                                        className="absolute -top-2 -left-2 sm:top-0 sm:left-0 bg-gradient-to-br from-red-500 to-red-600 text-white font-black text-base sm:text-lg lg:text-xl px-3 sm:px-4 py-1.5 sm:py-2 rounded-br-2xl rounded-tl-2xl shadow-xl z-20"
                                    >
                                        {currentPromo.badge_text}
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Navigation Arrows (for multiple slides) */}
                        {flashSales.length > 1 && (
                            <>
                                <button
                                    onClick={goToPrev}
                                    className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isDarkBadge ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-black/10 hover:bg-black/20 text-gray-900'} backdrop-blur-md flex items-center justify-center transition-all shadow-lg`}
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={goToNext}
                                    className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isDarkBadge ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-black/10 hover:bg-black/20 text-gray-900'} backdrop-blur-md flex items-center justify-center transition-all shadow-lg`}
                                    aria-label="Next slide"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}

                        {/* Slide Indicators */}
                        {flashSales.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                                {flashSales.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`h-2 rounded-full transition-all ${index === currentSlide
                                                ? `w-8 ${isDarkBadge ? 'bg-white' : 'bg-gray-900'}`
                                                : `w-2 ${isDarkBadge ? 'bg-white/50 hover:bg-white/75' : 'bg-gray-900/30 hover:bg-gray-900/50'}`
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <style jsx>{`
                @keyframes moveBackground {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(25px, 25px); }
                }
            `}</style>
        </section>
    );
}
