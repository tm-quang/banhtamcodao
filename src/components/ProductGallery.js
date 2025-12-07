'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

/**
 * ProductGallery Component
 * Displays product images with thumbnail navigation and lightbox
 * @param {Object} props
 * @param {Array} props.images - Array of image objects with id and image_url
 * @param {string} props.productName - Product name for alt text
 */
export default function ProductGallery({ images = [], productName = 'Product' }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square relative rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400">Không có ảnh</p>
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

    return (
        <>
            {/* Main Gallery */}
            <div className="space-y-4">
                {/* Main Image */}
                <div
                    className="aspect-square relative rounded-lg overflow-hidden border bg-white group cursor-pointer"
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

                    {/* Zoom Indicator */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn size={20} />
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
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
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
                                className={`flex-shrink-0 w-20 h-20 relative rounded-md overflow-hidden border-2 transition-all ${currentIndex === index
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
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                        aria-label="Đóng"
                    >
                        <X size={24} />
                    </button>

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
                            setIsZoomed(!isZoomed);
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
