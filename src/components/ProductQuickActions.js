// src/components/ProductQuickActions.js
'use client';

import { Heart, Share2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { useState } from 'react';

export default function ProductQuickActions({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);

  const isWishlisted = isInWishlist(product?.id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;
    
    setIsWishlistAnimating(true);
    toggleWishlist(product);
    
    showToast(
      isWishlisted 
        ? 'Đã xóa khỏi danh sách yêu thích' 
        : 'Đã thêm vào danh sách yêu thích',
      isWishlisted ? 'info' : 'success'
    );
    
    setTimeout(() => setIsWishlistAnimating(false), 600);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;

    const shareData = {
      title: product.name,
      text: product.description || `Xem ${product.name} tại Bánh Tằm Cô Đào`,
      url: typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug}` : '',
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showToast('Đã chia sẻ sản phẩm', 'success');
      } else {
        // Fallback: Copy to clipboard
        const url = shareData.url;
        await navigator.clipboard.writeText(url);
        showToast('Đã sao chép liên kết vào clipboard', 'success');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Fallback: Copy to clipboard
        try {
          const url = shareData.url;
          await navigator.clipboard.writeText(url);
          showToast('Đã sao chép liên kết vào clipboard', 'success');
        } catch (clipboardError) {
          showToast('Không thể chia sẻ. Vui lòng thử lại.', 'error');
        }
      }
    }
  };

  if (!product) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={`
          w-10 h-10 md:w-11 md:h-11
          rounded-full
          flex items-center justify-center
          transition-all duration-300
          hover:scale-110
          active:scale-95
          ${isWishlistAnimating ? 'animate-bounce' : ''}
          ${
            isWishlisted
              ? 'bg-red-500 text-white shadow-lg hover:bg-red-600'
              : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-md hover:shadow-lg border border-gray-200'
          }
        `}
        aria-label={isWishlisted ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
      >
        <Heart
          size={20}
          className={`transition-all duration-300 ${
            isWishlisted ? 'fill-current' : ''
          }`}
        />
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="
          w-10 h-10 md:w-11 md:h-11
          rounded-full
          flex items-center justify-center
          bg-white text-gray-400
          hover:text-primary hover:bg-primary/10
          shadow-md hover:shadow-lg
          border border-gray-200
          transition-all duration-300
          hover:scale-110
          active:scale-95
        "
        aria-label="Chia sẻ sản phẩm"
      >
        <Share2 size={20} />
      </button>
    </div>
  );
}

