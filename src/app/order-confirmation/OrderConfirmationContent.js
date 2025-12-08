'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    CheckCircle2, Package, MapPin, Phone, User, Calendar, Clock,
    CreditCard, Banknote, Truck, Store, Home, ArrowLeft, Copy, Check
} from 'lucide-react';
import { SkeletonOrderConfirmation } from '@/components/Skeleton';

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
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom, #FFF5EB 0%, #FFFBF7 100%)' }}>
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
        <div className="min-h-screen pt-24 pb-8 px-4" style={{ background: 'linear-gradient(to bottom, #FFF5EB 0%, #FFFBF7 100%)' }}>
            <div className="max-w-5xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
                    <p className="text-gray-600">Cảm ơn bạn đã đặt hàng tại Bánh Tấm Cô Đào</p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* LEFT COLUMN - Order Info & Items */}
                    <div className="space-y-4">
                        {/* Order Code Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                                    <p className="text-2xl font-bold text-primary">{order.order_code}</p>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(order.order_code)}
                                    className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-gray-500" />}
                                </button>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Chờ xác nhận' ? 'bg-amber-100 text-amber-700' :
                                    order.status === 'Đang giao' ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {order.status}
                                </span>
                                {order.delivery_date && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {order.delivery_date}
                                    </span>
                                )}
                                {order.delivery_time && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {order.delivery_time}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    Món đã đặt ({items.length} món)
                                </h2>
                            </div>
                            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                                {items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">x{item.qty}</p>
                                        </div>
                                        <p className="font-bold text-primary">{formatCurrency(item.price * item.qty)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Banknote className="w-5 h-5 text-blue-600" />
                                    Thanh toán chuyển khoản
                                </h2>
                            </div>
                            <div className="p-6 text-center">
                                <div className="p-4 rounded-2xl inline-block mb-4 border-2 border-dashed border-gray-400">
                                    <img
                                        src={`https://img.vietqr.io/image/970415-107870460026-compact2.png?amount=${order.total_amount}&addInfo=${order.order_code}&accountName=LE%20THI%20NGOC%20DAO`}
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
                            <Link href="/menu" className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold py-4 rounded-2xl shadow-lg hover:bg-gray-50 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                                Tiếp tục mua
                            </Link>
                            <Link href="/" className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-semibold py-4 rounded-2xl shadow-lg hover:bg-primary/90 transition-colors">
                                <Home className="w-5 h-5" />
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
