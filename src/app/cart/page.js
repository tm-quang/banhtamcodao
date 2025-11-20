// src/app/cart/page.js
import CartClient from "@/components/CartClient";
import { ShoppingCart, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Giỏ hàng - Bánh Tằm Cô Đào',
};

export default function CartPage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-white to-primary/5 border-b border-gray-200 pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex text-gray-500 text-sm mb-6 items-center flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="font-medium text-secondary">Giỏ hàng</span>
          </nav>
          
          <div className="max-w-3xl mx-auto text-center">
            {/* <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border-2 border-primary/20 mb-3">
              <ShoppingCart className="w-7 h-7 text-primary" />
            </div> */}
            <h1 className="text-4xl md:text-4xl font-lobster text-black mb-4 bg-gradient-to-r from-secondary to-primary bg-clip-text">
              Giỏ Hàng Của Bạn
            </h1>
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="container mx-auto px-2 md:px-1 py-6 md:py-6">
        <CartClient />
      </div>
    </div>
  );
}