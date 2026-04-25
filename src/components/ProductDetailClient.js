// src/components/ProductDetailClient.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { Handbag, ShoppingCart } from 'lucide-react';
import ProductOptions from './ProductOptions';
import { useToast } from '@/context/ToastContext';

export default function ProductDetailClient({ product, options = [] }) {
  const [quantity, setQuantity] = useState(1);
  const [isSticky, setIsSticky] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    size: null,
    toppings: [],
    specialInstructions: '',
    additionalPrice: 0,
    totalPrice: product.discount_price ?? product.price,
  });

  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Sticky scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleOptionsChange = useCallback((newOptions) => {
    setSelectedOptions(newOptions);
  }, []);

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      selectedOptions: {
        size: selectedOptions.size,
        toppings: selectedOptions.toppings,
        specialInstructions: selectedOptions.specialInstructions,
      },
      finalPrice: selectedOptions.totalPrice,
    };

    addToCart(cartItem, quantity);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const basePrice = product.discount_price ?? product.price;

  return (
    <div className="flex flex-col">
      {/* Product Options */}
      <ProductOptions
        options={options}
        basePrice={basePrice}
        onOptionsChange={handleOptionsChange}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-2 md:gap-3 mt-4 md:mt-6">
        {/* Quantity Selector - Redesigned */}
        <div className="flex items-center bg-white border-2 border-gray-300 rounded-2xl overflow-hidden flex-shrink-0 h-12 md:h-14">
          <button
            onClick={handleDecrease}
            className="w-10 md:w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors font-semibold text-lg md:text-xl"
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <div className="w-12 md:w-14 h-full flex items-center justify-center border-l border-r border-gray-300 bg-gray-50">
            <span className="font-semibold text-base md:text-lg text-secondary">
              {quantity}
            </span>
          </div>
          <button
            onClick={handleIncrease}
            className="w-10 md:w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors font-semibold text-lg md:text-xl"
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="flex-grow h-12 md:h-14 bg-primary text-white font-bold px-3 md:px-6 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <Handbag size={18} className="md:w-5 md:h-5" />
          <span className="hidden sm:inline">Thêm vào giỏ hàng</span>
          <span className="sm:hidden">Thêm vào giỏ</span>
        </button>
      </div>

      {/* Sticky Mobile Add to Cart */}
      {isSticky && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-3 md:p-4 shadow-2xl z-40 md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="text-xs text-gray-600">Tổng:</div>
              <div className="text-base md:text-lg font-bold text-primary">{formatCurrency(selectedOptions.totalPrice * quantity)}</div>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-grow bg-primary text-white font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <ShoppingCart size={18} />
              Thêm {quantity} vào giỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}