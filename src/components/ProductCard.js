// src/components/ProductCard.js
'use client'; // Thêm 'use client' để sử dụng hook

import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext'; // Import useCart
import WishlistButton from './WishlistButton';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart(); // Lấy hàm addToCart từ context
  const hasDiscount = product.discount_price && product.discount_price < product.price;

  // Hàm xử lý việc thêm vào giỏ hàng
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Ngăn không cho điều hướng đến trang chi tiết sản phẩm
    e.preventDefault();
    addToCart(product, 1); // Thêm 1 sản phẩm vào giỏ
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden group transition-all duration-300 hover:-translate-y-2 flex flex-col relative h-full product-card-shadow">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative w-full aspect-square rounded-t-3xl overflow-hidden">
          <Image
            src={product.image_url || '/placeholder.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {/* Wishlist Button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <WishlistButton product={product} size="small" />
          </div>
        </div>
      </Link>

      <div className="flex-grow px-3 md:px-4 pt-3 md:pt-4">
        <h3 className="text-base md:text-xl font-bold text-secondary line-clamp-2 min-h-[44px]">
          <Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>
        <p className="hidden md:block text-base text-gray-400 mt-1">{product.category_name}</p>
      </div>

      <div className="px-3 md:px-4 pb-3 md:pb-4 mt-3 md:mt-6 min-h-[48px]">
        <div className="flex flex-col">
          <span className={`${hasDiscount ? 'text-sm md:text-sm text-gray-400 line-through' : 'text-xs md:text-sm opacity-0 select-none'}`}>
            {formatCurrency(product.price)}
          </span>
          <p className={`text-xl md:text-xl font-bold ${hasDiscount ? 'text-primary' : 'text-secondary'}`}>
            {formatCurrency(hasDiscount ? product.discount_price : product.price)}
          </p>
        </div>
      </div>

      {/* Cập nhật nút bấm với hiệu ứng nền lõm và icon nổi */}
      <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
        <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-full add-to-cart-button-wrapper flex items-center justify-center">
          <button
            onClick={handleAddToCart}
            className="bg-transparent text-primary rounded-full w-9 h-9 md:w-12 md:h-12 flex items-center justify-center hover:text-orange-600 transition-all duration-300 add-to-cart-button"
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
          >
            <Plus size={20} className="md:hidden" />
            <Plus size={24} className="hidden md:block" />
          </button>
        </div>
      </div>
    </div>
  );
}