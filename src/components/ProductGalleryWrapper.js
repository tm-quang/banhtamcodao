'use client';

import { useState } from 'react';
import ProductGallery from './ProductGallery';
import { useToast } from '@/context/ToastContext';

/**
 * ProductGalleryWrapper Component
 * Wraps ProductGallery with wishlist and share functionality
 */
export default function ProductGalleryWrapper({ images, productName, product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { showToast } = useToast();

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    showToast(
      isWishlisted ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích',
      'success'
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || productName,
          text: `Xem ${product?.name || productName} tại Bánh Tằm Cô Đào`,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Đã sao chép link sản phẩm!', 'success');
  };

  return (
    <ProductGallery
      images={images}
      productName={productName}
      product={product}
      isWishlisted={isWishlisted}
      onWishlistToggle={handleWishlistToggle}
      onShare={handleShare}
    />
  );
}

