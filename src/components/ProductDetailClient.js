// src/components/ProductDetailClient.js
'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function ProductDetailClient({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    // Chỉ cần gọi hàm addToCart, không cần alert nữa
    addToCart(product, quantity);
  };

  return (
    <div className="flex items-center gap-4 mt-8">
      <div className="flex items-center border border-gray-300 rounded-md">
        <button onClick={handleDecrease} className="px-4 py-2 text-lg font-semibold hover:bg-gray-100 rounded-l-md">-</button>
        <span className="w-12 h-11 text-center border-l border-r border-gray-300 flex items-center justify-center font-medium">
          {quantity}
        </span>
        <button onClick={handleIncrease} className="px-4 py-2 text-lg font-semibold hover:bg-gray-100 rounded-r-md">+</button>
      </div>
      <button onClick={handleAddToCart} className="flex-grow bg-primary text-light font-bold py-3 px-6 rounded-md hover:bg-orange-600 transition-colors shadow-lg">
        Thêm vào giỏ hàng
      </button>
    </div>
  );
}