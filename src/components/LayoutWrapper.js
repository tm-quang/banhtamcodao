// src/components/LayoutWrapper.js
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HelpButton from '@/components/HelpButton';
import MiniCart from '@/components/MiniCart'; // <-- Import MiniCart
import MobileBottomNav from '@/components/MobileBottomNav';
import { useCart } from '@/context/CartContext'; // <-- Import useCart
import ScrollToTop from '@/components/ScrollToTop';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const { isMiniCartOpen, closeMiniCart } = useCart(); // <-- Lấy state và hàm từ context

  const isContactPage = pathname === '/contact';
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pb-32 md:pb-0">
          {children}
        </main>
        {!isContactPage && <Footer />}
      </div>
      
      <HelpButton />

      <MobileBottomNav />
      
      {/* Thêm MiniCart vào đây */}
      <MiniCart isOpen={isMiniCartOpen} onClose={closeMiniCart} />
    </>
  );
}