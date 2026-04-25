/**
 * Wishlist page component - Nâng cấp UI/UX
 * @file src/app/wishlist/page.js
 */
'use client';

import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import { Heart, Trash2, ShoppingCart, Sparkles, ArrowRight, X, AlertTriangle, Share2, Plus, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist, isLoaded } = useWishlist();
  const { addToCart } = useCart();
  const [showClearModal, setShowClearModal] = useState(false);
  const [isAddingAll, setIsAddingAll] = useState(false);

  // Calculate total value
  const totalValue = wishlistItems.reduce((sum, item) => {
    const price = item.discount_price ?? item.price;
    return sum + price;
  }, 0);

  const handleAddAllToCart = () => {
    setIsAddingAll(true);
    wishlistItems.forEach((item) => {
      addToCart(item, 1);
    });
    setTimeout(() => setIsAddingAll(false), 1000);
  };

  const handleClearWishlist = () => {
    clearWishlist();
    setShowClearModal(false);
  };

  if (!isLoaded) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 pt-24 pb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-2xl w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 pt-24 pb-8">
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
        <span className="font-medium text-primary">Danh sách yêu thích</span>
      </nav>

      {/* Title và Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        {wishlistItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddAllToCart}
              disabled={isAddingAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isAddingAll ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang thêm...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Thêm tất cả vào giỏ</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-rose-600 border-2 border-rose-200 rounded-xl hover:bg-rose-50 transition-all duration-300 font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa tất cả</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {wishlistItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng số món</p>
                <p className="text-2xl font-bold text-gray-900">{wishlistItems.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng giá trị</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 md:py-24">
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-16 h-16 text-rose-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center animate-pulse">
              <Sparkles className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
            Danh sách yêu thích của bạn đang trống
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto text-md">
            Khám phá thực đơn và thêm những món ăn bạn yêu thích vào danh sách này để dễ dàng đặt hàng sau!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-xl font-semibold text-lg"
            >
              Khám phá thực đơn
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              Về trang chủ
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl z-10 opacity-0 group-hover:opacity-100"
                  aria-label="Xóa khỏi danh sách yêu thích"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowClearModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa tất cả món yêu thích?</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa tất cả <span className="font-semibold text-gray-900">{wishlistItems.length} món</span> khỏi danh sách yêu thích? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleClearWishlist}
                  className="flex-1 bg-rose-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-rose-600 transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowClearModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
