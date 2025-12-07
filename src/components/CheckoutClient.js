// src/components/CheckoutClient.js
'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Truck, Store, Banknote, CreditCard, User, Phone, MapPin, Calendar, Clock, FileText, ShoppingCart, ArrowRight, CheckCircle2, Plus, X, Tag, Info, HelpCircle, Shield, Zap } from 'lucide-react';
import { SkeletonCheckout } from '@/components/Skeleton';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function CheckoutClient() {
    const { cartItems, clearCartSilent } = useCart();
    const router = useRouter();

    const [deliveryMethod, setDeliveryMethod] = useState('delivery');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isCartLoaded, setIsCartLoaded] = useState(false);
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherInput, setVoucherInput] = useState('');
    const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
    const [showDateTimeModal, setShowDateTimeModal] = useState(false);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [orderResult, setOrderResult] = useState(null); // { success: true/false, orderCode, total, paymentMethod }

    useEffect(() => {
        const now = new Date();
        const timezoneOffset = 7 * 60;
        const localNow = new Date(now.getTime() + timezoneOffset * 60 * 1000);
        const dateString = localNow.toISOString().split('T')[0];
        const timeString = localNow.toISOString().split('T')[1].substring(0, 5);
        setDate(dateString);
        setTime(timeString);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsCartLoaded(true);
        }, 200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isCartLoaded) {
            try {
                const storedCart = localStorage.getItem('banhtamcodao_cart');
                const parsedCart = storedCart ? JSON.parse(storedCart) : [];
                // Don't redirect if we have orderResult (showing success/error modal)
                if (parsedCart.length === 0 && cartItems.length === 0 && !orderResult) {
                    router.push('/menu');
                }
            } catch (error) {
                if (cartItems.length === 0 && !orderResult) {
                    router.push('/menu');
                }
            }
        }
    }, [cartItems.length, isCartLoaded, router, orderResult]);

    const subtotal = cartItems.reduce((total, item) => {
        const price = item.discount_price ?? item.price;
        return total + price * item.quantity;
    }, 0);

    const FREE_SHIPPING_THRESHOLD = 50000;
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const baseShippingFee = deliveryMethod === 'delivery' ? 10000 : 0;
    const shippingFee = (deliveryMethod === 'delivery' && isFreeShipping) ? 0 : baseShippingFee;
    const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
    const total = subtotal - discountAmount + shippingFee;
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleApplyVoucher = async () => {
        if (!voucherInput.trim()) {
            setError('Vui lòng nhập mã giảm giá');
            return;
        }
        setError('');
        setIsValidatingVoucher(true);
        try {
            const response = await fetch('/api/vouchers/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: voucherInput.trim(), subtotal })
            });
            const data = await response.json();
            if (data.success && data.voucher) {
                setAppliedVoucher({
                    code: data.voucher.code,
                    discount: data.voucher.discount_amount,
                    title: data.voucher.title
                });
                setVoucherInput('');
                setError('');
            } else {
                setError(data.message || 'Mã giảm giá không hợp lệ');
            }
        } catch (error) {
            setError('Có lỗi xảy ra khi kiểm tra mã giảm giá');
        } finally {
            setIsValidatingVoucher(false);
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherInput('');
        setError('');
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setError('');

        // Validation - check required fields and focus on first empty one
        const focusAndScroll = (inputId, errorMessage) => {
            setError(errorMessage);
            setTimeout(() => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        };

        const phoneInput = document.getElementById('phone');
        const nameInput = document.getElementById('name');
        const addressInput = document.getElementById('address');

        // Check phone
        if (!phoneInput?.value?.trim()) {
            focusAndScroll('phone', 'Vui lòng nhập số điện thoại');
            return;
        }

        // Check name
        if (!nameInput?.value?.trim()) {
            focusAndScroll('name', 'Vui lòng nhập tên người nhận');
            return;
        }

        // Check address (only if delivery method is 'delivery')
        if (deliveryMethod === 'delivery' && !addressInput?.value?.trim()) {
            focusAndScroll('address', 'Vui lòng nhập địa chỉ nhận hàng');
            return;
        }

        // Check date
        if (!date) {
            focusAndScroll('date', 'Vui lòng chọn ngày nhận hàng');
            return;
        }

        // Check time
        if (!time) {
            focusAndScroll('time', 'Vui lòng chọn thời gian nhận hàng');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData(e.target);
            const phone_number = formData.get('phone');
            const recipient_name = formData.get('name');
            const delivery_address = formData.get('address') || '';
            const customer_note = formData.get('notes') || '';

            const items_list = cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.discount_price ?? item.price,
                qty: item.quantity
            }));

            const finalDeliveryAddress = deliveryMethod === 'pickup'
                ? 'Tự đến quán lấy'
                : delivery_address;

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number,
                    recipient_name,
                    delivery_address: finalDeliveryAddress,
                    delivery_method: deliveryMethod,
                    payment_method: paymentMethod,
                    subtotal,
                    shipping_fee: shippingFee,
                    total_amount: total,
                    items_list,
                    customer_note,
                    delivery_date: date,
                    delivery_time: time
                }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Có lỗi xảy ra khi đặt hàng');
            }

            clearCartSilent();
            // Redirect to order confirmation page
            router.push(`/order-confirmation?code=${data.order_code}`);
        } catch (err) {
            setOrderResult({
                success: false,
                message: err.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show empty cart message only if no orderResult (modal should take priority)
    if (isCartLoaded && cartItems.length === 0 && !orderResult) {
        return (
            <div className="text-center py-20">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Giỏ hàng trống, đang chuyển hướng...</h2>
            </div>
        );
    }

    // Show order result modal when cart is empty but we have orderResult
    if (orderResult) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)]">
                    {orderResult.success ? (
                        <div className="text-center">
                            {/* Success Icon */}
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h3>
                            <p className="text-gray-600 mb-4">
                                Mã đơn hàng: <span className="font-bold text-primary text-lg">{orderResult.orderCode}</span>
                            </p>

                            {/* QR Code for Transfer Payment */}
                            {orderResult.paymentMethod === 'transfer' && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Quét mã QR để thanh toán</p>
                                    <div className="bg-white p-3 rounded-xl inline-block shadow-sm border border-gray-100">
                                        <img
                                            src={`https://img.vietqr.io/image/970415-107870460026-compact2.png?amount=${orderResult.total}&addInfo=${orderResult.orderCode}&accountName=LE%20THI%20NGOC%20DAO`}
                                            alt="QR thanh toán"
                                            className="w-48 h-48 mx-auto"
                                        />
                                    </div>
                                    <div className="mt-3 text-sm text-gray-600">
                                        <p>Ngân hàng: <span className="font-semibold">VietinBank</span></p>
                                        <p>STK: <span className="font-semibold">107870460026</span></p>
                                        <p>Chủ TK: <span className="font-semibold">LÊ THỊ NGỌC ĐÀO</span></p>
                                        <p>Số tiền: <span className="font-bold text-primary">{formatCurrency(orderResult.total)}</span></p>
                                        <p>Nội dung: <span className="font-semibold">{orderResult.orderCode}</span></p>
                                    </div>
                                </div>
                            )}

                            {/* COD Message */}
                            {orderResult.paymentMethod === 'cod' && (
                                <div className="mb-6 p-4 bg-amber-50 rounded-2xl">
                                    <div className="flex items-center justify-center gap-2 text-amber-700">
                                        <Banknote className="w-5 h-5" />
                                        <p className="font-semibold">Thanh toán khi nhận hàng</p>
                                    </div>
                                    <p className="text-sm text-amber-600 mt-2">
                                        Tổng tiền: <span className="font-bold text-lg">{formatCurrency(orderResult.total)}</span>
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => router.push(`/order-tracking?code=${orderResult.orderCode}`)}
                                    className="w-full bg-primary text-white font-semibold py-3 rounded-2xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                    Xem chi tiết đơn hàng
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push('/')}
                                    className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-200 transition-colors"
                                >
                                    Về trang chủ
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            {/* Error Icon */}
                            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                                <X className="w-10 h-10 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thất bại</h3>
                            <p className="text-gray-600 mb-6">{orderResult.message}</p>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOrderResult(null);
                                        router.push('/cart');
                                    }}
                                    className="w-full bg-primary text-white font-semibold py-3 rounded-2xl hover:bg-primary/90 transition-colors"
                                >
                                    Thử lại
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push('/')}
                                    className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-200 transition-colors"
                                >
                                    Về trang chủ
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!isCartLoaded) {
        return <SkeletonCheckout />;
    }

    const TabButton = ({ isActive, onClick, children, icon: Icon }) => (
        <button
            type="button"
            onClick={onClick}
            className={`group flex items-center justify-center gap-2 w-full p-4 rounded-2xl border-2 transition-all duration-300 ${isActive
                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50'
                }`}
        >
            {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />}
            <span className="font-semibold">{children}</span>
        </button>
    );

    const InputField = ({ label, icon: Icon, required, id, children, ...props }) => (
        <div>
            <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            {children || (
                <input
                    id={id}
                    {...props}
                    className="block w-full border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                />
            )}
        </div>
    );

    return (
        <div className="max-w-[1200px] mx-auto">
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
                {/* Left Column: Form */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Customer Info Section */}
                    <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="px-5 py-5 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Thông tin khách hàng</h2>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Số điện thoại đặt hàng" icon={Phone} required id="phone" type="tel" name="phone" placeholder="Nhập số điện thoại" />
                                <InputField label="Tên người nhận" icon={User} required id="name" type="text" name="name" placeholder="Nhập tên người nhận" />
                            </div>
                        </div>
                    </section>

                    {/* Delivery Info Section */}
                    <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="px-5 py-5 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                                    <Truck className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Thông tin giao hàng</h2>
                            </div>
                        </div>
                        <div className="p-5 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <TabButton isActive={deliveryMethod === 'delivery'} onClick={() => setDeliveryMethod('delivery')} icon={Truck}>
                                    Giao hàng tận nơi
                                </TabButton>
                                <TabButton isActive={deliveryMethod === 'pickup'} onClick={() => setDeliveryMethod('pickup')} icon={Store}>
                                    Tự đến quán lấy
                                </TabButton>
                            </div>

                            {deliveryMethod === 'delivery' && (
                                <InputField label="Địa chỉ nhận hàng" icon={MapPin} required id="address" type="text" name="address" placeholder="Nhập địa chỉ chi tiết" />
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        Ngày nhận hàng <span className="text-rose-500">*</span>
                                        <button type="button" onClick={() => setShowDateTimeModal(true)} className="ml-auto p-1 rounded-full hover:bg-rose-100 transition-colors">
                                            <HelpCircle className="w-4 h-4 text-rose-500" />
                                        </button>
                                    </label>
                                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="block w-full border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        Thời gian nhận <span className="text-rose-500">*</span>
                                        <button type="button" onClick={() => setShowDateTimeModal(true)} className="ml-auto p-1 rounded-full hover:bg-rose-100 transition-colors">
                                            <HelpCircle className="w-4 h-4 text-rose-500" />
                                        </button>
                                    </label>
                                    <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} required className="block w-full border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notes Section */}
                    <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="px-5 py-5 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Ghi chú đơn hàng</h2>
                            </div>
                        </div>
                        <div className="p-5">
                            <textarea
                                name="notes"
                                rows="3"
                                className="block w-full border border-gray-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white resize-none"
                                placeholder="Nhập ghi chú cho đơn hàng (tùy chọn)"
                            />
                        </div>
                    </section>

                    {/* Payment Method Section */}
                    <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="px-5 py-5 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Hình thức thanh toán</h2>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <TabButton isActive={paymentMethod === 'cod'} onClick={() => setPaymentMethod('cod')} icon={Banknote}>
                                    Khi nhận hàng
                                </TabButton>
                                <TabButton isActive={paymentMethod === 'transfer'} onClick={() => setPaymentMethod('transfer')} icon={CreditCard}>
                                    Chuyển khoản
                                </TabButton>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg sticky top-24 overflow-hidden">
                        <div className="px-5 py-5 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                                        <ShoppingCart className="w-6 h-6 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>
                                </div>
                                <Link href="/menu" className="text-sm font-semibold text-primary hover:text-orange-600 transition-colors inline-flex items-center gap-1">
                                    <Plus className="w-4 h-4" />
                                    Thêm món
                                </Link>
                            </div>
                        </div>

                        <div className="p-5">
                            {/* Cart Items */}
                            <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                                            <Image src={item.image_url} alt={item.name} fill sizes="56px" className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-gray-500">x{item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-primary text-sm flex-shrink-0">
                                            {formatCurrency((item.discount_price ?? item.price) * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="space-y-3 py-4 border-y border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Tạm tính ({totalItems} món)</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                                </div>

                                {appliedVoucher && (
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">Giảm giá:</span>
                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{appliedVoucher.code}</span>
                                            <button type="button" onClick={handleRemoveVoucher} className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center hover:bg-rose-600 transition-colors">
                                                <X className="w-3 h-3 text-white" />
                                            </button>
                                        </div>
                                        <span className="font-semibold text-emerald-600">-{formatCurrency(discountAmount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-gray-600">Phí giao hàng</span>
                                        <button type="button" onClick={() => setShowShippingModal(true)} className="p-0.5 rounded-full hover:bg-gray-100 transition-colors">
                                            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-primary" />
                                        </button>
                                    </div>
                                    {deliveryMethod === 'delivery' && isFreeShipping ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 line-through text-sm">{formatCurrency(baseShippingFee)}</span>
                                            <span className="font-semibold text-emerald-600">Miễn phí</span>
                                        </div>
                                    ) : deliveryMethod === 'delivery' ? (
                                        <span className="font-semibold text-gray-900">{formatCurrency(shippingFee)}</span>
                                    ) : (
                                        <span className="font-semibold text-emerald-600">Miễn phí</span>
                                    )}
                                </div>

                                {/* Voucher Input */}
                                {!appliedVoucher && (
                                    <div className="pt-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={voucherInput}
                                                onChange={(e) => setVoucherInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleApplyVoucher()}
                                                placeholder="Nhập mã khuyến mãi"
                                                className="flex-grow border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyVoucher}
                                                disabled={isValidatingVoucher}
                                                className="bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
                                            >
                                                {isValidatingVoucher ? '...' : 'Áp dụng'}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Mã giảm giá không áp dụng đồng thời với KM khác.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Total */}
                            <div className="pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
                                </div>

                                {appliedVoucher && (
                                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-4">
                                        <Tag className="w-4 h-4" />
                                        <span>Bạn tiết kiệm {formatCurrency(discountAmount)}</span>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Tiến hành đặt hàng
                                        </>
                                    )}
                                </button>

                                {/* Trust badges */}
                                <div className="pt-4 mt-4 border-t border-gray-100">
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
                </div>
            </form>

            {/* DateTime Modal */}
            {showDateTimeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowDateTimeModal(false)}>
                    <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                <Info className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Thông báo</h3>
                            <p className="text-gray-600 mb-6">
                                Quý khách vui lòng chọn thời gian và ngày nhận hàng để quán chuẩn bị đơn hàng cho quý khách!
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowDateTimeModal(false)}
                                className="w-full bg-primary text-white font-semibold py-3 rounded-2xl hover:bg-primary/90 transition-colors"
                            >
                                Đã hiểu
                            </button>
                        </div>
                        <button type="button" onClick={() => setShowDateTimeModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
            )}

            {/* Shipping Policy Modal */}
            {showShippingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowShippingModal(false)}>
                    <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Truck className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Chính sách giao hàng</h3>
                            <div className="text-left space-y-3 mb-6">
                                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-700 text-sm"><span className="font-semibold text-emerald-600">Miễn phí</span> giao hàng cho đơn hàng trên <span className="font-semibold">50.000đ</span></p>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                                    <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-700 text-sm">Đơn dưới 50.000đ phí giao hàng <span className="font-semibold">10.000đ</span></p>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                                    <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-700 text-sm">Khu vực giao hàng: <span className="font-semibold">từ Cảng đến Cầu Sấu</span></p>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                    <Phone className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-700 text-sm">Liên hệ: <a href="tel:0933960788" className="font-semibold text-primary hover:underline">0933 960 788</a></p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowShippingModal(false)}
                                className="w-full bg-primary text-white font-semibold py-3 rounded-2xl hover:bg-primary/90 transition-colors"
                            >
                                Đã hiểu
                            </button>
                        </div>
                        <button type="button" onClick={() => setShowShippingModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
            )}

            {/* Order Result Modal */}
            {orderResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]">
                        {orderResult.success ? (
                            <div className="text-center">
                                {/* Success Icon */}
                                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h3>
                                <p className="text-gray-600 mb-4">
                                    Mã đơn hàng: <span className="font-bold text-primary text-lg">{orderResult.orderCode}</span>
                                </p>

                                {/* QR Code for Transfer Payment */}
                                {orderResult.paymentMethod === 'transfer' && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-sm font-semibold text-gray-700 mb-3">Quét mã QR để thanh toán</p>
                                        <div className="bg-white p-3 rounded-xl inline-block shadow-sm border border-gray-100">
                                            <img
                                                src={`https://img.vietqr.io/image/970415-107870460026-compact2.png?amount=${orderResult.total}&addInfo=${orderResult.orderCode}&accountName=LE%20THI%20NGOC%20DAO`}
                                                alt="QR thanh toán"
                                                className="w-48 h-48 mx-auto"
                                            />
                                        </div>
                                        <div className="mt-3 text-sm text-gray-600">
                                            <p>Ngân hàng: <span className="font-semibold">VietinBank</span></p>
                                            <p>STK: <span className="font-semibold">107870460026</span></p>
                                            <p>Chủ TK: <span className="font-semibold">LÊ THỊ NGỌC ĐÀO</span></p>
                                            <p>Số tiền: <span className="font-bold text-primary">{formatCurrency(orderResult.total)}</span></p>
                                            <p>Nội dung: <span className="font-semibold">{orderResult.orderCode}</span></p>
                                        </div>
                                    </div>
                                )}

                                {/* COD Message */}
                                {orderResult.paymentMethod === 'cod' && (
                                    <div className="mb-6 p-4 bg-amber-50 rounded-2xl">
                                        <div className="flex items-center justify-center gap-2 text-amber-700">
                                            <Banknote className="w-5 h-5" />
                                            <p className="font-semibold">Thanh toán khi nhận hàng</p>
                                        </div>
                                        <p className="text-sm text-amber-600 mt-2">
                                            Tổng tiền: <span className="font-bold text-lg">{formatCurrency(orderResult.total)}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/order-tracking?code=${orderResult.orderCode}`)}
                                        className="w-full bg-primary text-white font-semibold py-3 rounded-2xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                        Xem chi tiết đơn hàng
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/menu')}
                                        className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-200 transition-colors"
                                    >
                                        Tiếp tục mua sắm
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                {/* Error Icon */}
                                <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                                    <X className="w-10 h-10 text-rose-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thất bại</h3>
                                <p className="text-gray-600 mb-6">{orderResult.message}</p>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => setOrderResult(null)}
                                        className="w-full bg-primary text-white font-semibold py-3 rounded-2xl hover:bg-primary/90 transition-colors"
                                    >
                                        Thử lại
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/menu')}
                                        className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-200 transition-colors"
                                    >
                                        Quay lại menu
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}