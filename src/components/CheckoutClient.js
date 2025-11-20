// src/components/CheckoutClient.js
'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Truck, Store, Banknote, CreditCard, User, Phone, MapPin, Calendar, Clock, FileText, ShoppingCart, ArrowRight, CheckCircle2, Plus, X, Tag, Info, HelpCircle } from 'lucide-react';
import { SkeletonCheckout } from '@/components/Skeleton';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function CheckoutClient() {
    const { cartItems, clearCart } = useCart();
    const router = useRouter();
    
    // State cho các lựa chọn và form
    const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' or 'pickup'
    const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'transfer'
    
    // State cho ngày/giờ để điền sẵn giá trị hiện tại
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    
    // State cho loading và error
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isCartLoaded, setIsCartLoaded] = useState(false);
    
    // State cho voucher
    const [appliedVoucher, setAppliedVoucher] = useState(null); // { code: 'MBS2', discount: 30800 }
    const [voucherInput, setVoucherInput] = useState('');
    const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
    
    // State cho modal thông báo
    const [showDateTimeModal, setShowDateTimeModal] = useState(false);

    useEffect(() => {
        const now = new Date();
        const timezoneOffset = 7 * 60; // GMT+7 in minutes
        const localNow = new Date(now.getTime() + timezoneOffset * 60 * 1000);
        
        const dateString = localNow.toISOString().split('T')[0];
        const timeString = localNow.toISOString().split('T')[1].substring(0, 5);

        setDate(dateString);
        setTime(timeString);
    }, []);

    // Đợi cart load từ localStorage trước khi kiểm tra redirect
    useEffect(() => {
        // Đợi một chút để đảm bảo CartContext đã load xong từ localStorage
        const timer = setTimeout(() => {
            setIsCartLoaded(true);
        }, 200);
        return () => clearTimeout(timer);
    }, []);

    // Redirect nếu giỏ hàng trống - chỉ redirect sau khi đã kiểm tra localStorage
    useEffect(() => {
        // Chỉ redirect sau khi đã đợi cart load và kiểm tra cả localStorage
        if (isCartLoaded) {
            try {
                const storedCart = localStorage.getItem('banhtamcodao_cart');
                const parsedCart = storedCart ? JSON.parse(storedCart) : [];
                
                // Chỉ redirect nếu cả localStorage và cartItems đều trống
                if (parsedCart.length === 0 && cartItems.length === 0) {
                    router.push('/menu');
                }
            } catch (error) {
                // Nếu có lỗi parse, kiểm tra cartItems
                if (cartItems.length === 0) {
                    router.push('/menu');
                }
            }
        }
    }, [cartItems.length, isCartLoaded, router]);

    const subtotal = cartItems.reduce((total, item) => {
        const price = item.discount_price ?? item.price;
        return total + price * item.quantity;
    }, 0);

    // Logic miễn phí vận chuyển
    const FREE_SHIPPING_THRESHOLD = 50000; // 50.000 ₫
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const baseShippingFee = deliveryMethod === 'delivery' ? 10000 : 0;
    const shippingFee = (deliveryMethod === 'delivery' && isFreeShipping) ? 0 : baseShippingFee;
    
    // Tính discount (giả sử voucher giảm 2% hoặc số tiền cố định)
    const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
    
    // Tính tổng: subtotal - discount + shipping
    const total = subtotal - discountAmount + shippingFee;
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Hàm áp dụng voucher - kiểm tra từ database
    const handleApplyVoucher = async () => {
        if (!voucherInput.trim()) {
            setError('Vui lòng nhập mã giảm giá');
            return;
        }
        
        setError(''); // Clear error trước
        setIsValidatingVoucher(true);
        
        try {
            const response = await fetch('/api/vouchers/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: voucherInput.trim(),
                    subtotal: subtotal
                })
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
            console.error('Error applying voucher:', error);
            setError('Có lỗi xảy ra khi kiểm tra mã giảm giá');
        } finally {
            setIsValidatingVoucher(false);
        }
    };
    
    // Hàm xóa voucher
    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherInput('');
        setError('');
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Lấy dữ liệu từ form
            const formData = new FormData(e.target);
            const phone_number = formData.get('phone');
            const recipient_name = formData.get('name');
            const delivery_address = formData.get('address') || '';
            const customer_note = formData.get('notes') || '';

            // Chuẩn bị items_list
            const items_list = cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.discount_price ?? item.price,
                qty: item.quantity
            }));

            // Xử lý địa chỉ: nếu là "Tự đến lấy" thì địa chỉ là quán
            const finalDeliveryAddress = deliveryMethod === 'pickup' 
                ? 'Tự đến quán lấy' 
                : delivery_address;

            // Gọi API để tạo đơn hàng
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone_number,
                    recipient_name,
                    delivery_address: finalDeliveryAddress,
                    delivery_method: deliveryMethod,
                    payment_method: paymentMethod,
                    total_amount: total,
                    items_list,
                    customer_note,
                    delivery_date: date,
                    delivery_time: time
                }),
            });

            const data = await response.json();

            if (!data.success) {
                const errorMsg = data.error 
                    ? `${data.message}: ${data.error}` 
                    : data.message || 'Có lỗi xảy ra khi đặt hàng';
                throw new Error(errorMsg);
            }

            // Thành công - xóa giỏ hàng và chuyển hướng
            clearCart();
            alert(`Đặt hàng thành công! Mã đơn hàng: ${data.order_code}`);
            router.push('/order-tracking');
        } catch (err) {
            console.error('Error submitting order:', err);
            setError(err.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hiển thị loading nếu giỏ hàng trống (đang redirect) - chỉ khi đã kiểm tra localStorage
    if (isCartLoaded && cartItems.length === 0) {
        // Kiểm tra lại localStorage để chắc chắn
        try {
            const storedCart = localStorage.getItem('banhtamcodao_cart');
            const parsedCart = storedCart ? JSON.parse(storedCart) : [];
            if (parsedCart.length === 0) {
                return (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <ShoppingCart className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-4">Giỏ hàng trống, đang chuyển hướng...</h2>
                    </div>
                );
            }
        } catch (error) {
            // Nếu có lỗi, vẫn hiển thị message
            return (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-4">Giỏ hàng trống, đang chuyển hướng...</h2>
                </div>
            );
        }
    }
    
    // Hiển thị loading khi đang chờ cart load - sử dụng component tập trung
    if (!isCartLoaded) {
        return <SkeletonCheckout />;
    }

    const TabButton = ({ isActive, onClick, children, icon: Icon }) => (
        <button 
            type="button" 
            onClick={onClick} 
            className={`group flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                isActive 
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-orange-50 text-primary shadow-md shadow-primary/10' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-gray-50'
            }`}
        >
            {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />}
            <span className="font-semibold">{children}</span>
        </button>
    );

    return (
        <div className="max-w-[1200px] mx-auto">
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-4 items-start">
            {/* Cột trái: Form thông tin */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header Thông tin khách hàng */}
                <div className="bg-gradient-to-r from-primary/10 to-orange-50 border-b border-gray-200 px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Thông tin khách hàng</h2>
                    </div>
                </div>
                {/* Thông tin người nhận */}
                <section className="px-4 py-6 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                Số điện thoại đặt hàng <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="tel" 
                                name="phone" 
                                id="phone" 
                                required 
                                className="block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white" 
                                placeholder="Nhập số điện thoại" 
                            />
                        </div>
                        <div>
                            <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <User className="w-4 h-4 text-gray-400" />
                                Tên người nhận <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                name="name" 
                                id="name" 
                                required 
                                className="block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white" 
                                placeholder="Nhập tên người nhận" 
                            />
                        </div>
                    </div>
                </section>

                {/* Thông tin giao hàng */}
                <section className="px-4 py-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Truck className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Thông tin giao hàng</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <TabButton 
                            isActive={deliveryMethod === 'delivery'} 
                            onClick={() => setDeliveryMethod('delivery')}
                            icon={Truck}
                        >
                            Giao hàng tận nơi
                        </TabButton>
                        <TabButton 
                            isActive={deliveryMethod === 'pickup'} 
                            onClick={() => setDeliveryMethod('pickup')}
                            icon={Store}
                        >
                            Khách tự đến quán lấy
                        </TabButton>
                    </div>
                    {deliveryMethod === 'delivery' && (
                        <div className="mb-6">
                            <label htmlFor="address" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                Địa chỉ nhận hàng (nếu giao hàng tận nơi) <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                name="address" 
                                id="address" 
                                required={deliveryMethod === 'delivery'} 
                                className="block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white" 
                                placeholder="Nhập địa chỉ chi tiết" 
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 relative">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Ngày nhận hàng <span className="text-red-500">*</span>
                                <button
                                    type="button"
                                    onClick={() => setShowDateTimeModal(true)}
                                    className="ml-auto p-1 rounded-full hover:bg-red-100 transition-colors relative z-10"
                                    title="Xem thông báo"
                                >
                                    <HelpCircle className="w-4 h-4 text-red-500 hover:text-red-600 pointer-events-none" />
                                </button>
                            </label>
                            <input 
                                type="date" 
                                name="date" 
                                id="date" 
                                value={date} 
                                onChange={e => setDate(e.target.value)} 
                                required 
                                className="block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white" 
                            />
                        </div>
                        <div>
                            <label htmlFor="time" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 relative">
                                <Clock className="w-4 h-4 text-gray-400" />
                                Thời gian nhận <span className="text-red-500">*</span>
                                <button
                                    type="button"
                                    onClick={() => setShowDateTimeModal(true)}
                                    className="ml-auto p-1 rounded-full hover:bg-red-100 transition-colors relative z-10"
                                    title="Xem thông báo"
                                >
                                    <HelpCircle className="w-4 h-4 text-red-500 hover:text-red-600 pointer-events-none" />
                                </button>
                            </label>
                            <input 
                                type="time" 
                                name="time" 
                                id="time" 
                                value={time} 
                                onChange={e => setTime(e.target.value)} 
                                required 
                                className="block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white" 
                            />
                        </div>
                    </div>
                </section>
                
                {/* Ghi chú */}
                <section className="px-4 py-6 border-b border-gray-200">
                    <label htmlFor="notes" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        Ghi chú đơn hàng
                    </label>
                    <textarea 
                        id="notes" 
                        name="notes" 
                        rows="4" 
                        className="block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white resize-none" 
                        placeholder="Nhập ghi chú cho đơn hàng hoặc ghi chú cho món ăn (tùy chọn)"
                    />
                </section>

                {/* Hình thức thanh toán */}
                <section className="px-4 py-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Hình thức thanh toán</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TabButton 
                            isActive={paymentMethod === 'cod'} 
                            onClick={() => setPaymentMethod('cod')}
                            icon={Banknote}
                        >
                            Khi nhận hàng
                        </TabButton>
                        <TabButton 
                            isActive={paymentMethod === 'transfer'} 
                            onClick={() => setPaymentMethod('transfer')}
                            icon={CreditCard}
                        >
                            Chuyển khoản
                        </TabButton>
                    </div>
                </section>
            </div>

            {/* Cột phải: Tóm tắt đơn hàng */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-orange-50 border-b border-gray-200 px-4 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <ShoppingCart className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>
                            </div>
                            <Link 
                                href="/menu" 
                                className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors inline-flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm món
                            </Link>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="px-4 py-6">
                        <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-primary/30 transition-colors">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                        <Image 
                                            src={item.image_url} 
                                            alt={item.name} 
                                            fill
                                            sizes="64px"
                                            className="object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">x {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-red-500 text-base flex-shrink-0">
                                        {formatCurrency((item.discount_price ?? item.price) * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="space-y-3 pb-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Tạm tính ({totalItems} {totalItems === 1 ? 'món' : 'món'})</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                            </div>
                            
                            {/* Dòng Giảm giá - chỉ hiển thị khi có voucher */}
                            {appliedVoucher && (
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-700 font-medium">Giảm giá:</span>
                                        <span className="text-gray-900 font-semibold">{appliedVoucher.code}</span>
                                        <button
                                            type="button"
                                            onClick={handleRemoveVoucher}
                                            className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors flex-shrink-0"
                                            aria-label="Xóa voucher"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                    <span className="font-semibold text-green-600">- {formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <span className="font-medium">Phí giao hàng</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {deliveryMethod === 'delivery' && isFreeShipping ? (
                                        <>
                                            <span className="font-semibold text-gray-400 line-through">{formatCurrency(baseShippingFee)}</span>
                                            <span className="font-bold text-green-600">MIỄN PHÍ</span>
                                        </>
                                    ) : deliveryMethod === 'delivery' ? (
                                        <span className="font-semibold text-gray-900">{formatCurrency(shippingFee)}</span>
                                    ) : (
                                        <span className="font-bold text-green-600">MIỄN PHÍ</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Promo Code - chỉ hiển thị khi chưa có voucher */}
                            {!appliedVoucher && (
                                <div className="pt-2">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={voucherInput}
                                            onChange={(e) => setVoucherInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleApplyVoucher()}
                                            placeholder="Nhập mã khuyến mãi" 
                                            className="flex-grow border border-black rounded-lg py-2.5 px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleApplyVoucher}
                                            disabled={isValidatingVoucher}
                                            className="bg-white text-black border border-black font-bold py-2.5 px-3 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                                        >
                                            {isValidatingVoucher ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                'Áp dụng'
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-red-600 text-xs mt-2">
                                        Mã giảm giá không áp dụng đồng thời chương trình khuyến mãi khác.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        <div className="pt-4 pb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-2xl font-bold text-gray-900">Tổng cộng</span>
                                <span className="text-2xl font-bold text-red-500">{formatCurrency(total)}</span>
                            </div>
                            
                            {/* Thông báo tiết kiệm - chỉ hiển thị khi có giảm giá */}
                            {appliedVoucher && discountAmount > 0 && (
                                <div className="flex items-center gap-2 text-green-600 text-base font-medium mb-4">
                                    <Tag className="w-4 h-4" />
                                    <span>Bạn đã tiết kiệm được {formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            
                            
                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-primary border-2 border-primary text-white font-bold py-4 rounded-xl text-lg hover:bg-white hover:text-primary hover:border-primary hover:border-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Tiến hành đặt hàng
                                    </>
                                )}
                            </button>
 
                        </div>
                    </div>
                </div>
            </div>
        </form>
        
        {/* Modal thông báo về ngày giờ nhận hàng */}
        {showDateTimeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDateTimeModal(false)}>
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-blue-100 flex-shrink-0">
                            <Info className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Thông báo</h3>
                            <p className="text-gray-700 mb-4">
                                Quý khách vui lòng chọn thời gian và ngày nhận hàng để quán chuẩn bị đơn hàng cho quý khách!
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowDateTimeModal(false)}
                                className="w-full bg-primary text-white border-2 border-primary font-bold py-2.5 px-4 rounded-lg hover:bg-white hover:text-primary hover:border-primary"
                            >
                                Đóng
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowDateTimeModal(false)}
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