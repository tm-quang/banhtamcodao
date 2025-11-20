// src/components/WishlistButton.js
'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useState } from 'react';

export default function WishlistButton({ product, size = 'default', className = '' }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsAnimating(true);
    toggleWishlist(product);
    
    // Reset animation after duration
    setTimeout(() => setIsAnimating(false), 600);
  };

  const isWishlisted = isInWishlist(product.id);

  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const iconSizes = {
    small: 16,
    default: 20,
    large: 24
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        flex items-center justify-center 
        transition-all duration-300 
        hover:scale-110 
        ${isAnimating ? 'animate-bounce-in' : ''}
        ${isWishlisted 
          ? 'bg-red-500 text-white shadow-lg' 
          : 'bg-white dark:bg-dark-surface text-gray-400 hover:text-red-500 dark:hover:text-red-400 shadow-md hover:shadow-lg'
        }
        ${className}
      `}
      aria-label={isWishlisted ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
    >
      <Heart 
        size={iconSizes[size]} 
        className={`transition-all duration-300 ${
          isWishlisted ? 'fill-current' : ''
        }`}
      />
    </button>
  );
}

