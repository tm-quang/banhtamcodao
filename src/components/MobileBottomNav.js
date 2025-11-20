'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Utensils, ClipboardList, User2, ShoppingCart } from 'lucide-react';
import { useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const baseItemClasses =
  'group flex flex-col items-center justify-center gap-1 transition-colors';
const labelClasses = 'text-[11px] font-medium';

const iconClasses = 'w-5 h-5';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartItems, openMiniCart, isCartAnimating } = useCart();
  const { user, loading: authLoading } = useAuth();

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + (item.quantity || 0), 0),
    [cartItems]
  );

  const leftItems = [
    {
      href: '/',
      label: 'Trang chủ',
      icon: Home,
    },
    {
      href: '/menu',
      label: 'Menu',
      icon: Utensils,
    },
  ];

  const getAccountLabel = () => {
    if (authLoading) return 'Đang tải';
    if (user?.full_name) {
      const parts = user.full_name.trim().split(/\s+/);
      return parts.length > 1 ? parts.slice(-2).join(' ') : parts[0];
    }
    return 'Tài khoản';
  };

  const accountHref = user ? '/account/profile' : '/login';

  const rightItems = [
    {
      href: '/order-tracking',
      label: 'Đơn hàng',
      icon: ClipboardList,
    },
    {
      href: accountHref,
      label: getAccountLabel(),
      icon: User2,
      activeMatch: user
        ? (path) => path.startsWith('/account')
        : (path) => false,
    },
  ];

  const renderNavLink = ({ href, label, icon: Icon, activeMatch }) => {
    const isActive = typeof activeMatch === 'function'
      ? activeMatch(pathname)
      : pathname === href || pathname.startsWith(`${href}/`);

    const handleClick = (event) => {
      if (!user && href.startsWith('/account')) {
        event.preventDefault();
        window.location.href = '/login';
        return;
      }
    };

    return (
      <Link key={href} href={href} className={baseItemClasses} onClick={handleClick}>
        <span
          className={`flex items-center justify-center rounded-full p-2 transition-all border ${
            isActive
              ? 'bg-primary border-primary/60 shadow-md'
              : 'bg-white border-transparent group-active:bg-primary/10'
          }`}
        >
          <Icon
            className={iconClasses}
            color={isActive ? '#ffffff' : '#6b7280'}
            strokeWidth={1.75}
          />
        </span>
        <span
          className={`${labelClasses} ${
            isActive ? 'text-primary font-semibold' : 'text-gray-500 group-hover:text-primary'
          }`}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden pointer-events-none">
      <div className="relative mx-auto max-w-2xl pointer-events-auto">
        {/* Thanh nav phẳng, không bo góc */}
        <div className="bg-white shadow-[0_-6px_24px_rgba(15,23,42,0.1)] border-t border-slate-100 px-4 pt-1 pb-safe">
          <div className="flex items-end justify-between text-xs">
            <div className="flex gap-8 flex-1 justify-start">{leftItems.map(renderNavLink)}</div>
            <div className="flex gap-8 flex-1 justify-end">{rightItems.map(renderNavLink)}</div>
          </div>
        </div>

        {/* Nút giỏ hàng nổi phía trên (dạng dấu + nửa trong nửa ngoài) */}
        <button
          type="button"
          onClick={openMiniCart}
          className={`absolute left-1/2 -translate-x-1/2 -translate-y-16 p-1 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg ring-4 ring-white transition-transform ${
            isCartAnimating ? 'animate-pulse' : 'hover:scale-105'
          }`}
          aria-label="Mở giỏ hàng"
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-primary" />
          </div>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}

