// src/context/CartContext.js
'use client';

import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useToast } from '@/context/ToastContext'; // Import toast

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { showToast } = useToast(); // Sử dụng toast

  // --- LOGIC CHO MINI CART VÀ ANIMATION (ĐƯỢC THÊM LẠI) ---
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem('banhtamcodao_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('banhtamcodao_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Hàm mở mini cart (không tự động đóng)
  const openMiniCart = useCallback(() => {
    setIsMiniCartOpen(true);
  }, []);

  // Hàm đóng mini cart
  const closeMiniCart = useCallback(() => {
    setIsMiniCartOpen(false);
  }, []);

  // Hàm kích hoạt animation cho icon giỏ hàng
  const triggerCartAnimation = () => {
    setIsCartAnimating(true);
    setTimeout(() => setIsCartAnimating(false), 500); // Animation kéo dài 0.5s
  };

  const addToCart = (product, quantity) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });

    // Kích hoạt cả 2 hiệu ứng
    triggerCartAnimation();
    showToast('Thêm vào giỏ hàng thành công', 'success', { product });
  };

  const removeFromCart = (productId) => {
    let removedItemName = '';
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === productId);
      if (itemToRemove) {
        removedItemName = itemToRemove.name;
      }
      return prevItems.filter(item => item.id !== productId);
    });

    if (removedItemName) {
      showToast(`Đã xóa "${removedItemName}" khỏi giỏ hàng.`, 'error');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    showToast('Đã xóa toàn bộ giỏ hàng.', 'error');
  };

  // Silent version - no toast (for order completion)
  const clearCartSilent = () => {
    setCartItems([]);
  };

  // Cung cấp đầy đủ các state và hàm cho các component con
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearCartSilent,
    isMiniCartOpen,
    openMiniCart,
    closeMiniCart,
    isCartAnimating
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};