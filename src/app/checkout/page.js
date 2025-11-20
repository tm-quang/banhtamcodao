// src/app/checkout/page.js
import CheckoutClient from "@/components/CheckoutClient";
import Link from "next/link";
import { ChevronRight, CreditCard } from "lucide-react";

export const metadata = {
  title: 'Thanh toán - Bánh Tằm Cô Đào',
};

export default function CheckoutPage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-white to-primary/5 border-b border-gray-200 pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex text-gray-500 text-sm mb-6 items-center flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="font-medium text-secondary">Thanh toán</span>
          </nav>
          
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-lobster text-black mb-3 bg-gradient-to-r from-secondary to-primary bg-clip-text">
              Thanh Toán
            </h1>
            <p className="text-gray-400">Vui lòng hoàn tất thông tin bên dưới để đặt hàng</p>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="container mx-auto px-2 py-8 md:py-12">
        <CheckoutClient />
      </div>
    </div>
  );
}