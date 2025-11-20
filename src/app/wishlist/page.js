// src/app/wishlist/page.js
'use client';

import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist, isLoaded } = useWishlist();

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-lobster text-primary dark:text-primary">
          Danh sách yêu thích
        </h1>
        {wishlistItems.length > 0 && (
          <button
            onClick={clearWishlist}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 size={20} />
            Xóa tất cả
          </button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
            Danh sách yêu thích trống
          </h2>
          <p className="text-gray-500 dark:text-gray-500 mb-8">
            Hãy thêm những món ăn bạn yêu thích vào danh sách này!
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Khám phá thực đơn
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Bạn có {wishlistItems.length} món ăn trong danh sách yêu thích
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                  aria-label="Xóa khỏi danh sách yêu thích"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}





