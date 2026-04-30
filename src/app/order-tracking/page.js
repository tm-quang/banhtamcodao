/**
 * Order tracking page component - REDESIGNED UI/UX
 * @file src/app/order-tracking/page.js
 */
'use client';

import { useState, useEffect, Fragment } from 'react';
import Image from 'next/image';
import {
    Search, Phone, Calendar, MapPin, User, FileText,
    CheckCircle2, Clock, Truck, XCircle, AlertCircle,
    ChevronDown, Package, Sparkles, UtensilsCrossed,
    ShoppingBag, CookingPot, FileWarning, RotateCcw, Tag, ShoppingCart
} from 'lucide-react';
import { TextSkeleton } from '@/components/LoadingAnimations';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

/**
 * Format date to HCMC Timezone (GMT+7)
 */
const formatHCMCDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const options = {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(date);
        const p = (type) => parts.find(it => it.type === type).value;
        return `${p('day')}/${p('month')}/${p('year')} ${p('hour')}:${p('minute')}`;
    } catch (e) {
        return dateStr;
    }
};

/**
 * Format raw date string (YYYY-MM-DD) to DD/MM/YYYY
 */
const formatDateOnly = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
        const [y, m, d] = dateStr.split('-');
        if (y.length === 4) return `${d}/${m}/${y}`;
    }
    return dateStr;
};

/**
 * Format raw time string (HH:mm:ss) to HH:mm
 */
const formatTimeOnly = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes(':')) {
        const parts = timeStr.split(':');
        if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
};

/**
 * Order status timeline component - redesigned with centered icons and simple colors
 */
