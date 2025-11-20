// src/components/CartClient.js
'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package, Truck, X, AlertTriangle } from 'lucide-react';
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

    // Handler để mở modal xác nhận xóa
    const handleDeleteClick = (itemId) => {
        const item = cartItems.find(i => i.id === itemId);
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    // Handler để xác nhận xóa
    const handleConfirmDelete = () => {
        if (itemToDelete) {
            removeFromCart(itemToDelete.id);
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    // Handler để đóng modal
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    // Handler để giảm số lượng - nếu quantity = 1 thì hiển thị modal
    const handleDecreaseQuantity = (itemId, currentQuantity) => {
        if (currentQuantity <= 1) {
            // Nếu số lượng = 1, hiển thị modal xác nhận xóa
            const item = cartItems.find(i => i.id === itemId);
            setItemToDelete(item);
            setShowDeleteModal(true);
        } else {
            // Nếu số lượng > 1, giảm bình thường
            updateQuantity(itemId, currentQuantity - 1);
        }
    };

    // Logic miễn phí vận chuyển
    const FREE_SHIPPING_THRESHOLD = 50000; // 50.000 ₫
    const remainingAmount = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
    const progressPercentage = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);
    const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;

    if (cartItems.length === 0) {
        return (
            <div className="max-w-md mx-auto text-center py-16 md:py-24">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
                    <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Giỏ hàng của bạn đang trống</h2>
                <p className="text-gray-600 mb-8">Hãy thêm một số món ngon vào giỏ hàng để bắt đầu!</p>
                <Link
                    href="/menu"
                    className="inline-flex items-center gap-2 bg-primary text-white hover:bg-white hover:text-primary hover:border-primary hover:border-2 font-semibold py-3 px-8 rounded-xl text-lg"
                >
                    Khám phá thực đơn
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Cột trái: Danh sách sản phẩm */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header với số lượng sản phẩm */}
                <div className="bg-gradient-to-r from-primary/10 to-orange-50 border-b border-gray-200 px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <ShoppingCart className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Sản phẩm trong giỏ hàng</h2>
                                <p className="text-base text-gray-500">{totalItems} {totalItems === 1 ? 'sản phẩm' : 'sản phẩm'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thanh tiến độ miễn phí vận chuyển */}
                {!isFreeShipping && (
                    <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="space-y-3">
                            <p className="text-basefont-semibold text-gray-700 pb-2">
                                Bạn cần mua thêm <span className="text-red-500 font-bold">{formatCurrency(remainingAmount)}</span> để được <span className="text-green-600 font-bold">MIỄN PHÍ GIAO HÀNG</span>
                            </p>
                            {/* Thanh tiến độ */}
                            <div className="relative w-full h-2 bg-gray-200 rounded-md overflow-visible">
                                <div
                                    className="absolute top-0 left-0 h-full bg-green-600 rounded-md transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                >
                                </div>
                                {/* Icon xe tải trên thanh tiến độ - màu đỏ trong vòng tròn vàng */}
                                {progressPercentage > 5 && (
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 z-10"
                                        style={{ left: `calc(${Math.min(progressPercentage, 95)}% - 12px)` }}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-md border-2 border-white">
                                            <Truck className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Thông báo đã đủ điều kiện miễn phí ship */}
                {isFreeShipping && (
                    <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-green-50">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-green-500">
                                <Truck className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-green-700">
                                Bạn đã đủ điều kiện <span className="font-bold">MIỄN PHÍ GIAO HÀNG</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* --- TIÊU ĐỀ BẢNG (CHỈ HIỆN TRÊN DESKTOP) --- */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-base font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="col-span-5">Sản phẩm</div>
                    <div className="col-span-2 text-right">GIÁ</div>
                    <div className="col-span-2 text-center">SỐ LƯỢNG</div>
                    <div className="col-span-3 text-right">TỔNG CỘNG</div>
                </div>

                {/* --- DANH SÁCH SẢN PHẨM --- */}
                <div className="divide-y divide-gray-100">
                    {cartItems.map((item, index) => (
                        <div key={item.id} className="px-4 md:px-6 py-4 md:py-5 hover:bg-gray-50/50 transition-colors">
                            {/* --- BỐ CỤC CHO DESKTOP --- */}
                            <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                        <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                                        {item.category_name && (
                                            <p className="text-xs text-gray-500">{item.category_name}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-2 text-right">
                                    <div className="font-semibold text-base text-gray-900">{formatCurrency(item.discount_price ?? item.price)}</div>
                                    {item.discount_price && item.discount_price < item.price && (
                                        <div className="text-xs text-gray-400 line-through mt-0.5">{formatCurrency(item.price)}</div>
                                    )}
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    <div className="flex items-center border border-gray-200 rounded bg-white">
                                        <button
                                            onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                                            className="px-2 py-2 border-r border-gray-200 hover:bg-gray-50 transition-colors text-gray-900"
                                            aria-label="Giảm số lượng"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value, 10);
                                                if (isNaN(val) || val < 1) {
                                                    // Nếu nhập 0 hoặc số âm, hiển thị modal xác nhận xóa
                                                    if (val === 0) {
                                                        const itemToDelete = cartItems.find(i => i.id === item.id);
                                                        if (itemToDelete) {
                                                            setItemToDelete(itemToDelete);
                                                            setShowDeleteModal(true);
                                                        }
                                                    }
                                                    return;
                                                }
                                                updateQuantity(item.id, val);
                                            }}
                                            className="w-10 text-center border-x border-gray-200 focus:outline-none text-sm font-semibold text-gray-900 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            min="1"
                                        />
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="px-2 py-2 border-l border-gray-200 hover:bg-gray-50 transition-colors text-gray-900"
                                            aria-label="Tăng số lượng"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-3 flex items-center justify-end gap-3">
                                    <div className="font-bold text-lg text-red-500">{formatCurrency((item.discount_price ?? item.price) * item.quantity)}</div>
                                    <button
                                        onClick={() => handleDeleteClick(item.id)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                                        aria-label="Xóa sản phẩm"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* --- BỐ CỤC CHO MOBILE --- */}
                            <div className="lg:hidden">
                                <div className="flex items-start gap-4">
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                        <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                                        {item.category_name && (
                                            <p className="text-xs text-gray-500 mb-2">{item.category_name}</p>
                                        )}
                                        <div className="flex items-center justify-between gap-2 mt-3">
                                            <div className="flex items-center border border-gray-200 rounded bg-white">
                                                <button
                                                    onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                                                    className="px-2 py-1 border-r border-gray-200 hover:bg-gray-50 transition-colors text-gray-900"
                                                    aria-label="Giảm số lượng"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        if (isNaN(val) || val < 1) {
                                                            // Nếu nhập 0 hoặc số âm, hiển thị modal xác nhận xóa
                                                            if (val === 0) {
                                                                const itemToDelete = cartItems.find(i => i.id === item.id);
                                                                if (itemToDelete) {
                                                                    setItemToDelete(itemToDelete);
                                                                    setShowDeleteModal(true);
                                                                }
                                                            }
                                                            return;
                                                        }
                                                        updateQuantity(item.id, val);
                                                    }}
                                                    className="w-8 text-center border-x border-gray-200 focus:outline-none text-sm font-semibold text-gray-900 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    min="1"
                                                />
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-2 py-2 border-l border-gray-200 hover:bg-gray-50 transition-colors text-gray-900"
                                                    aria-label="Tăng số lượng"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    {item.discount_price && item.discount_price < item.price && (
                                                        <div className="text-xs text-gray-400 line-through">{formatCurrency(item.price)}</div>
                                                    )}
                                                    <p className="font-bold text-red-500 text-base">{formatCurrency((item.discount_price ?? item.price) * item.quantity)}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteClick(item.id)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    aria-label="Xóa sản phẩm"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer với nút tiếp tục mua sắm */}
                <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <Link
                        href="/menu"
                        className="inline-flex items-center gap-2 text-primary font-semibold hover:text-orange-600 transition-colors"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>

            {/* Cột phải: Tóm tắt đơn hàng */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-orange-50 border-b border-gray-200 px-4 py-4">
                        <h2 className="text-xl font-bold text-gray-900">Tóm tắt giỏ hàng</h2>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-6 space-y-4">
                        {/* Tạm tính */}
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-gray-700 font-medium text-lg">Tạm tính</span>
                            <span className="font-semibold text-gray-900 text-lg">{formatCurrency(totalPrice)}</span>
                        </div>

                        {/* Phí vận chuyển */}
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-200">
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-sm">Phí giao hàng</span>
                            </div>
                            <span className="text-sm text-gray-500 text-right">Sẽ được tính ở bước sau</span>
                        </div>

                        {/* Tổng cộng */}
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-bold text-gray-900 text-xl">Tổng cộng</span>
                            <span className="text-2xl font-bold text-red-500">{formatCurrency(totalPrice)}</span>
                        </div>

                        {/* Button Checkout */}
                        <Link
                            href="/checkout"
                            className="block w-full mt-6 bg-primary border-2 border-primary text-white font-bold py-3 rounded-xl text-lg hover:bg-white hover:text-primary hover:border-primary hover:border-2"
                        >
                            <span className="flex items-center justify-center gap-2">
                                Tiến hành thanh toán
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </Link>

                        {/* Security badge */}

                    </div>
                </div>
            </div>

            {/* Modal xác nhận xóa */}
            {showDeleteModal && itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleCancelDelete}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-red-100 flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa sản phẩm</h3>
                                <p className="text-gray-700 mb-4">
                                    Bạn có chắc chắn muốn xóa <span className="font-semibold text-gray-900">&quot;{itemToDelete.name}&quot;</span> khỏi giỏ hàng?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCancelDelete}
                                        className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmDelete}
                                        className="flex-1 bg-red-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCancelDelete}
                                className="p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}