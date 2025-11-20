// src/components/ProductCardHorizontal.js
'use client'; // Thêm 'use client'

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext'; // Import useCart

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function ProductCardHorizontal({ product }) {
  const { addToCart } = useCart(); // Lấy hàm addToCart

  // Hàm xử lý
  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product, 1);
  };

  return (
    <div className="bg-light rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center p-3 gap-4">
      <Link href={`/product/${product.slug}`} className="block flex-shrink-0">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden">
          <Image
            src={product.image_url || '/placeholder.jpg'}
            alt={product.name}
            fill
            sizes="100px"
            className="object-cover"
          />
        </div>
      </Link>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-secondary mb-1">
          <Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-gray-400 mb-2">{product.category_name}</p>
        <p className="text-lg font-bold text-primary">
          {formatCurrency(product.discount_price ?? product.price)}
        </p>
      </div>
      <div className="flex-shrink-0">
        {/* Cập nhật nút bấm */}
        <button 
          onClick={handleAddToCart}
          className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-orange-600 transition-colors"
          aria-label={`Thêm ${product.name} vào giỏ hàng`}
        >
          <ShoppingCart size={22} />
        </button>
      </div>
    </div>
  );
}