// src/components/ProductDetailClient.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingCart, Share2 } from 'lucide-react';
import ProductOptions from './ProductOptions';
import { useToast } from '@/context/ToastContext';

export default function ProductDetailClient({ product, options = [] }) {
  const [quantity, setQuantity] = useState(1);
  const [isSticky, setIsSticky] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
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
          title: product.name,
          text: `Xem ${product.name} tại Bánh Tằm Cô Đào`,
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

      {/* Price Display */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Giá sản phẩm:</span>
          <span className="font-medium">{formatCurrency(basePrice)}</span>
        </div>
        {selectedOptions.additionalPrice > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Phụ thu:</span>
            <span className="font-medium text-primary">+{formatCurrency(selectedOptions.additionalPrice)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-lg font-semibold text-secondary">Tổng cộng:</span>
          <span className="text-2xl font-bold text-primary">{formatCurrency(selectedOptions.totalPrice)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6">
        {/* Quantity Selector */}
        <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={handleDecrease}
            className="px-4 py-3 text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            -
          </button>
          <span className="w-14 h-12 text-center border-l-2 border-r-2 border-gray-300 flex items-center justify-center font-medium text-lg">
            {quantity}
          </span>
          <button
            onClick={handleIncrease}
            className="px-4 py-3 text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="flex-grow bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <ShoppingCart size={20} />
          Thêm vào giỏ hàng
        </button>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`p-3 rounded-lg border-2 transition-all ${isWishlisted
            ? 'border-red-500 bg-red-50 text-red-500'
            : 'border-gray-300 hover:border-red-300 text-gray-600'
            }`}
          aria-label="Thêm vào yêu thích"
        >
          <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 text-gray-600 transition-all"
          aria-label="Chia sẻ"
        >
          <Share2 size={24} />
        </button>
      </div>

      {/* Sticky Mobile Add to Cart */}
      {isSticky && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40 md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="text-sm text-gray-600">Tổng:</div>
              <div className="text-lg font-bold text-primary">{formatCurrency(selectedOptions.totalPrice * quantity)}</div>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-grow bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Thêm {quantity} vào giỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}