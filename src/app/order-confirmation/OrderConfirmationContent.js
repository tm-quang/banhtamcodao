'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    CheckCircle, Package, MapPin, Phone, User, Calendar, Clock,
    CreditCard, Banknote, Truck, Store, Home, ArrowLeft, Copy, Check, ShoppingCart
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { SkeletonOrderConfirmation } from '@/components/Skeleton';

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

export default function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const orderCode = searchParams.get('code');
        if (orderCode) {
            fetchOrderDetails(orderCode);
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    const fetchOrderDetails = async (orderCode) => {
        try {
            const response = await fetch(`/api/orders/${orderCode}`);
            const data = await response.json();
            if (data.success) {
                setOrder(data.order);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const copyToClipboard = (text) => {
        if (!text) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    fallbackCopyTextToClipboard(text);
                });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    };

    const fallbackCopyTextToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    };

    const parseItemsList = (itemsListString) => {
        if (!itemsListString) return [];
        try {
            return itemsListString.split('|||').map(item => JSON.parse(item));
        } catch {
            return [];
        }
    };

    if (loading) {
        return <SkeletonOrderConfirmation />;
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center p-2" style={{ background: 'linear-gradient(to bottom, #FFF5EB 0%, #FFFBF7 100%)' }}>
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
                    <p className="text-gray-600 mb-6">Mã đơn hàng không hợp lệ hoặc đã bị xóa.</p>
                    <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-2xl hover:bg-primary/90 transition-colors">
                        <Home className="w-5 h-5" />
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    const items = parseItemsList(order.items_list);

    return (
        <div className="min-h-screen pt-24 pb-12" style={{ background: 'linear-gradient(to bottom, #FFF5EB 0%, #FFFBF7 100%)' }}>
            <div className="page-container">
                <div className="max-w-4xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-4">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                        @keyframes zoomInOut {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.1); }
                        }
                        .animate-zoom {
                            animation: zoomInOut 2s infinite ease-in-out;
                        }
                    ` }} />
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 animate-zoom shadow-md shadow-emerald-200">
                            <CheckCircle className="w-16 h-16 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
                        <p className="text-gray-600">Cảm ơn bạn đã đặt hàng tại Bánh Tấm Cô Đào</p>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* LEFT COLUMN - Order Info & Items */}
                        <div className="space-y-4">
                            {/* Order Code Card */}
                            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-300">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="cursor-pointer group active:scale-95 transition-transform"
                                        onClick={() => copyToClipboard(order.order_code)}
                                        title="Click để sao chép"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Đơn hàng của bạn</p>
                                        </div>
                                        <p className="text-2xl font-black text-primary group-hover:text-primary/80 transition-colors">#{order.order_code}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(order.order_code)}
                                        className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
                                    >
                                        {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-gray-500" />}
                                    </button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${order.status === 'Chờ xác nhận' ? 'bg-amber-500' :
                                        order.status === 'Đã xác nhận' ? 'bg-blue-600' :
                                            order.status === 'Đang vận chuyển' ? 'bg-cyan-600' :
                                                order.status === 'Hoàn thành' ? 'bg-green-600' :
                                                    order.status === 'Đã hủy' ? 'bg-red-600' :
                                                        'bg-gray-500'
                                        }`}>
                                        {order.status === 'Đã hủy' ? 'Đã hủy đơn' : order.status}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                                        <span>Đặt lúc: {formatHCMCDateTime(order.order_time)}</span>
                                    </span>
                                    {(order.delivery_date || order.delivery_time) && (
                                        <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-1 rounded-lg font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Giao lúc: {formatTimeOnly(order.delivery_time)} {order.delivery_date && `, ${formatDateOnly(order.delivery_date)}`}</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-300">
                                <div className="px-6 py-4 border-b border-dashed border-gray-200 bg-gray-50/50">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-primary" />
                                        Chi tiết đơn hàng ({items.length} món)
                                    </h2>
                                </div>
                                <div className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-3 font-semibold">Món ăn</th>
                                                    <th className="px-4 py-3 font-semibold text-center">SL</th>
                                                    <th className="px-4 py-3 font-semibold text-right">Đơn giá</th>
                                                    <th className="px-6 py-3 font-semibold text-right">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {items.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                                                            {item.note && <p className="text-xs text-gray-400 mt-0.5 italic">{item.note}</p>}
                                                        </td>
                                                        <td className="px-4 py-4 text-center font-medium text-gray-600">
                                                            {item.qty}
                                                        </td>
                                                        <td className="px-4 py-4 text-right text-gray-600">
                                                            {formatCurrency(item.price)}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-primary">
                                                            {formatCurrency(item.price * item.qty)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-6 py-4 bg-gray-50/30 border-t border-dashed border-gray-200">
                                        <div className="flex justify-between items-center text-gray-500 text-xs italic">
                                            <span>Cảm ơn quý khách!</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-300">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        {order.delivery_method === 'pickup' ? <Store className="w-5 h-5 text-primary" /> : <Truck className="w-5 h-5 text-primary" />}
                                        Thông tin giao hàng
                                    </h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Người nhận</p>
                                            <p className="font-medium text-gray-900">{order.recipient_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Số điện thoại</p>
                                            <p className="font-medium text-gray-900">{order.phone_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Địa chỉ</p>
                                            <p className="font-medium text-gray-900">{order.delivery_address}</p>
                                        </div>
                                    </div>
                                    {order.note && (
                                        <div className="p-3 bg-amber-50 rounded-xl">
                                            <p className="text-sm text-amber-700"><strong>Ghi chú:</strong> {order.note}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - Payment */}
                        <div className="space-y-4">
                            {/* Payment Summary */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-300">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        Chi tiết thanh toán
                                    </h2>
                                </div>
                                <div className="p-6">
                                    {/* Summary */}
                                    <div className="space-y-3 mb-6 pb-4 border-b border-gray-100">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tạm tính</span>
                                            <span className="font-medium">{formatCurrency(order.subtotal || order.total_amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Phí giao hàng</span>
                                            <span className="font-medium">{order.shipping_fee > 0 ? formatCurrency(order.shipping_fee) : <span className="text-emerald-600">Miễn phí</span>}</span>
                                        </div>
                                        {order.discount_amount > 0 && (
                                            <div className="flex justify-between text-emerald-600">
                                                <span>Giảm giá</span>
                                                <span className="font-medium">-{formatCurrency(order.discount_amount)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                                        <span>Tổng cộng</span>
                                        <span className="text-primary">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* QR Payment Card */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-300">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Banknote className="w-5 h-5 text-blue-600" />
                                        Thanh toán chuyển khoản
                                    </h2>
                                </div>
                                <div className="p-6 text-center">
                                    <div className="p-4 rounded-2xl inline-block mb-4 border-2 border-dashed border-gray-400">
                                        <img
                                            src={`https://img.vietqr.io/image/970415-107870460026-compact.png?amount=${order.total_amount}&addInfo=${order.order_code}`}
                                            alt="QR thanh toán"
                                            className="w-56 h-56 mx-auto"
                                        />
                                    </div>
                                    <div className="text-left rounded-xl p-4 space-y-2 border-2 border-dashed border-gray-400">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Ngân hàng</span>
                                            <span className="font-semibold text-gray-900">VietinBank</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Số tài khoản</span>
                                            <span className="font-semibold text-gray-900">107870460026</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Chủ tài khoản</span>
                                            <span className="font-semibold text-gray-900">TRAN MINH QUANG</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Số tiền</span>
                                            <span className="font-bold text-primary">{formatCurrency(order.total_amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Nội dung CK</span>
                                            <span className="font-semibold text-primary">{order.order_code}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4">
                                        Quét mã QR bằng app ngân hàng để thanh toán nhanh chóng
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <Link href="/menu" className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold py-4 rounded-xl shadow-md hover:bg-gray-50 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                    Tiếp tục mua
                                </Link>
                                <Link href="/" className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-semibold py-4 rounded-xl shadow-md hover:bg-primary/90 transition-colors">
                                    <Home className="w-5 h-5" />
                                    Về trang chủ
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
