// src/components/CartClient.js
'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Truck, X, AlertTriangle, ShoppingBag, Sparkles, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function CartClient() {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const totalPrice = cartItems.reduce((total, item) => {
        const price = item.discount_price ?? item.price;
        return total + price * item.quantity;
    }, 0);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleDeleteClick = (itemId) => {
        const item = cartItems.find(i => i.id === itemId);
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            removeFromCart(itemToDelete.id);
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    const handleDecreaseQuantity = (itemId, currentQuantity) => {
        if (currentQuantity <= 1) {
            const item = cartItems.find(i => i.id === itemId);
            setItemToDelete(item);
            setShowDeleteModal(true);
        } else {
            updateQuantity(itemId, currentQuantity - 1);
        }
    };

    // Free shipping logic
    const FREE_SHIPPING_THRESHOLD = 50000;
    const remainingAmount = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
    const progressPercentage = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);
    const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;

    // Empty cart state
    if (cartItems.length === 0) {
        return (
            <div className="max-w-lg mx-auto text-center py-16 md:py-24 px-4">
                <div className="relative inline-block mb-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-orange-100 flex items-center justify-center mx-auto">
                        <ShoppingCart className="w-16 h-16 text-primary/60" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-gray-400" />
                    </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Giỏ hàng của bạn đang trống
                </h2>
                <p className="text-gray-500 mb-8 text-lg">
                    Hãy thêm một số món ngon vào giỏ hàng để bắt đầu!
                </p>
                <Link
                    href="/menu"
                    className="inline-flex items-center gap-3 bg-primary text-white font-semibold py-4 px-8 rounded-2xl text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300"
                >
                    <ShoppingBag className="w-5 h-5" />
                    Khám phá thực đơn
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Left Column: Product List */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="px-5 md:px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                            <ShoppingCart className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Sản phẩm trong giỏ hàng</h2>
                            <p className="text-sm text-gray-500 mt-0.5">{totalItems} sản phẩm</p>
                        </div>
                    </div>
                </div>

                {/* Free Shipping Progress */}
                {!isFreeShipping ? (
                    <div className="px-5 md:px-6 py-4 border-y border-amber-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Truck className="w-4 h-4 text-amber-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">
                                Mua thêm <span className="text-primary font-bold">{formatCurrency(remainingAmount)}</span> để được{' '}
                                <span className="text-emerald-600 font-bold">MIỄN PHÍ SHIP</span>
                            </p>
                        </div>
                        <div className="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="px-5 md:px-6 py-3 bg-emerald-50 border-y border-emerald-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Truck className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-emerald-700">
                                <CheckCircle2 className="w-4 h-4 inline mr-1" /> Bạn đã được <span className="font-bold">MIỄN PHÍ GIAO HÀNG</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Product List */}
                <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                        <div
                            key={item.id}
                            className="px-5 md:px-6 py-5 hover:bg-gray-50/50 transition-colors duration-200 group"
                        >
                            <div className="flex gap-4">
                                {/* Product Image */}
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                                    <Image
                                        src={item.image_url}
                                        alt={item.name}
                                        fill
                                        sizes="(max-width: 640px) 96px, 112px"
                                        className="object-cover"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-2 mb-1">
                                            {item.name}
                                        </h3>
                                        {item.category_name && (
                                            <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                {item.category_name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Price and Quantity Controls */}
                                    <div className="flex items-end justify-between gap-3 mt-3">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                                                className="p-2.5 hover:bg-gray-200 transition-colors text-gray-600"
                                                aria-label="Giảm số lượng"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-10 text-center font-semibold text-gray-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2.5 hover:bg-gray-200 transition-colors text-gray-600"
                                                aria-label="Tăng số lượng"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        {/* Price and Delete */}
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-lg sm:text-xl font-bold text-primary">
                                                    {formatCurrency((item.discount_price ?? item.price) * item.quantity)}
                                                </p>
                                                {item.discount_price && item.discount_price < item.price && (
                                                    <p className="text-xs text-gray-400 line-through">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteClick(item.id)}
                                                className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
                                                aria-label="Xóa sản phẩm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-5 md:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <Link
                        href="/menu"
                        className="inline-flex items-center gap-2 text-primary font-semibold hover:text-orange-600 transition-colors group"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg sticky top-24 overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-5 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>
                    </div>

                    {/* Content */}
                    <div className="px-5 pt-5 pb-5 space-y-4">
                        {/* Subtotal */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tạm tính ({totalItems} món)</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(totalPrice)}</span>
                        </div>

                        {/* Shipping */}
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <span className="text-gray-600">Phí giao hàng</span>
                            {isFreeShipping ? (
                                <span className="text-emerald-600 font-semibold">Miễn phí</span>
                            ) : (
                                <span className="text-sm text-gray-500">Sẽ được tính ở bước tiếp</span>
                            )}
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                            <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
                        </div>

                        {/* Checkout Button */}
                        <Link
                            href="/checkout"
                            className="flex items-center justify-center gap-2 w-full mt-4 bg-primary text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300"
                        >
                            Tiến hành thanh toán
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        {/* Trust badges */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                    Thanh toán an toàn
                                </span>
                                <span className="text-gray-300">|</span>
                                <span className="flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                                    Giao nhanh 30 phút
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && itemToDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleCancelDelete}
                >
                    <div
                        className="relative bg-white rounded-3xl max-w-sm w-full p-6 transform transition-all duration-300 scale-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa sản phẩm?</h3>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc muốn xóa <span className="font-semibold text-gray-900">"{itemToDelete.name}"</span> khỏi giỏ hàng?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancelDelete}
                                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-2xl hover:bg-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="flex-1 bg-rose-500 text-white font-semibold py-3 px-4 rounded-2xl hover:bg-rose-600 transition-colors"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCancelDelete}
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