const OrderStatusTimeline = ({ currentStatus }) => {
    const statuses = [
        { key: 'Chờ xác nhận', icon: Clock, label: 'Chờ xác nhận', activeColor: 'bg-amber-500' },
        { key: 'Đã xác nhận', icon: CheckCircle2, label: 'Đã xác nhận', activeColor: 'bg-blue-600' },
        { key: 'Đang vận chuyển', icon: Truck, label: 'Đang vận chuyển', activeColor: 'bg-cyan-600' },
        { key: 'Hoàn thành', icon: Package, label: 'Hoàn thành', activeColor: 'bg-green-600' },
    ];

    const currentIndex = statuses.findIndex(s => s.key === currentStatus);
    const isCancelled = currentStatus === 'Đã hủy';

    if (isCancelled) {
        return (
            <div className="flex items-center justify-center gap-2 py-3 px-4">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-sm">
                    <XCircle className="w-6 h-6 text-white" />
                </div>
                <span className="font-black text-red-600 uppercase tracking-widest text-xs">Đã hủy đơn</span>
            </div>
        );
    }

    return (
        <div className="py-6 px-4 bg-white rounded-3xl border border-gray-300 shadow-md">
            <div className="relative flex items-center w-full">
                {/* Background line - chạy qua tất cả các icon (màu xám) */}
                <div
                    className="absolute h-0.5 bg-gray-300 left-0 right-0 z-0"
                    style={{
                        top: '24px',
                        left: '24px',
                        right: '24px'
                    }}
                ></div>

                {/* Progress line - chỉ hiển thị từ đầu đến bước hiện tại (màu xanh lá) */}
                {/* Nếu đã hoàn thành, line kéo dài toàn bộ, nếu chưa thì chỉ đến bước hiện tại */}
                {currentIndex >= 0 && (
                    <div
                        className="absolute h-0.5 bg-green-500 z-0 transition-all duration-500"
                        style={{
                            top: '24px',
                            left: '24px',
                            width: currentIndex === statuses.length - 1
                                ? `calc(100% - 48px)` // Đã hoàn thành: line kéo dài toàn bộ
                                : `calc(${currentIndex * (100 / (statuses.length - 1))}% - ${currentIndex * (48 / (statuses.length - 1))}px)` // Chưa hoàn thành: chỉ đến bước hiện tại
                        }}
                    ></div>
                )}

                {statuses.map((status, index) => {
                    const Icon = status.icon;
                    // Nếu đã đến bước cuối cùng (Hoàn thành), tất cả đều là completed
                    const isAllCompleted = currentIndex === statuses.length - 1;
                    const isCompleted = isAllCompleted ? true : index < currentIndex;
                    const isCurrent = !isAllCompleted && index === currentIndex;
                    const isPending = !isAllCompleted && index > currentIndex;

                    return (
                        <div key={status.key} className="flex items-center flex-1 relative z-10">
                            {/* Icon và Label container */}
                            <div className="flex flex-col items-center gap-2 w-full">
                                {/* Icon container - đảm bảo cùng kích thước cho tất cả */}
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                    <div
                                        className={`
                                            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative z-10
                                            ${isCompleted ? 'bg-green-600 text-white shadow-md' : ''}
                                            ${isCurrent ? `${status.activeColor} text-white shadow-md` : ''}
                                            ${isPending ? 'bg-gray-100 text-gray-400' : ''}
                                        `}
                                        style={isCurrent ? { transform: 'scale(1.1)' } : {}}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-8 h-8" />
                                        ) : (
                                            <Icon className="w-8 h-8" />
                                        )}
                                    </div>
                                </div>
                                {/* Label */}
                                <span className={`text-xs font-medium text-center leading-tight whitespace-nowrap transition-colors duration-300
                                    ${isCompleted ? 'text-green-600' : ''}
                                    ${isCurrent ? 'text-primary' : ''}
                                    ${isPending ? 'text-gray-400' : ''}
                                `}>
                                    {status.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Helper function to mask sensitive text (show only first N characters)
 */
const maskText = (text, visibleCount = 4) => {
    if (!text) return '';
    const str = String(text);
    if (str.length <= visibleCount) return str;
    return str.substring(0, visibleCount) + '*'.repeat(str.length - visibleCount);
};

/**
 * Helper function to truncate address
 */
const truncateAddress = (address, maxLength = 50) => {
    if (!address) return 'Chưa cập nhật';
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
};

/**
 * Enhanced Order Card component
 */
const OrderCard = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const items = order.items_list.split('|||').map(itemStr => {
        try { return JSON.parse(itemStr); } catch { return null; }
    }).filter(Boolean);

    // Calculate discount/voucher amount
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = subtotal - (order.total_amount || 0);
    const hasVoucher = discountAmount > 0 || order.voucher_code;

    const getStatusConfig = (status) => {
        const configs = {
            'Chờ xác nhận': {
                icon: Clock,
                color: 'bg-amber-500',
                headerBg: 'bg-white',
                border: 'border-amber-200',
                text: 'text-amber-700',
                badge: 'bg-amber-500 text-white border-none',
                dot: 'bg-amber-400'
            },
            'Đã xác nhận': {
                icon: CheckCircle2,
                color: 'bg-blue-600',
                headerBg: 'bg-white',
                border: 'border-blue-200',
                text: 'text-blue-700',
                badge: 'bg-blue-600 text-white border-none',
                dot: 'bg-blue-400'
            },
            'Đang vận chuyển': {
                icon: Truck,
                color: 'bg-cyan-600',
                headerBg: 'bg-white',
                border: 'border-cyan-200',
                text: 'text-cyan-700',
                badge: 'bg-cyan-600 text-white border-none',
                dot: 'bg-cyan-400'
            },
            'Hoàn thành': {
                icon: CheckCircle2,
                color: 'bg-green-600',
                headerBg: 'bg-white',
                border: 'border-green-200',
                text: 'text-green-700',
                badge: 'bg-green-600 text-white border-none',
                dot: 'bg-green-400'
            },
            'Đã hủy': {
                icon: XCircle,
                color: 'bg-red-600',
                headerBg: 'bg-white',
                border: 'border-red-200',
                text: 'text-red-700',
                badge: 'bg-red-600 text-white border-none',
                dot: 'bg-red-400',
                label: 'Đã hủy đơn'
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
        <div className={`group relative overflow-hidden rounded-3xl border ${statusConfig.border} bg-white shadow-md hover:shadow-md transition-shadow`}>
            {/* Decorative solid color line at top */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${statusConfig.color}`}></div>

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
                                <div className="relative w-14 h-14 overflow-hidden flex-shrink-0">
                                    <Image src="/images/banner-logo/banhtamcodao-logo.png" alt="Logo" fill className="object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                        <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Đơn hàng của bạn</p>
                                    </div>
                                    <p className="font-black text-lg text-primary truncate">
                                        #{order.order_code}
                                    </p>
                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${statusConfig.badge} font-bold text-[10px] uppercase tracking-wider`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                                        {statusConfig.label || order.status || 'Đang xử lý'}
                                    </div>
                                </div>
                            </div>
                            <div className={`p-2 rounded-full bg-gray-200 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-gray-500' : ''}`}>
                                <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                        </div>

                        {/* Row 2: Date + Items count */}
                        <div className="flex flex-col gap-1 text-[13px] text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Đặt lúc: {formatHCMCDateTime(order.order_time)}</span>
                            </div>
                            {(order.delivery_date || order.delivery_time) && (
                                <div className="flex items-center gap-1.5 text-primary font-medium">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Dự kiến giao lúc: {formatTimeOnly(order.delivery_time)} {order.delivery_date && `, ${formatDateOnly(order.delivery_date)}`}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Package className="w-3.5 h-3.5" />
                                <span>{items.length} món</span>
                            </div>
                        </div>

                        {/* Row 3: Total */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Tổng thanh toán</span>
                            <p className="text-xl font-bold text-red-600">
                                {formatCurrency(order.total_amount)}
                            </p>
                        </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative w-20 h-20 overflow-hidden flex-shrink-0">
                                <Image src="/images/banner-logo/banhtamcodao-logo.png" alt="Logo" fill className="object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Đơn hàng của bạn</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-black text-2xl text-primary">
                                            {order.order_code}
                                        </p>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.badge} font-bold text-[10px] uppercase tracking-widest`}>
                                            <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                                            {statusConfig.label || order.status || 'Đang xử lý'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-[13px] text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md">
                                            <ShoppingCart className="w-3.5 h-3.5 text-gray-400" />
                                            <span>Đặt lúc: {formatHCMCDateTime(order.order_time)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md">
                                            <Package className="w-3.5 h-3.5 text-gray-400" />
                                            <span>{items.length} món</span>
                                        </div>
                                    </div>
                                    {(order.delivery_date || order.delivery_time) && (
                                        <div className="flex items-center gap-1.5 text-primary font-semibold bg-primary/5 px-2 py-1 rounded-md w-fit mt-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Giao lúc: {order.delivery_time} {order.delivery_date && `, ${order.delivery_date}`}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                                <p className="text-2xl font-bold text-red-600">
                                    {formatCurrency(order.total_amount)}
                                </p>
                                <p className="text-xs text-gray-500">Tổng thanh toán</p>
                            </div>
                            <div className={`p-2 rounded-3xl bg-gray-200 transition-all duration-300 ${isExpanded ? 'rotate-180 bg-primary/10' : ''}`}>
                                <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-primary' : 'text-gray-600'}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="animate-expandDown border-t border-gray-100">
                    <div className="p-2 sm:p-5 space-y-2 bg-gray-50/50">
                        {/* Status Timeline with visual colors */}
                        <OrderStatusTimeline currentStatus={order.status} />

                        {/* Recipient Info - Redesigned to match items style */}
                        <div className="rounded-3xl bg-white shadow-md overflow-hidden border border-gray-300">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-200">
                                        <MapPin className="w-4 h-4 text-primary" />
                                    </div>
                                    <p className="font-bold text-gray-900">Thông tin nhận hàng</p>
                                </div>
                            </div>

                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" /> Người nhận
                                        </p>
                                        <p className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                                            {maskText(order.recipient_name)}
                                        </p>
                                    </div>
                                    {order.phone_number && (
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5" /> Số điện thoại
                                            </p>
                                            <p className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                                                {maskText(order.phone_number)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" /> Địa chỉ giao hàng
                                    </p>
                                    <div className="text-sm text-gray-600 bg-gray-50 px-3 py-3 rounded-xl border border-gray-100 min-h-[80px] leading-relaxed">
                                        {maskText(order.delivery_address)}
                                    </div>
                                </div>
                                {order.note && (
                                    <div className="col-span-1 sm:col-span-2 space-y-1">
                                        <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5" /> Ghi chú từ khách hàng
                                        </p>
                                        <div className="text-sm text-amber-800 bg-amber-50/50 px-3 py-2 rounded-xl border border-amber-100 italic">
                                            "{maskText(order.note)}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Items - Detailed Invoice Format */}
                        <div className="rounded-3xl bg-white shadow-md overflow-hidden border border-gray-300">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-200">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <p className="font-bold text-gray-900">Chi tiết sản phẩm</p>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-gray-200">{items.length} món</span>
                            </div>

                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] sm:text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 font-bold">Món ăn</th>
                                            <th className="px-2 py-3 font-bold text-center">SL</th>
                                            <th className="px-3 py-3 font-bold text-right">Đơn giá</th>
                                            <th className="px-4 py-3 font-bold text-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                                                    {item.note && <p className="text-[10px] text-gray-400 mt-0.5 italic">{item.note}</p>}
                                                </td>
                                                <td className="px-2 py-3 text-center font-medium text-gray-600">
                                                    {item.qty}
                                                </td>
                                                <td className="px-3 py-3 text-right text-gray-600 tabular-nums">
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-black text-gray-600 tabular-nums">
                                                    {formatCurrency(item.price * item.qty)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Discount/Voucher Line */}
                            {hasVoucher && (
                                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <Tag className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Đã áp dụng voucher</span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <span className="text-sm font-semibold text-emerald-600">-{formatCurrency(discountAmount)}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Order Total - Receipt Style */}
                            <div className="px-6 py-5 border-t border-dashed border-gray-300 bg-gray-50/30 relative">
                                {/* Zigzag bottom edge effect using CSS or simple border */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-gray-500 text-sm">
                                        <span>Tạm tính:</span>
                                        <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-900">
                                        <span className="font-bold text-lg">Tổng cộng:</span>
                                        <span className="text-2xl font-black text-red-600 tabular-nums">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Cảm ơn quý khách!</p>
                                </div>
                            </div>
                        </div>

                        {/* Reorder Button */}
                        <button
                            onClick={async () => {
                                setIsReordering(true);
                                try {
                                    // Fetch current product prices
                                    const productPromises = items.map(async (item) => {
                                        try {
                                            const res = await fetch(`/api/products?search=${encodeURIComponent(item.name)}`);
                                            const data = await res.json();
                                            if (data.success && data.products && data.products.length > 0) {
                                                const product = data.products[0];
                                                return {
                                                    ...product,
                                                    quantity: item.qty,
                                                    finalPrice: product.discount_price || product.price
                                                };
                                            }
                                            // Fallback: use old price if product not found
                                            return {
                                                id: item.id || Date.now(),
                                                name: item.name,
                                                price: item.price,
                                                discount_price: null,
                                                quantity: item.qty,
                                                finalPrice: item.price
                                            };
                                        } catch (error) {
                                            console.error('Error fetching product:', error);
                                            return {
                                                id: item.id || Date.now(),
                                                name: item.name,
                                                price: item.price,
                                                discount_price: null,
                                                quantity: item.qty,
                                                finalPrice: item.price
                                            };
                                        }
                                    });

                                    const products = await Promise.all(productPromises);

                                    // Add all items to cart
                                    products.forEach(product => {
                                        addToCart(product, product.quantity);
                                    });

                                    showToast('Đã thêm đơn hàng vào giỏ hàng', 'success');
                                } catch (error) {
                                    console.error('Error reordering:', error);
                                    showToast('Có lỗi xảy ra khi đặt lại đơn hàng', 'error');
                                } finally {
                                    setIsReordering(false);
                                }
                            }}
                            disabled={isReordering}
                            className="w-full flex items-center justify-center gap-2 shadow-md bg-primary text-white font-semibold py-3.5 px-4 rounded-3xl hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {isReordering ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                </>
                            ) : (
                                <>
                                    <RotateCcw className="w-5 h-5" />
                                    <span>Đặt lại đơn hàng</span>
                                </>
                            )}
                        </button>
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
            <div className="text-center bg-white rounded-3xl shadow-md p-8 sm:p-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-4 shadow-inner">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                    {error}
                </p>
                <p className="text-md text-gray-500">
                    Liên hệ hotline: <span className="font-semibold text-primary">0933 960 788</span>
                </p>
            </div>
        );
    }

    // if (!searched) {
    //     return (
    //         <div className="text-center py-8 sm:py-12">
    //             <div className="relative inline-block mb-6">
    //                 <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
    //                     <CookingPot className="w-12 h-12 sm:w-16 sm:h-16 text-primary/60" />
    //                 </div>
    //             </div>
    //             <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
    //                 Nhập số điện thoại để tra cứu
    //             </h3>
    //             <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
    //                 Hệ thống sẽ tìm kiếm tất cả đơn hàng được đặt với số điện thoại của bạn
    //             </p>
    //         </div>
    //     );
    // }

    // return (
    //     <div className="text-center bg-white rounded-3xl shadow-md p-8 sm:p-12">
    //         <div className="relative inline-block mb-6">
    //             <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 flex items-center justify-center">
    //                 <FileText className="w-12 h-12 sm:w-14 sm:h-14 text-gray-300" />
    //             </div>
    //         </div>
    //         <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Không tìm thấy đơn hàng</h2>
    //         <p className="text-gray-600 max-w-md mx-auto">
    //             Số điện thoại bạn nhập không khớp với bất kỳ đơn hàng nào trong hệ thống.
    //             Vui lòng kiểm tra lại hoặc liên hệ với chúng tôi.
    //         </p>
    //     </div>
    // );
};

export default function OrderTrackingPage() {
    const [searchInput, setSearchInput] = useState('');
    const [allOrders, setAllOrders] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchInput.trim()) {
            setError('Vui lòng nhập số điện thoại hoặc mã đơn hàng');
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
                body: JSON.stringify({ searchInput: searchInput.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                // Sort by order_time descending (newest first)
                let sortedOrders = (data.orders || []).sort((a, b) =>
                    new Date(b.order_time) - new Date(a.order_time)
                );

                // Privacy: If searching by phone (numeric and long), limit to top 5 newest orders
                const isPhoneSearch = /^\d+$/.test(searchInput.trim()) && searchInput.trim().length >= 8;
                if (isPhoneSearch && sortedOrders.length > 5) {
                    sortedOrders = sortedOrders.slice(0, 5);
                }

                setAllOrders(sortedOrders);
                setCurrentPage(1);
                if (sortedOrders.length === 0) {
                    setError('Không tìm thấy đơn hàng, vui lòng kiểm tra lại số điện thoại hoặc mã đơn hàng.');
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

    // Pagination logic
    const totalPages = Math.ceil(allOrders.length / ordersPerPage);

    // Update displayed orders when page or allOrders changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ordersPerPage;
        const endIndex = startIndex + ordersPerPage;
        const currentOrders = allOrders.slice(startIndex, endIndex);
        setOrders(currentOrders);
    }, [currentPage, allOrders, ordersPerPage]);

    return (
        <div className="min-h-screen">
            {/* Hero Section - Clean without emojis */}
            <div className="relative overflow-hidden pt-28 md:pt-36 pb-12 sm:pb-16">
                {/* Gradient orbs only, no emojis */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-20 right-1/4 w-48 h-48 bg-orange-200/10 rounded-full blur-3xl"></div>
                </div>

                <div className="page-container relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        {/* Logo */}
                        <div className="relative inline-block mb-2 sm:mb-2">
                            <div className="relative w-36 h-36 sm:w-48 sm:h-48">
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
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-lobster mb-2 sm:mb-2 text-gray-900">
                            Tra Cứu Đơn Hàng
                        </h1>
                        {/* <p className="text-sm sm:text-lg md:text-lg text-gray-400 max-w-2xl mx-auto">
                            Tìm lịch sử đơn hàng của bạn
                        </p> */}
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="page-container -mt-6 relative z-20">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSearch}>
                        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-3xl bg-gray-100 shadow-inner">
                                        <Phone className="w-4 h-4 text-primary" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => {
                                            setSearchInput(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Nhập số điện thoại hoặc mã đơn hàng..."
                                        required
                                        className="w-full pl-14 pr-4 py-4 text-base border-2 border-gray-300 rounded-3xl focus:ring-0 focus:border-primary transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-primary to-orange-500 text-white font-bold px-8 py-4 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
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

                            {error && !loading && searched && allOrders.length === 0 && (
                                <div className="mt-4 p-3 rounded-3xl bg-red-50/50 border border-red-400 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Results Section */}
            <div className="page-container py-8 sm:py-12">
                <div className="max-w-3xl mx-auto">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            </div>
                            <p className="text-gray-500 font-medium">Đang tìm kiếm đơn hàng...</p>
                        </div>
                    )}

                    {!loading && searched && allOrders.length > 0 && (
                        <div className="space-y-4">
                            <div className="text-center mb-4 sm:mb-8">
                                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-3xl mb-3">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-semibold">Tìm thấy {allOrders.length} đơn hàng gần nhất</span>
                                </div>
                                <p className="text-gray-500 text-sm">Bấm vào đơn hàng để xem chi tiết</p>
                            </div>
                            {orders.map(order => (
                                <OrderCard key={order.id} order={order} />
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Trước
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-2 rounded-lg font-medium transition-all ${currentPage === page
                                                    ? 'bg-primary text-white'
                                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && allOrders.length === 0 && (
                        <EmptyState searched={searched} error={searched && allOrders.length === 0 ? error : null} />
                    )}
                </div>
            </div>
        </div>
    );
}
