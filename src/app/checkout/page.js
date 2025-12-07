/**
 * Checkout page component - Enhanced UI
 * @file src/app/checkout/page.js
 */
import CheckoutClient from "@/components/CheckoutClient";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export const metadata = {
  title: 'Thanh toán - Bánh Tằm Cô Đào',
};

export default function CheckoutPage() {
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
            <span className="font-medium text-primary">Thanh toán</span>
          </nav>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-lobster text-secondary mb-2">
              Thanh Toán
            </h1>
            <p className="text-gray-500 text-sm">Vui lòng hoàn tất thông tin bên dưới để đặt hàng</p>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="max-w-[1200px] mx-auto px-4 pb-10 md:pb-16">
        <CheckoutClient />
      </div>
    </div>
  );
}