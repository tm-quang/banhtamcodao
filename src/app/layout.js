// src/app/layout.js
import './globals.css';
import { Roboto, Lobster } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { WishlistProvider } from '@/context/WishlistContext';
import LayoutWrapper from '@/components/LayoutWrapper';
import { AuthProvider } from '@/context/AuthContext';
const roboto = Roboto({
  subsets: ['vietnamese'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

const lobster = Lobster({
  subsets: ['vietnamese'],
  weight: ['400'],
  variable: '--font-lobster',
});

export const metadata = {
  title: 'Bánh Tằm Cô Đào - Vị Ngon Miền Tây',
  description: 'Website đặt món Bánh Tằm Cô Đào phiên bản mới',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${roboto.variable} ${lobster.variable} font-roboto bg-gray-50 text-gray-800`}>
        {/* Cấu trúc đúng: AuthProvider bao bọc tất cả */}
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}