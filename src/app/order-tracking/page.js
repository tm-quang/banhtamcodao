/**
 * Order tracking page component - REDESIGNED UI/UX
 * @file src/app/order-tracking/page.js
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    Search, Phone, Calendar, MapPin, User, FileText,
    CheckCircle2, Clock, Truck, XCircle, AlertCircle,
    ChevronDown, Package, Sparkles, UtensilsCrossed,
    ShoppingBag, CookingPot, FileWarning
} from 'lucide-react';
import { TextSkeleton } from '@/components/LoadingAnimations';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

/**
 * Order status timeline component with visual progress bar
 */
const OrderStatusTimeline = ({ currentStatus }) => {
    const statuses = [
        { key: 'Chờ xác nhận', icon: Clock, label: 'Chờ xác nhận' },
        { key: 'Đã xác nhận', icon: CheckCircle2, label: 'Đã xác nhận' },
        { key: 'Đang vận chuyển', icon: Truck, label: 'Đang giao' },
        { key: 'Hoàn thành', icon: Package, label: 'Hoàn thành' },
    ];

    const currentIndex = statuses.findIndex(s => s.key === currentStatus);
    const isCancelled = currentStatus === 'Đã hủy';

    if (isCancelled) {
        return (
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 rounded-xl border border-rose-200">
                <XCircle className="w-5 h-5 text-rose-500" />
                <span className="font-semibold text-rose-700">Đơn hàng đã bị hủy</span>
            </div>
        );
    }

    return (
        <div className="py-4 px-2 sm:px-4 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between">
                {statuses.map((status, index) => {
                    const Icon = status.icon;
                    const isCompleted = index < currentIndex; // Đã hoàn thành bước này
                    const isCurrent = index === currentIndex;  // Đang ở bước này
                    const isPending = index > currentIndex;    // Chưa đến bước này

                    return (
                        <div key={status.key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center gap-1.5">
                                <div
                                    className={`
                                        relative p-2 sm:p-2.5 rounded-full transition-all duration-300
                                        ${isCompleted ? 'bg-emerald-500 text-white shadow-lg' : ''}
                                        ${isCurrent ? 'bg-primary text-white shadow-xl ring-4 ring-primary/20 scale-110' : ''}
                                        ${isPending ? 'bg-gray-100 text-gray-400' : ''}
                                    `}
                                >
                                    {/* Hiện dấu check cho bước đã hoàn thành */}
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                    ) : (
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                    {/* Dấu hiệu đang xử lý cho bước hiện tại */}
                                    {isCurrent && (
                                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></span>
                                    )}
                                </div>
                                <span className={`text-[10px] sm:text-xs font-semibold text-center leading-tight
                                    ${isCompleted ? 'text-emerald-600' : ''}
                                    ${isCurrent ? 'text-primary' : ''}
                                    ${isPending ? 'text-gray-400' : ''}
                                `}>
                                    {status.label}
                                </span>
                            </div>
                            {/* Line nối giữa các bước */}
                            {index < statuses.length - 1 && (
                                <div className={`flex-1 h-1 mx-1 sm:mx-2 rounded-full transition-all duration-500 
                                    ${index < currentIndex ? 'bg-emerald-400' : 'bg-gray-200'}
                                `}></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Enhanced Order Card component
 */
const OrderCard = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const items = order.items_list.split('|||').map(itemStr => {
        try { return JSON.parse(itemStr); } catch { return null; }
    }).filter(Boolean);

    const getStatusConfig = (status) => {
        const configs = {
            'Chờ xác nhận': {
                icon: Clock,
                gradient: 'from-amber-400 to-orange-500',
                headerBg: 'bg-white',
                border: 'border-amber-200',
                text: 'text-amber-700',
                badge: 'bg-amber-100 text-amber-800 border border-amber-200',
                dot: 'bg-amber-500'
            },
            'Đã xác nhận': {
                icon: CheckCircle2,
                gradient: 'from-blue-400 to-cyan-500',
                headerBg: 'bg-white',
                border: 'border-blue-200',
                text: 'text-blue-700',
                badge: 'bg-blue-100 text-blue-800 border border-blue-200',
                dot: 'bg-blue-500'
            },
            'Đang vận chuyển': {
                icon: Truck,
                gradient: 'from-indigo-400 to-purple-500',
                headerBg: 'bg-white',
                border: 'border-indigo-200',
                text: 'text-indigo-700',
                badge: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
                dot: 'bg-indigo-500'
            },
            'Hoàn thành': {
                icon: CheckCircle2,
                gradient: 'from-emerald-400 to-green-500',
                headerBg: 'bg-white',
                border: 'border-emerald-200',
                text: 'text-emerald-700',
                badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
                dot: 'bg-emerald-500'
            },
            'Đã hủy': {
                icon: XCircle,
                gradient: 'from-rose-400 to-red-500',
                headerBg: 'bg-white',
                border: 'border-rose-200',
                text: 'text-rose-700',
                badge: 'bg-rose-100 text-rose-800 border border-rose-200',
                dot: 'bg-rose-500'
            }
        };
        return configs[status] || {
            icon: AlertCircle,
            gradient: 'from-slate-400 to-gray-500',
            headerBg: 'bg-white',
            border: 'border-slate-200',
            text: 'text-slate-700',
            badge: 'bg-slate-100 text-slate-800 border border-slate-200',
            dot: 'bg-slate-500'
        };
    };

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className={`group relative overflow-hidden rounded-2xl border-2 ${statusConfig.border} bg-white shadow-lg hover:shadow-xl transition-shadow`}>
            {/* Decorative gradient line at top */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${statusConfig.gradient}`}></div>

            {/* Header - Always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left"
            >
                <div className={`${statusConfig.headerBg} p-4 sm:p-5 pt-5 sm:pt-6`}>
                    {/* Mobile Layout */}
                    <div className="flex flex-col sm:hidden gap-3">
                        {/* Row 1: Icon + Order code + Chevron */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                                    <Image src="/images/banner-logo/banhtamcodao-logo.png" alt="Logo" fill className="object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-lg text-gray-900 truncate">
                                        {order.order_code}
                                    </p>
                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${statusConfig.badge} font-semibold text-xs`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                                        {order.status || 'Đang xử lý'}
                                    </div>
                                </div>
                            </div>
                            <div className={`p-2 rounded-xl bg-gray-100 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-primary/10' : ''}`}>
                                <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-primary' : 'text-gray-600'}`} />
                            </div>
                        </div>

                        {/* Row 2: Date + Items count */}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{format(new Date(order.order_time), 'HH:mm, dd/MM/yyyy', { locale: vi })}</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1.5">
                                <UtensilsCrossed className="w-3.5 h-3.5" />
                                <span>{items.length} món</span>
                            </div>
                        </div>

                        {/* Row 3: Total */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Tổng thanh toán</span>
                            <p className="text-xl font-bold text-primary">
                                {formatCurrency(order.total_amount)}
                            </p>
                        </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative w-12 h-12 overflow-hidden flex-shrink-0">
                                <Image src="/images/banner-logo/banhtamcodao-logo.png" alt="Logo" fill className="object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <p className="font-bold text-xl text-gray-900">
                                        {order.order_code}
                                    </p>
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.badge} font-semibold text-xs`}>
                                        <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                                        {order.status || 'Đang xử lý'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        <span>{format(new Date(order.order_time), 'HH:mm, dd/MM/yyyy', { locale: vi })}</span>
                                    </div>
                                    <span className="text-gray-300">•</span>
                                    <div className="flex items-center gap-1.5">
                                        <UtensilsCrossed className="w-4 h-4" />
                                        <span>{items.length} món</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                    {formatCurrency(order.total_amount)}
                                </p>
                                <p className="text-xs text-gray-500">Tổng thanh toán</p>
                            </div>
                            <div className={`p-2 rounded-xl bg-gray-100 transition-all duration-300 ${isExpanded ? 'rotate-180 bg-primary/10' : ''}`}>
                                <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-primary' : 'text-gray-600'}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="animate-expandDown border-t border-gray-100">
                    <div className="p-4 sm:p-5 space-y-4 bg-gray-50/50">
                        {/* Status Timeline with visual colors */}
                        <OrderStatusTimeline currentStatus={order.status} />

                        {/* Recipient & Address Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Người nhận</p>
                                    <p className="font-semibold text-gray-900">{order.recipient_name}</p>
                                    {order.recipient_phone && (
                                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                            <Phone className="w-3.5 h-3.5" />
                                            {order.recipient_phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Địa chỉ giao hàng</p>
                                    <p className="font-semibold text-gray-900">{order.delivery_address || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items - Simple Table Format */}
                        <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                                <ShoppingBag className="w-4 h-4 text-primary" />
                                <p className="font-semibold text-gray-900">Chi tiết đơn hàng</p>
                                <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border">{items.length} món</span>
                            </div>

                            {/* Table Header */}
                            <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                                <div className="col-span-5">Tên món</div>
                                <div className="col-span-2 text-right">Đơn giá</div>
                                <div className="col-span-2 text-center">SL</div>
                                <div className="col-span-3 text-right">Thành tiền</div>
                            </div>

                            {/* Items List */}
                            <div className="divide-y divide-gray-50">
                                {items.map((item, index) => (
                                    <div key={index} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                                        {/* Mobile */}
                                        <div className="sm:hidden space-y-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="font-semibold text-primary">{formatCurrency(item.price * item.qty)}</p>
                                            </div>
                                            <div className="flex gap-3 text-sm text-gray-500">
                                                <span>{formatCurrency(item.price)} x {item.qty}</span>
                                            </div>
                                        </div>
                                        {/* Desktop */}
                                        <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-5">
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                            </div>
                                            <div className="col-span-2 text-right text-gray-600">
                                                {formatCurrency(item.price)}
                                            </div>
                                            <div className="col-span-2 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                                                    {item.qty}
                                                </span>
                                            </div>
                                            <div className="col-span-3 text-right font-semibold text-primary">
                                                {formatCurrency(item.price * item.qty)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Total */}
                            <div className="px-4 py-3 border-t-2 border-dashed border-gray-200 bg-gray-50/50">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-700">Tổng cộng:</span>
                                    <span className="text-xl font-bold text-primary">{formatCurrency(order.total_amount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes if any */}
                        {order.customer_note && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                                <FileWarning className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-amber-700 mb-0.5">Ghi chú</p>
                                    <p className="text-sm text-amber-800">{order.customer_note}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Empty state component
 */
const EmptyState = ({ searched, error }) => {
    if (error) {
        return (
            <div className="text-center bg-white rounded-2xl shadow-lg border border-rose-100 p-8 sm:p-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 mb-4">
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                    {error}
                </p>
                <p className="text-sm text-gray-500">
                    Bạn cần hỗ trợ? Hãy liên hệ hotline: <span className="font-semibold text-primary">0933 960 788</span>
                </p>
            </div>
        );
    }

    if (!searched) {
        return (
            <div className="text-center py-8 sm:py-12">
                <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                        <CookingPot className="w-12 h-12 sm:w-16 sm:h-16 text-primary/60" />
                    </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                    Nhập số điện thoại để tra cứu
                </h3>
                <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                    Hệ thống sẽ tìm kiếm tất cả đơn hàng được đặt với số điện thoại của bạn
                </p>
            </div>
        );
    }

    return (
        <div className="text-center bg-white rounded-2xl shadow-lg border border-dashed border-gray-200 p-8 sm:p-12">
            <div className="relative inline-block mb-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="w-12 h-12 sm:w-14 sm:h-14 text-gray-300" />
                </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Không tìm thấy đơn hàng</h2>
            <p className="text-gray-600 max-w-md mx-auto">
                Số điện thoại bạn nhập không khớp với bất kỳ đơn hàng nào trong hệ thống.
                Vui lòng kiểm tra lại hoặc liên hệ với chúng tôi.
            </p>
        </div>
    );
};

export default function OrderTrackingPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!phoneNumber.trim()) {
            setError('Vui lòng nhập số điện thoại');
            return;
        }

        setLoading(true);
        setSearched(true);
        setOrders([]);
        setError('');

        try {
            const res = await fetch('/api/orders/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders || []);
                if (!data.orders || data.orders.length === 0) {
                    setError('Không tìm thấy đơn hàng nào với số điện thoại này');
                }
            } else {
                setError(data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
            }
        } catch (error) {
            setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section - Clean without emojis */}
            <div className="relative overflow-hidden pt-20 sm:pt-24 pb-12 sm:pb-16">
                {/* Gradient orbs only, no emojis */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-20 right-1/4 w-48 h-48 bg-orange-200/10 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-[1200px] mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        {/* Logo */}
                        <div className="relative inline-block mb-2 sm:mb-2">
                            <div className="relative w-24 h-24 sm:w-48 sm:h-48">
                                <Image
                                    src="/images/banner-logo/banhtamcodao-logo.png"
                                    alt="Bánh Tằm Cô Đào Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-lobster mb-2 sm:mb-2 text-gray-900">
                            Tra Cứu Đơn Hàng
                        </h1>
                        <p className="text-base sm:text-lg md:text-lg text-gray-500 max-w-2xl mx-auto">
                            Nhập số điện thoại để xem lịch sử và trạng thái đơn hàng của bạn
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="max-w-[1200px] mx-auto px-4 -mt-6 relative z-20">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSearch}>
                        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-3xl bg-primary/10">
                                        <Phone className="w-4 h-4 text-primary" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            setPhoneNumber(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Nhập số điện thoại hoặc mã đơn hàng..."
                                        required
                                        className="w-full pl-14 pr-4 py-4 text-base border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-primary transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-primary to-orange-500 text-white font-bold px-8 py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Đang tìm...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-5 h-5" />
                                            <span>Tìm kiếm</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {error && !loading && searched && orders.length === 0 && (
                                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                                    <p className="text-sm text-rose-700">{error}</p>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-[1200px] mx-auto px-4 py-8 sm:py-12">
                <div className="max-w-3xl mx-auto">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            </div>
                            <p className="text-gray-500 font-medium">Đang tìm kiếm đơn hàng...</p>
                        </div>
                    )}

                    {!loading && searched && orders.length > 0 && (
                        <div className="space-y-4">
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-3">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-semibold">Tìm thấy {orders.length} đơn hàng</span>
                                </div>
                                <p className="text-gray-500 text-sm">Bấm vào đơn hàng để xem chi tiết</p>
                            </div>
                            {orders.map(order => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    )}

                    {!loading && orders.length === 0 && (
                        <EmptyState searched={searched} error={searched && orders.length === 0 ? error : null} />
                    )}
                </div>
            </div>
        </div>
    );
}
