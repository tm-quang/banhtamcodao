/**
 * Cart page component - Enhanced UI
 * @file src/app/cart/page.js
 */
import CartClient from "@/components/CartClient";
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Giỏ hàng - Bánh Tằm Cô Đào',
};

export default function CartPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #FFF5EB 0%, #FFFBF7 100%)' }}>
      {/* Hero Section */}
      <div className="pt-20 pb-6 md:pb-8">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors"
            >
              <Home size={14} />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="font-medium text-primary">Giỏ hàng</span>
          </nav>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-lobster text-secondary">
              Giỏ Hàng Của Bạn
            </h1>
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="max-w-[1200px] mx-auto px-4 pb-10 md:pb-16">
        <CartClient />
      </div>
    </div>
  );
}