// src/components/CartClient.js
'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Gift, Sparkles, X, Loader2, Handbag, Truck, CheckCircle2, Shield, Zap, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPromotionSuggestions } from '@/utils/comboPromotions';


const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function CartClient() {
    const { cartItems, removeFromCart, updateQuantity, isUpdating } = useCart();
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [activeCombos, setActiveCombos] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const fetchCombos = async () => {
            try {
                const res = await fetch('/api/combo-promotions/active');
                const data = await res.json();
                if (data.success && data.comboPromotions) {
                    setActiveCombos(data.comboPromotions);
                }
            } catch (error) {
                console.error('Error fetching combos:', error);
            }
        };
        fetchCombos();
    }, []);

    useEffect(() => {
        if (activeCombos.length > 0 && cartItems.length > 0) {
            const newSuggestions = getPromotionSuggestions(cartItems, activeCombos);
            setSuggestions(newSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [cartItems, activeCombos]);


    const totalPrice = cartItems.reduce((total, item) => {
        // Bỏ qua sản phẩm tặng (is_free = true)
        if (item.is_free) return total;
        const price = item.discount_price ?? item.price ?? item.finalPrice ?? 0;
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

    const handleProceedToCheckout = async () => {
        setIsValidating(true);
        setValidationError('');
        try {
            const response = await fetch('/api/cart/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items_list: cartItems })
            });
            const data = await response.json();

            if (data.success) {
                router.push('/checkout');
            } else {
                setValidationError(data.message);
                alert(data.message);
            }
        } catch (error) {
            console.error('Validation error:', error);
            setValidationError('Có lỗi xảy ra khi kiểm tra giỏ hàng. Vui lòng thử lại.');
            alert('Có lỗi xảy ra khi kiểm tra giỏ hàng. Vui lòng thử lại.');
        } finally {
            setIsValidating(false);
        }
    };

    // Empty cart state
    return (
        <div className="relative min-h-[400px]">
            {/* Loading Overlay */}
            {isUpdating && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                    <p className="text-gray-900">Đang cập nhật lại giỏ hàng...</p>
                </div>
            )}

            {cartItems.length === 0 ? (
                <div className="max-w-lg mx-auto text-center section-spacing px-4 py-12 md:py-20">
                    <div className="relative inline-block mb-8">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-orange-100 flex items-center justify-center mx-auto">
                            <Handbag className="w-16 h-16 text-primary/60" />
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
                        className="inline-flex items-center gap-3 bg-primary text-white font-semibold py-4 px-8 rounded-xl text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        Khám phá thực đơn
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-4 items-start">
                    {/* Left Column: Product List */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-300">
                        {/* Header */}
                        <div className="px-5 md:px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                                    <Handbag className="w-6 h-6 text-primary" />
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
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <Truck className="w-4 h-4 text-white" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Mua thêm <span className="text-primary font-bold">{formatCurrency(remainingAmount)}</span> để được{' '}
                                        <span className="text-emerald-600 font-bold">MIỄN PHÍ GIAO HÀNG</span>
                                    </p>
                                </div>
                                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-emerald-600 rounded-full transition-all duration-700 ease-out"
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
                                    key={`${item.id}-${item.is_free ? 'free' : 'paid'}-${item.combo_promotion_id || ''}`}
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
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-2">
                                                        {item.name}
                                                    </h3>
                                                    {item.is_free && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 px-2 py-0.5 rounded-full shadow-sm">
                                                            <Gift size={12} />
                                                            Tặng kèm
                                                        </span>
                                                    )}
                                                </div>
                                                {item.category_name && (
                                                    <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {item.category_name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price and Quantity Controls */}
                                            <div className="flex items-end justify-between gap-3 mt-3">
                                                {/* Quantity Selector - Disable for free items */}
                                                {item.is_free ? (
                                                    <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden opacity-60">
                                                        <span className="px-4 py-2.5 text-sm text-gray-500">
                                                            Số lượng: {item.quantity}
                                                        </span>
                                                    </div>
                                                ) : (
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
                                                )}

                                                {/* Price and Delete */}
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        {item.is_free ? (
                                                            <p className="text-lg sm:text-xl font-bold text-green-600">
                                                                0đ
                                                            </p>
                                                        ) : (
                                                            <>
                                                                <p className="text-lg sm:text-xl font-bold text-primary">
                                                                    {formatCurrency((item.discount_price ?? item.price) * item.quantity)}
                                                                </p>
                                                                {item.discount_price && item.discount_price < item.price && (
                                                                    <p className="text-xs text-gray-400 line-through">
                                                                        {formatCurrency(item.price * item.quantity)}
                                                                    </p>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                    {!item.is_free && (
                                                        <button
                                                            onClick={() => handleDeleteClick(item.id)}
                                                            className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
                                                            aria-label="Xóa sản phẩm"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Promotion Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="px-4 md:px-6 py-4">
                                <div className="flex items-center gap-2 mb-2 border-t-2 border-dashed border-gray-300 pt-2">
                                    <h3 className="font-bold text-gray-900">Ưu đãi dành riêng cho bạn!</h3>
                                </div>
                                <div className="space-y-4">
                                    {suggestions.map((suggestion) => (
                                        <div key={suggestion.id} className="bg-white p-4 rounded-2xl border-2 border-dashed border-red-500/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-red-400 transition-colors duration-300">
                                            <div className="flex gap-4 items-start">
                                                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                    <Gift className="w-6 h-6 text-red-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 mb-1">{suggestion.name}</h4>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {suggestion.description ? suggestion.description : (
                                                            <>
                                                                {suggestion.type === 'AND' ? (
                                                                    <>
                                                                        Thêm {suggestion.missing.map((m, i) => (
                                                                            <span key={i} className="font-bold text-primary">
                                                                                {m.needed} {m.name}{i < suggestion.missing.length - 1 ? ', ' : ''}
                                                                            </span>
                                                                        ))}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Mua thêm <span className="font-bold text-primary">{suggestion.missing[0].needed} {suggestion.missing[0].name}</span>
                                                                    </>
                                                                )}
                                                                {suggestion.neededValue > 0 && (
                                                                    <> và mua thêm <span className="font-bold text-primary">{formatCurrency(suggestion.neededValue)}</span></>
                                                                )}
                                                                {' '}để nhận thêm quà!
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                href="/menu"
                                                className="inline-flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold py-3 px-6 rounded-xl hover:bg-orange-600 transition-all whitespace-nowrap shadow-md hover:shadow-lg hover:shadow-primary/20 transform hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                                Thêm món ngay
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


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
                        <div className="bg-white rounded-2xl shadow-md sticky top-24 overflow-hidden border border-gray-300">
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
                                        <span className="text-emerald-600 font-semibold">Miễn phí giao hàng</span>
                                    ) : (
                                        <span className="text-sm text-gray-500">Sẽ được tính ở bước tiếp theo</span>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
                                </div>

                                {/* Validation Error Message */}
                                {validationError && (
                                    <div className="mt-2 text-sm text-rose-500 font-medium">
                                        {validationError}
                                    </div>
                                )}

                                {/* Checkout Button */}
                                <button
                                    type="button"
                                    onClick={handleProceedToCheckout}
                                    disabled={isValidating}
                                    className="flex items-center justify-center gap-2 w-full mt-4 bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100"
                                >
                                    {isValidating ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Tiến hành thanh toán
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                {/* Trust badges */}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                            Thanh toán linh hoạt
                                        </span>
                                        <span className="text-gray-300">|</span>
                                        <span className="flex items-center gap-1.5">
                                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                                            Giao hàng tận nơi
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && itemToDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleCancelDelete}
                >
                    <div
                        className="relative bg-white rounded-2xl max-w-sm w-full p-6 transform transition-all duration-300 scale-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]"
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
                                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="flex-1 bg-red-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-rose-600 transition-colors"
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