// src/components/MiniCart.js
'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function MiniCart({ isOpen, onClose }) {
    const { cartItems, removeFromCart } = useCart();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const subtotal = cartItems.reduce((total, item) => {
        const price = item.discount_price ?? item.price;
        return total + price * item.quantity;
    }, 0);

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

    // Prevent body scroll when modal is open (chỉ trên mobile)
    useEffect(() => {
        if (isOpen) {
            // Kiểm tra nếu là mobile (dưới md breakpoint = 768px)
            const isMobile = window.innerWidth < 768;

            if (isMobile) {
                // Lưu scroll position hiện tại
                const scrollY = window.scrollY;
                // Thêm style để prevent scroll
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.width = '100%';
                document.body.style.overflow = 'hidden';

                return () => {
                    // Restore scroll position khi đóng modal
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.width = '';
                    document.body.style.overflow = '';
                    window.scrollTo(0, scrollY);
                };
            }
        }
    }, [isOpen]);

    return (
        <>
            {/* Lớp phủ nền */}
            <div
                className={`fixed inset-0 bg-black/60 z-[90] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Popup Mini Cart - Compact */}
            <div
                className={`fixed top-14 right-5 md:top-16 md:right-72 w-80 md:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-t-lg rounded-b-lg shadow-2xl z-[100] flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
            >
                {/* Arrow pointing up */}
                <div className="absolute -top-2 right-8 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-200"></div>
                {/* Header */}
                <div className="flex justify-between items-center rounded-t-lg p-4 border-b border-gray-200 bg-white flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">
                        Giỏ hàng của bạn
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Đóng giỏ hàng"
                    >
                        <X size={18} />
                    </button>
                </div>

                {cartItems.length > 0 ? (
                    <>
                        {/* Danh sách sản phẩm - Compact */}
                        <div className="max-h-64 overflow-y-auto p-3 space-y-2">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex gap-2 items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                                        <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            fill
                                            sizes="48px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="font-semibold text-gray-900 text-base mb-0.5 line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {item.quantity} x {formatCurrency(item.discount_price ?? item.price)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteClick(item.id)}
                                        className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                                        aria-label="Xóa sản phẩm"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Footer với tổng và nút */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3 flex-shrink-0 rounded-b-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-semibold text-gray-700">Tạm tính:</span>
                                <span className="text-xl font-bold text-red-500">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href="/cart"
                                    onClick={onClose}
                                    className="flex-1 text-center bg-white border border-primary text-primary text-base font-semibold py-3 px-4 rounded-md hover:bg-primary hover:text-white transition-colors"
                                >
                                    Xem giỏ hàng
                                </Link>
                                <Link
                                    href="/checkout"
                                    onClick={onClose}
                                    className="flex-1 text-center bg-primary border border-primary text-white text-base font-semibold py-3 px-4 rounded-md hover:bg-white hover:text-primary transition-colors"
                                >
                                    Thanh toán
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <ShoppingCart className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Giỏ hàng của bạn đang trống.</p>
                        {/* Đường kẻ ngang dưới dòng chữ */}
                        <div className="w-full border-t border-gray-200 mb-4 rounded-lg"></div>
                        <div className="flex gap-2 w-full">
                            <button
                                disabled
                                className="flex-1 text-center bg-gray-200 text-gray-500 text-sm font-semibold py-2.5 px-4 rounded-lg opacity-50 cursor-not-allowed pointer-events-none"
                            >
                                Xem giỏ hàng
                            </button>
                            <button
                                disabled
                                className="flex-1 text-center bg-gray-200 text-gray-500 text-sm font-semibold py-2.5 px-4 rounded-lg opacity-50 cursor-not-allowed pointer-events-none"
                            >
                                Thanh toán
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal xác nhận xóa */}
            {showDeleteModal && itemToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50" onClick={handleCancelDelete}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-red-100 flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa món</h3>
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
        </>
    );
}