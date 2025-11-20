// src/app/order-tracking/page.js
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Phone, Calendar, MapPin, User, FileText, CheckCircle2, Clock, Truck, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { TextSkeleton } from '@/components/LoadingAnimations';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

// Component hiển thị một đơn hàng với thiết kế nâng cấp
const OrderCard = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const items = order.items_list.split('|||').map(itemStr => {
        try { return JSON.parse(itemStr); } catch { return null; }
    }).filter(Boolean);

    const getStatusConfig = (status) => {
        const configs = {
            'Chờ xác nhận': {
                icon: Clock,
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                text: 'text-amber-700',
                badge: 'bg-amber-100 text-amber-800',
                dot: 'bg-amber-500'
            },
            'Đã xác nhận': {
                icon: CheckCircle2,
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-700',
                badge: 'bg-blue-100 text-blue-800',
                dot: 'bg-blue-500'
            },
            'Đang vận chuyển': {
                icon: Truck,
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
                text: 'text-indigo-700',
                badge: 'bg-indigo-100 text-indigo-800',
                dot: 'bg-indigo-500'
            },
            'Hoàn thành': {
                icon: CheckCircle2,
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                text: 'text-emerald-700',
                badge: 'bg-emerald-100 text-emerald-800',
                dot: 'bg-emerald-500'
            },
            'Đã hủy': {
                icon: XCircle,
                bg: 'bg-rose-50',
                border: 'border-rose-200',
                text: 'text-rose-700',
                badge: 'bg-rose-100 text-rose-800',
                dot: 'bg-rose-500'
            }
        };
        return configs[status] || {
            icon: AlertCircle,
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            text: 'text-slate-700',
            badge: 'bg-slate-100 text-slate-800',
            dot: 'bg-slate-500'
        };
    };

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className={`group relative overflow-hidden rounded-xl border ${statusConfig.border} bg-white shadow-md transition-all duration-300 hover:shadow-lg`}>
            {/* Header thu gọn - luôn hiển thị */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left"
            >
                <div className={`${statusConfig.bg} border-b ${statusConfig.border} p-3 sm:p-4`}>
                    {/* Mobile Layout - Stack vertically */}
                    <div className="flex flex-col sm:hidden gap-3">
                        {/* Row 1: Icon + Mã đơn + Chevron */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className={`p-1.5 rounded-lg ${statusConfig.bg} border ${statusConfig.border} flex-shrink-0`}>
                                    <StatusIcon className={`w-4 h-4 ${statusConfig.text}`} />
                                </div>
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <div className="w-3.5 h-3.5 flex-shrink-0 relative">
                                        <Image
                                            src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png"
                                            alt="Logo"
                                            width={14}
                                            height={14}
                                            className="object-contain"
                                        />
                                    </div>
                                    <p className="font-bold text-base text-gray-900 truncate">
                                        <span className="text-primary">{order.order_code}</span>
                                    </p>
                                </div>
                            </div>
                            <div className={`p-1 rounded-lg transition-transform duration-300 ${isExpanded ? 'bg-white/50' : 'bg-white/30'} flex-shrink-0`}>
                                {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-600" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                )}
                            </div>
                        </div>
                        {/* Row 2: Ngày + Số món */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(order.order_time), 'dd/MM/yyyy', { locale: vi })}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span>{items.length} {items.length === 1 ? 'món' : 'món'}</span>
                        </div>
                        {/* Row 3: Tổng tiền + Status */}
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-lg font-bold text-primary">
                                {formatCurrency(order.total_amount)}
                            </p>
                            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${statusConfig.badge} font-medium text-xs`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                                <span className="whitespace-nowrap">{order.status || 'Đang xử lý'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Layout - Horizontal */}
                    <div className="hidden sm:flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg ${statusConfig.bg} border ${statusConfig.border} flex-shrink-0`}>
                                <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-4 h-4 flex-shrink-0 relative">
                                        <Image
                                            src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png"
                                            alt="Logo"
                                            width={16}
                                            height={16}
                                            className="object-contain"
                                        />
                                    </div>
                                    <p className="font-bold text-lg text-gray-900 truncate">
                                        <span className="text-primary">{order.order_code}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{format(new Date(order.order_time), 'dd/MM/yyyy', { locale: vi })}</span>
                                    </div>
                                    <span className="text-gray-400">•</span>
                                    <span>{items.length} {items.length === 1 ? 'món' : 'món'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                                <p className="text-lg font-bold text-primary mb-1">
                                    {formatCurrency(order.total_amount)}
                                </p>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.badge} font-medium text-xs`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                                    {order.status || 'Đang xử lý'}
                                </div>
                            </div>
                            <div className={`p-1.5 rounded-lg transition-transform duration-300 ${isExpanded ? 'bg-white/50 rotate-180' : 'bg-white/30'}`}>
                                {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-600" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </button>

            {/* Nội dung chi tiết - chỉ hiển thị khi mở rộng */}
            {isExpanded && (
                <div className="overflow-hidden animate-fadeIn">
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white">
                        {/* Thông tin người nhận và địa chỉ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                            <div className="flex items-start gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <div className="p-1.5 rounded-md bg-white border border-gray-200 flex-shrink-0">
                                    <User className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Người nhận</p>
                                    <p className="text-sm font-medium text-gray-900 break-words">{order.recipient_name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <div className="p-1.5 rounded-md bg-white border border-gray-200 flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Địa chỉ</p>
                                    <p className="text-sm font-medium text-gray-900 break-words">{order.delivery_address || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Danh sách sản phẩm */}
                        <div className="rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-2.5 sm:p-3">
                            <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                                <div className="w-4 h-4 relative flex-shrink-0">
                                    <Image
                                        src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png"
                                        alt="Logo"
                                        width={16}
                                        height={16}
                                        className="object-contain"
                                    />
                                </div>
                                <p className="font-semibold text-sm text-gray-900">Sản phẩm đã đặt</p>
                            </div>
                            <div className="space-y-1.5">
                                {items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md bg-white border border-gray-100 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-primary">{item.qty}</span>
                                            </div>
                                            <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">{item.name}</p>
                                        </div>
                                        {item.price && (
                                            <p className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0 whitespace-nowrap">
                                                {formatCurrency(item.price * item.qty)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-primary/5 pt-16 sm:pt-20 pb-8 sm:pb-12">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 border-2 border-primary/20 mb-3 sm:mb-4 p-2">
                            <Image
                                src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png"
                                alt="Bánh Tằm Cô Đào Logo"
                                width={48}
                                height={48}
                                className="object-contain"
                            />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-lobster text-secondary mb-2 sm:mb-3 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent px-2">
                            Tra Cứu Đơn Hàng
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xl mx-auto px-2">
                            Nhập số điện thoại để xem lịch sử và trạng thái đơn hàng
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="container mx-auto px-4 -mt-4 sm:-mt-6 relative z-20">
                <div className="max-w-xl mx-auto">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 md:p-5">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5">
                                <div className="flex-1 relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            setPhoneNumber(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Nhập số điện thoại..."
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative overflow-hidden bg-gradient-to-r from-primary to-orange-600 text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:shadow-md hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[120px] text-sm"
                                >
                                    {loading ? (
                                        <>
                                            <div className="relative w-4 h-4 rounded-full overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white"></div>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                                            </div>
                                            <span>Đang tìm...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4" />
                                            <span>Tìm kiếm</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            {error && (
                                <div className="mt-2.5 sm:mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                    <p className="text-xs text-rose-700 break-words">{error}</p>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Results Section */}
            <div className="container mx-auto px-4 py-6 sm:py-8">
                <div className="max-w-3xl mx-auto">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4">
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-orange-400 to-primary"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                            </div>
                            <div className="space-y-2">
                                <TextSkeleton width="w-32" height="h-4" />
                            </div>
                        </div>
                    )}

                    {!loading && searched && orders.length > 0 && (
                        <div className="space-y-2.5 sm:space-y-3">
                            <div className="text-center mb-4 sm:mb-6 px-2">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                                    Tìm thấy {orders.length} {orders.length === 1 ? 'đơn hàng' : 'đơn hàng'}
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-500">Bấm vào đơn hàng để xem chi tiết</p>
                            </div>
                            {orders.map(order => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    )}

                    {!loading && searched && orders.length === 0 && !error && (
                        <div className="text-center bg-white rounded-xl shadow-md border border-dashed border-gray-200 p-6 sm:p-8 md:p-10 mx-2 sm:mx-0">
                            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 mb-3 sm:mb-4">
                                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
                            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto px-2">
                                Số điện thoại bạn nhập không khớp với bất kỳ đơn hàng nào trong hệ thống. 
                                Vui lòng kiểm tra lại số điện thoại hoặc liên hệ với chúng tôi để được hỗ trợ.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
