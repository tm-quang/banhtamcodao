'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn, Heart, Share2, Maximize2 } from 'lucide-react';

/**
 * ProductGallery Component
 * Displays product images with thumbnail navigation and lightbox
 * @param {Object} props
 * @param {Array} props.images - Array of image objects with id and image_url
 * @param {string} props.productName - Product name for alt text
 * @param {Object} props.product - Product object for sharing
 * @param {boolean} props.isWishlisted - Whether product is wishlisted
 * @param {Function} props.onWishlistToggle - Callback for wishlist toggle
 * @param {Function} props.onShare - Callback for share
 */
export default function ProductGallery({
    images = [],
    productName = 'Product',
    product = null,
    isWishlisted = false,
    onWishlistToggle = null,
    onShare = null
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    // Disable body scroll when lightbox is open
    useEffect(() => {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isLightboxOpen]);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square md:aspect-[4/3] relative rounded-2xl overflow-hidden border bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 text-sm md:text-base">Không có ảnh</p>
            </div>
        );
    }

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleThumbnailClick = (index) => {
        setCurrentIndex(index);
    };

    const handleImageClick = () => {
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        setIsZoomed(false);
    };

    const handleZoom = (e) => {
        e.stopPropagation();
        setIsZoomed(!isZoomed);
    };

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        if (onWishlistToggle) {
            onWishlistToggle();
        }
    };

    const handleShareClick = (e) => {
        e.stopPropagation();
        if (onShare) {
            onShare();
        }
    };

    return (
        <>
            {/* Main Gallery */}
            <div className="space-y-4 md:space-y-4">
                {/* Main Image */}
                <div
                    className="aspect-square md:aspect-[4/3] relative rounded-3xl overflow-hidden bg-white group cursor-pointer"
                    onClick={handleImageClick}
                >
                    <Image
                        src={images[currentIndex]?.image_url || '/placeholder.jpg'}
                        alt={`${productName} - Ảnh ${currentIndex + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={currentIndex === 0}
                    />

                    {/* Action Buttons - Show on hover */}
                    <div className="absolute top-2 md:top-4 right-2 md:right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onWishlistToggle && (
                            <button
                                onClick={handleWishlistClick}
                                className={`p-2 md:p-2.5 rounded-2xl border-2 backdrop-blur-sm transition-all ${isWishlisted
                                    ? 'border-red-500 bg-red-500/90 text-white'
                                    : 'border-white/80 bg-white/80 text-gray-700 hover:bg-white'
                                    }`}
                                aria-label="Thêm vào yêu thích"
                            >
                                <Heart size={18} className="md:w-5 md:h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
                            </button>
                        )}
                        {onShare && (
                            <button
                                onClick={handleShareClick}
                                className="p-2 md:p-2.5 rounded-2xl border-2 border-white/80 bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm transition-all"
                                aria-label="Chia sẻ"
                            >
                                <Share2 size={18} className="md:w-5 md:h-5" />
                            </button>
                        )}
                        <button
                            onClick={handleImageClick}
                            className="p-2 md:p-2.5 rounded-2xl border-2 border-white/80 bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm transition-all"
                            aria-label="Phóng to"
                        >
                            <Maximize2 size={18} className="md:w-5 md:h-5" />
                        </button>
                    </div>

                    {/* Navigation Arrows (only show if multiple images) */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Ảnh trước"
                            >
                                <ChevronLeft size={24} className="text-gray-800" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Ảnh tiếp theo"
                            >
                                <ChevronRight size={24} className="text-gray-800" />
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-black/60 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {images.map((image, index) => (
                            <button
                                key={image.id || index}
                                onClick={() => handleThumbnailClick(index)}
                                className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 relative rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all ${currentIndex === index
                                    ? 'border-primary ring-2 ring-primary/30'
                                    : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                aria-label={`Xem ảnh ${index + 1}`}
                            >
                                <Image
                                    src={image.image_url || '/placeholder.jpg'}
                                    alt={`${productName} - Thumbnail ${index + 1}`}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    {/* Action Buttons - Top Right */}
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <button
                            onClick={handleZoom}
                            className="p-3 rounded-3xl border-2 border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all"
                            aria-label={isZoomed ? "Thu nhỏ" : "Phóng to"}
                        >
                            {isZoomed ? <X size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <button
                            onClick={closeLightbox}
                            className="p-3 rounded-3xl border-2 border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-colors"
                            aria-label="Đóng"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                                aria-label="Ảnh trước"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                                aria-label="Ảnh tiếp theo"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}

                    {/* Lightbox Image */}
                    <div
                        className={`relative max-w-6xl max-h-[90vh] w-full h-full transition-transform duration-300 ${isZoomed ? 'cursor-zoom-out scale-150' : 'cursor-zoom-in'
                            }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            // Don't toggle zoom on image click, use button instead
                        }}
                    >
                        <Image
                            src={images[currentIndex]?.image_url || '/placeholder.jpg'}
                            alt={`${productName} - Ảnh ${currentIndex + 1}`}
                            fill
                            sizes="100vw"
                            className="object-contain"
                        />
                    </div>

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
