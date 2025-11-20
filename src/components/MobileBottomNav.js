// src/components/MobileBottomNav.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Menu, ShoppingCart, FileText, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Menu', href: '/menu', icon: Menu },
    { name: 'Giỏ hàng', href: '/cart', icon: ShoppingCart, isCenter: true },
    { name: 'Đơn hàng', href: '/orders', icon: FileText },
    { name: 'Tài khoản', href: '/account', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <div key={item.name} className="relative -top-5">
                <Link href={item.href} className="flex flex-col items-center justify-center">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white ${isActive ? 'bg-primary text-white' : 'bg-white text-primary border-primary'
                      }`}
                  >
                    <Icon size={24} strokeWidth={2.5} />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </motion.div>
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
