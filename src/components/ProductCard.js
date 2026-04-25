// src/components/ProductCard.js
'use client';

import Link from 'next/link';
import { ShoppingBag, ShoppingCart, Handbag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

/**
 * Format currency to Vietnamese Dong
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

/**
 * ProductCard component - Hiển thị thẻ món ăn với ảnh, tên, giá và nút đặt món
 */
export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const hasDiscount = product.discount_price && product.discount_price < product.price;

  /**
   * Handle add to cart
   */
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 flex flex-col h-full shadow-md hover:shadow-md border border-gray-200">
      {/* Ảnh */}
      <Link href={`/product/${product.slug}`} className="block flex-shrink-0 w-full relative overflow-hidden aspect-square">
        <img
          src={product.image_url || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </Link>

      {/* Nội dung */}
      <div className="p-3 md:p-4 lg:p-4 flex flex-col flex-grow">
        {/* Tên món */}
        <h3 className="text-md md:text-xl font-bold text-gray-900 line-clamp-2 mb-2 leading-snug min-h-[2.2rem] md:min-h-[3rem]">
          <Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Giá và Button */}
        <div className="mt-auto flex flex-col gap-1">
          <div className="flex flex-row items-center gap-3 md:gap-6">
            <span className={`text-xl md:text-2xl font-bold ${hasDiscount ? 'text-[#FF5B24]' : 'text-[#FF5B24]'}`}>
              {formatCurrency(hasDiscount ? (product.discount_price || 0) : product.price)}
            </span>
            {hasDiscount ? (
              <span className="text-base md:text-xl text-gray-500 line-through">
                {formatCurrency(product.price)}
              </span>
            ) : (
              /**
               * Placeholder để giữ layout không bị giật khi không có giảm giá
               */
              <span className="text-xs md:text-sm opacity-0 select-none">
                &nbsp;
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full mt-1 cursor-pointer py-3 px-3 rounded-xl bg-primary text-white text-base md:text-base font-semibold hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            aria-label={`Đặt món ${product.name}`}
          >
            <Handbag size={22} />
            <span>Đặt món</span>
          </button>
        </div>
      </div>
    </div>
  );
}