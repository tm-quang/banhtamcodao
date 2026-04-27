// src/components/CheckoutClient.js
'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Truck, Store, Banknote, CreditCard, User, Phone, MapPin, Calendar, Clock, FileText, ShoppingCart, ArrowRight, CheckCircle2, Plus, X, Tag, Info, HelpCircle, Shield, Zap, Gift, LocateFixed, AlertCircle } from 'lucide-react';
import { SkeletonCheckout } from '@/components/Skeleton';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

// Helper để lấy thời gian hiện tại theo múi giờ Hồ Chí Minh (GMT+7)
const getHCMNow = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
};

// Helper để format date thành YYYY-MM-DD
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper để format time thành HH:mm
const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

const TabButton = ({ isActive, onClick, children, icon: Icon }) => (
    <button
        type="button"
        onClick={onClick}
        className={`group flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 transition-all duration-300 ${isActive
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
                className="block w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
        )}
    </div>
);

export default function CheckoutClient() {
    const { cartItems, clearCartSilent } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const [deliveryMethod, setDeliveryMethod] = useState('delivery');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isCartLoaded, setIsCartLoaded] = useState(false);
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherInput, setVoucherInput] = useState('');
    const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
    const [showDateTimeModal, setShowDateTimeModal] = useState(false);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [orderResult, setOrderResult] = useState(null); // { success: true/false, orderCode, total, paymentMethod }
    const [isLocating, setIsLocating] = useState(false);
    const [mapLink, setMapLink] = useState('');
    const [showLocationRationale, setShowLocationRationale] = useState(false);
    const [showLocationError, setShowLocationError] = useState(false);
    const [locationErrorMsg, setLocationErrorMsg] = useState('');
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);
    const hasAutoFilledRef = useRef(false);

    useEffect(() => {
        // Mặc định thời gian nhận tại quán là +30 phút
        const hcmNow = getHCMNow();
        const minDateTime = new Date(hcmNow.getTime() + 30 * 60000);
        
        setDate(formatDate(minDateTime));
        setTime(formatTime(minDateTime));
    }, []);

    // Tự động điền thông tin khách hàng khi đã đăng nhập (chỉ chạy một lần)
    useEffect(() => {
        if (user && !hasAutoFilledRef.current) {
            // Chỉ điền nếu field chưa có giá trị
            if (user.phone_number) {
                setPhone(prev => prev || user.phone_number);
            }
            if (user.full_name) {
                setName(prev => prev || user.full_name);
            }
            if (user.shipping_address) {
                setAddress(prev => prev || user.shipping_address);
            }
            hasAutoFilledRef.current = true;
        }
    }, [user]);

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
        // Bỏ qua sản phẩm tặng (is_free = true)
        if (item.is_free) return total;
        const price = item.discount_price ?? item.price ?? item.finalPrice ?? 0;
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

    const startLocating = () => {
        setShowLocationRationale(false);
        setIsLocating(true);
        setIsRequestingPermission(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setIsRequestingPermission(false);
                const { latitude, longitude } = position.coords;
                const gmapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

                try {
                    // Reverse geocoding using Nominatim (OSM)
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=vi`);
                    const data = await res.json();

                    if (data && data.display_name) {
                        setAddress(data.display_name);
                        setMapLink(gmapsLink);
                    } else {
                        setAddress(`${latitude}, ${longitude}`);
                        setMapLink(gmapsLink);
                    }
                } catch (error) {
                    console.error('Lỗi lấy địa chỉ:', error);
                    setAddress(`${latitude}, ${longitude}`);
                    setMapLink(gmapsLink);
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                setIsRequestingPermission(false);
                console.error('Geolocation error:', { code: error.code, message: error.message });
                let msg = 'Không thể lấy vị trí của bạn vào lúc này.';
                if (error.code === 1) {
                    msg = 'Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt để lấy vị trí giao hàng.';
                } else if (error.code === 2) {
                    msg = 'Vị trí không khả dụng (Position Unavailable). Vui lòng kiểm tra GPS hoặc kết nối mạng.';
                } else if (error.code === 3) {
                    msg = 'Hết thời gian chờ lấy vị trí (Timeout). Vui lòng thử lại.';
                }
                setLocationErrorMsg(msg);
                setShowLocationError(true);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleGetCurrentLocation = async () => {
        if (!navigator.geolocation) {
            setLocationErrorMsg('Trình duyệt của bạn không hỗ trợ định vị');
            setShowLocationError(true);
            return;
        }

        // Kiểm tra Secure Context (Bắt buộc cho Geolocation)
        const isSecure = window.location.protocol === 'https:' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        if (!isSecure) {
            setLocationErrorMsg('Lỗi bảo mật: Trình duyệt chỉ cho phép lấy vị trí. Vui lòng kiểm tra lại hoặc đổi trình duyệt khác.');
            setShowLocationError(true);
            return;
        }

        try {
            const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
            if (permissionStatus.state === 'granted') {
                startLocating();
                return;
            } else if (permissionStatus.state === 'denied') {
                setLocationErrorMsg('Quyền truy cập vị trí của trang web này đang bị chặn. Vui lòng nhấn vào biểu tượng ổ khóa (hoặc biểu tượng cài đặt) bên cạnh địa chỉ trang web -> chọn "Cài đặt trang web" -> tìm mục "Vị trí" và đổi thành "Cho phép". Sau đó tải lại trang.');
                setShowLocationError(true);
                return;
            }
        } catch (e) {
            // Permissions API might not be supported
        }

        setShowLocationRationale(true);
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

        // Check phone
        if (!phone?.trim()) {
            focusAndScroll('phone', 'Vui lòng nhập số điện thoại');
            return;
        }

        // Check name
        if (!name?.trim()) {
            focusAndScroll('name', 'Vui lòng nhập tên người nhận');
            return;
        }

        // Check address (only if delivery method is 'delivery')
        if (deliveryMethod === 'delivery' && !address?.trim()) {
            focusAndScroll('address', 'Vui lòng nhập địa chỉ nhận hàng');
            return;
        }

        // Check date (chỉ cho Nhận tại quán)
        if (deliveryMethod === 'pickup' && !date) {
            focusAndScroll('date', 'Vui lòng chọn ngày nhận hàng');
            return;
        }

        // Check time (chỉ cho Nhận tại quán)
        if (deliveryMethod === 'pickup' && !time) {
            focusAndScroll('time', 'Vui lòng chọn thời gian nhận hàng');
            return;
        }

        // Validate thời gian Nhận tại quán phải lớn hơn hiện tại 30 phút
        if (deliveryMethod === 'pickup' && date && time) {
            const hcmNow = getHCMNow();
            const [y, m, d] = date.split('-').map(Number);
            const [hh, mm] = time.split(':').map(Number);
            const selectedDateTime = new Date(y, m - 1, d, hh, mm);
            
            const diffInMinutes = (selectedDateTime.getTime() - hcmNow.getTime()) / 60000;
            if (diffInMinutes < 29) {
                focusAndScroll('time', 'Thời gian nhận tại quán phải lớn hơn hiện tại ít nhất 30 phút');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            // Validate cart items before placing order
            const validationResponse = await fetch('/api/cart/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items_list: cartItems })
            });
            const validationData = await validationResponse.json();

            if (!validationData.success) {
                setError(validationData.message);
                setIsSubmitting(false);
                return;
            }

            const formData = new FormData(e.target);
            const phone_number = phone.trim();
            const recipient_name = name.trim();
            // Đính kèm link bản đồ nếu có
            const finalAddress = mapLink ? `${address.trim()} (📍 Bản đồ: ${mapLink})` : address.trim();
            const delivery_address = deliveryMethod === 'delivery' ? finalAddress : '';
            const customer_note = formData.get('notes') || '';

            const items_list = cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.is_free ? 0 : (item.discount_price ?? item.price ?? item.finalPrice ?? 0),
                qty: item.quantity,
                is_free: item.is_free || false
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
                    delivery_date: deliveryMethod === 'pickup' ? date : null,
                    delivery_time: deliveryMethod === 'pickup' ? time : null
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorMsg = data.details || data.message || data.error || 'Lỗi không xác định khi tạo đơn hàng';
                throw new Error(errorMsg);
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
                <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)]">
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
                                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
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
                                        <p>Chủ TK: <span className="font-semibold">TRAN MINH QUANG</span></p>
                                        <p>Số tiền: <span className="font-bold text-primary">{formatCurrency(orderResult.total)}</span></p>
                                        <p>Nội dung: <span className="font-semibold">{orderResult.orderCode}</span></p>
                                    </div>
                                </div>
                            )}

                            {/* COD Message */}
                            {orderResult.paymentMethod === 'cod' && (
                                <div className="mb-6 p-4 bg-amber-50 rounded-xl">
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
                                    className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                    Xem chi tiết đơn hàng
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push('/')}
                                    className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
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
                                    className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors"
                                >
                                    Thử lại
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push('/')}
                                    className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
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

    return (
        <div className="max-w-[1200px] mx-auto">
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
                {/* Left Column: Form */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Customer Info Section */}
                    <section className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-300">
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
                                <InputField label="Số điện thoại đặt hàng" icon={Phone} required id="phone" type="tel" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nhập số điện thoại" />
                                <InputField label="Tên người nhận" icon={User} required id="name" type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên người nhận" />
                            </div>
                        </div>
                    </section>

                    {/* Delivery Info Section */}
                    <section className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-300">
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
                                    Nhận tại quán
                                </TabButton>
                            </div>

                            {deliveryMethod === 'delivery' && (
                                <div className="space-y-3">
                                    <InputField
                                        label="Địa chỉ nhận hàng"
                                        icon={MapPin}
                                        required
                                        id="address"
                                        type="text"
                                        name="address"
                                        value={address}
                                        onChange={(e) => {
                                            setAddress(e.target.value);
                                            setMapLink(''); // Xóa link map nếu user tự sửa địa chỉ
                                        }}
                                        placeholder="Nhập địa chỉ chi tiết"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGetCurrentLocation}
                                        disabled={isLocating}
                                        className="flex items-center gap-2 text-slate-600 font-semibold text-sm hover:text-slate-600 transition-colors group"
                                    >
                                        <div className={`p-1.5 rounded-full bg-slate-200 transition-colors ${isLocating ? 'animate-pulse' : ''}`}>
                                            <MapPin size={16} />
                                        </div>
                                        {isRequestingPermission
                                            ? <span className="text-blue-600 animate-bounce">Vui lòng chọn "Cho phép" ở phía trên trình duyệt...</span>
                                            : isLocating ? 'Đang xác định vị trí của bạn...' : 'Lấy vị trí giao hàng'}
                                    </button>
                                </div>
                            )}

                            {deliveryMethod === 'pickup' && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            Ngày nhận hàng
                                            <button type="button" onClick={() => setShowDateTimeModal(true)} className="ml-auto p-1 rounded-full hover:bg-gray-100 transition-colors">
                                                <HelpCircle className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </label>
                                        <input 
                                            type="date" 
                                            id="date" 
                                            value={date} 
                                            min={formatDate(getHCMNow())}
                                            onChange={e => setDate(e.target.value)} 
                                            required={deliveryMethod === 'pickup'}
                                            className="block w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            Thời gian nhận
                                            <button type="button" onClick={() => setShowDateTimeModal(true)} className="ml-auto p-1 rounded-full hover:bg-gray-100 transition-colors">
                                                <HelpCircle className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </label>
                                        <input 
                                            type="time" 
                                            id="time" 
                                            value={time} 
                                            onChange={e => setTime(e.target.value)} 
                                            required={deliveryMethod === 'pickup'}
                                            className="block w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white" 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Notes Section */}
                    <section className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-300">
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
                                className="block w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white resize-none"
                                placeholder="Nhập ghi chú cho đơn hàng (tùy chọn)"
                            />
                        </div>
                    </section>

                    {/* Payment Method Section */}
                    <section className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-300">
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
                                    Thanh toán khi nhận hàng
                                </TabButton>
                                <TabButton isActive={paymentMethod === 'transfer'} onClick={() => setPaymentMethod('transfer')} icon={CreditCard}>
                                    Chuyển khoản ngân hàng
                                </TabButton>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-md sticky top-24 overflow-hidden border border-gray-300">
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
                            <div className="space-y-1 mb-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                                {cartItems.map(item => {
                                    const unitPrice = item.is_free ? 0 : (item.discount_price ?? item.price);
                                    const itemTotal = unitPrice * item.quantity;
                                    return (
                                        <div key={`${item.id}-${item.is_free ? 'free' : 'paid'}-${item.combo_promotion_id || ''}`} className="flex items-center justify-between py-1 border-b border-gray-200 last:border-0">
                                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                                {/* Ảnh món nhỏ gọn */}
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                                    <Image src={item.image_url} alt={item.name} fill sizes="44px" className="object-cover" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-gray-800 text-[15px] line-clamp-1">{item.name}</p>
                                                        {item.is_free && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 px-1.5 py-0.5 rounded-full">
                                                                <Gift size={10} />
                                                                Tặng kèm
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center text-[13px] text-gray-400 gap-1 leading-none">
                                                        <span className="font-medium">{formatCurrency(unitPrice)}</span>
                                                        <span className="text-gray-300">x</span>
                                                        <span className="font-bold text-slate-500">{item.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <p className={`font-bold text-[15px] ${item.is_free ? 'text-emerald-600' : 'text-gray-800'}`}>
                                                    {formatCurrency(itemTotal)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
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
                                            <span className="font-semibold text-emerald-600">Miễn phí giao hàng</span>
                                        </div>
                                    ) : deliveryMethod === 'delivery' ? (
                                        <span className="font-semibold text-gray-900">{formatCurrency(shippingFee)}</span>
                                    ) : (
                                        <span className="font-semibold text-emerald-600">Miễn phí giao hàng</span>
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
                                                className="bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-800 transition-colors text-sm disabled:opacity-50 min-w-[100px] flex items-center justify-center"
                                            >
                                                {isValidatingVoucher ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    'Áp dụng'
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            * Mã giảm giá không áp dụng đồng thời với KM khác.
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
                                    className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isSubmitting ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                                            Thanh toán linh hoạt
                                        </span>
                                        <span className="text-gray-300">|</span>
                                        <span className="flex items-center gap-1.5">
                                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                                            Giao nhanh tận nơi
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
                    <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                <Info className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Thời gian nhận tại quán</h3>
                            <p className="text-gray-600 mb-6">
                                Quý khách vui lòng chọn ngày và giờ muốn đến nhận hàng. <br/>
                                <span className="font-semibold text-primary">Lưu ý:</span> Thời gian nhận phải sau thời điểm hiện tại ít nhất <span className="font-bold">30 phút</span> để quán kịp chuẩn bị món.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowDateTimeModal(false)}
                                className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors"
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
                    <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
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
                                className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors"
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
                    <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]">
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
                                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm font-semibold text-gray-700 mb-3">Quét mã QR để thanh toán</p>
                                        <div className="bg-white p-3 rounded-xl inline-block shadow-sm border border-gray-100">
                                            <img
                                                src={`https://img.vietqr.io/image/970415-107870460026-compact.png?amount=${orderResult.total}&addInfo=${orderResult.orderCode}`}
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
                                    <div className="mb-6 p-4 bg-amber-50 rounded-xl">
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
                                        className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                        Xem chi tiết đơn hàng
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/menu')}
                                        className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
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
                                        className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors"
                                    >
                                        Thử lại
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/menu')}
                                        className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Quay lại menu
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Location Rationale Modal */}
            {showLocationRationale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowLocationRationale(false)}>
                    <div className="relative bg-white rounded-3xl max-w-sm w-full p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6 rotate-3">
                                <MapPin className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight">Xác định vị trí</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                Chúng tôi cần truy cập vị trí để tự động điền địa chỉ giao hàng và tính toán phí ship chính xác nhất cho bạn.
                            </p>
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={startLocating}
                                    className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200 uppercase text-xs tracking-widest"
                                >
                                    Đồng ý
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowLocationRationale(false)}
                                    className="w-full bg-gray-300 text-gray-700 font-black py-3 rounded-2xl hover:text-gray-600 transition-all uppercase text-[10px] tracking-widest"
                                >
                                    Để sau
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Location Error Modal */}
            {showLocationError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowLocationError(false)}>
                    <div className="relative bg-white rounded-3xl max-w-sm w-full p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-6 -rotate-3">
                                <AlertCircle className="w-10 h-10 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight text-rose-600">Opps! Có lỗi</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
                                {locationErrorMsg}
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowLocationError(false)}
                                className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200 uppercase text-xs tracking-widest"
                            >
                                Đã hiểu
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowLocationError(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-gray-300 hover:bg-gray-100 hover:text-gray-500 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}