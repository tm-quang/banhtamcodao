// src/components/ProductCard.js
'use client';

import Link from 'next/link';
import { ShoppingBag, ShoppingCart, Handbag, Gift } from 'lucide-react';
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
    <div className="bg-white rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 flex flex-col h-full shadow-md hover:shadow-md border border-gray-200">
      {/* Ảnh */}
      <Link href={`/product/${product.slug}`} className="block flex-shrink-0 w-full relative overflow-hidden aspect-square">
        <img
          src={product.image_url || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </Link>

      {/* Nội dung */}
      <div className="card-padding flex flex-col flex-grow">
        {/* Tên món */}
        <h3 className="text-lg md:text-xl font-bold text-gray-600 line-clamp-2 mb-2 leading-snug min-h-[2.2rem] md:min-h-[3rem]">
          <Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Giá và Button */}
        <div className="flex flex-col gap-1 flex-grow">
          {/* Container Giá: flex-col trên mobile/tablet, flex-row trên desktop (lg) */}
          <div className="flex flex-col lg:flex-row lg:items-baseline lg:gap-3">
            {/* Giá bán */}
            <span className="text-2xl md:text-[28px] font-bold text-[#FF5B24] whitespace-nowrap">
              {formatCurrency(hasDiscount ? (product.discount_price || 0) : product.price)}
            </span>
          </div>

          {/* Khối Nội dung phụ (Giá giảm & Khuyến mãi) - Chỉ hiện nếu có ít nhất 1 loại */}
          {(hasDiscount || product.promotion_text) ? (
            <div className="flex flex-col gap-1">
              {/* Tầng 1: Giá gốc & Badge % (Slot cố định) */}
              <div className="h-6 md:h-7 flex items-center">
                {hasDiscount && (
                  <div className="flex items-center gap-2 lg:items-baseline lg:gap-3">
                    <span className="text-md md:text-[17px] text-gray-400 line-through whitespace-nowrap leading-none">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="bg-red-600 text-white text-[12px] md:text-[15px] font-bold px-1.5 py-0.5 rounded-lg shadow-sm leading-none">
                      -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Tầng 2: Khuyến mãi Combo (Slot cố định) */}
              <div className="h-5 md:h-6 flex items-center">
                {product.promotion_text && (
                  <div className="flex items-center gap-1 text-emerald-500 rounded-lg w-fit transition-all">
                    <Gift size={14} className="flex-shrink-0 text-emerald-500" />
                    <span className="text-[10px] md:text-[12px] font-bold truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[200px] leading-tight">
                      {product.promotion_text}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /** 
             * Nếu không có cả 2, không render gì cả để hàng tự co gọn 
             * (CSS Grid row sẽ tự tính toán chiều cao nhỏ hơn)
             */
            null
          )}

          <button
            onClick={handleAddToCart}
            className="w-full mt-auto cursor-pointer card-padding rounded-2xl bg-primary text-white text-base md:text-xl font-semibold hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
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