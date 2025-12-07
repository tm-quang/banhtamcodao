// src/components/MobileBottomNav.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, ShoppingCart, FileText, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartItems, openMiniCart } = useCart();
  const [animatingTab, setAnimatingTab] = useState(null);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { id: 'home', name: 'Trang chủ', href: '/', icon: Home },
    { id: 'menu', name: 'Menu', href: '/menu', icon: UtensilsCrossed },
    { id: 'cart', name: 'Giỏ hàng', href: '/cart', icon: ShoppingCart, isCart: true },
    { id: 'orders', name: 'Đơn hàng', href: '/order-tracking', icon: FileText },
    { id: 'account', name: 'Tài khoản', href: '/account', icon: User },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    // Tài khoản active cho cả /account và /login
    if (href === '/account') {
      return pathname.startsWith('/account') || pathname.startsWith('/login');
    }
    return pathname.startsWith(href);
  };

  const triggerAnimation = (tabId) => {
    setAnimatingTab(null);
    requestAnimationFrame(() => {
      setAnimatingTab(tabId);
      setTimeout(() => setAnimatingTab(null), 600);
    });
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    triggerAnimation('cart');
    openMiniCart();
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[9999] lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const shouldAnimate = animatingTab === item.id;

          // Cart button - special styling
          if (item.isCart) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={handleCartClick}
                className="relative flex flex-col items-center justify-center flex-1 h-full"
              >
                <div
                  className={`border border-gray-500 relative flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-md transition-transform duration-300 ${shouldAnimate ? 'animate-zoom-once' : ''
                    }`}
                >
                  <Icon size={22} strokeWidth={2.5} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 border-2 border-white">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </div>
              </button>
            );
          }

          // Regular nav items
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => triggerAnimation(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full ${active ? 'text-primary' : 'text-gray-500'
                } transition-colors duration-200`}
            >
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${active ? 'bg-primary/10' : ''
                  } ${shouldAnimate ? 'animate-zoom-once' : ''}`}
              >
                <Icon size={25} strokeWidth={active ? 2.5 : 2} />
              </span>
              <span className={`text-[12px] font-semibold transition-transform duration-300 ${shouldAnimate ? 'animate-zoom-text-once' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area spacer for notched devices */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
