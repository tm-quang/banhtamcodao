/**
 * Admin Orders Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/orders/page.js
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    ShoppingCart, Package, TrendingUp, DollarSign, Search, Filter,
    Calendar, User, MapPin, CreditCard, Clock, CheckCircle, XCircle,
    AlertCircle, Truck, Eye, Edit, RefreshCw, Download, X, ChevronDown, Info, Inbox, Settings, History, Receipt, Plus, Minus, Trash2, Palette
} from 'lucide-react';

const PRESET_COLORS = [
    { name: 'Orange', hex: '#f97316' },
    { name: 'Amber', hex: '#fbbf24' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Red', hex: '#dc2626' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Cyan', hex: '#0891b2' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Violet', hex: '#8b5cf6' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Fuchsia', hex: '#d946ef' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Teal', hex: '#14b8a6' },
    { name: 'Sky', hex: '#0ea5e9' },
    { name: 'Slate', hex: '#64748b' }
];

const DEFAULT_CARD_COLORS = {
    total: '#f97316',
    pending: '#fbbf24',
    completed: '#10b981',
    unpaid: '#d97706',
    delivery: '#0891b2',
    cancelled: '#dc2626',
    revenue: '#3b82f6'
};
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Chip } from '@/components/tailwindcss/ui/Chip';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { Toast } from '@/components/tailwindcss/ui/Toast';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { Skeleton, SkeletonCard, SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Status configuration - Match với dữ liệu thực tế từ database (tiếng Việt)
const STATUS_CONFIG = {
    'Chờ xác nhận': {
        label: 'Chờ xác nhận',
        color: 'bg-amber-500',
        textColor: 'text-amber-700',
        bgLight: 'bg-amber-50',
        icon: Clock
    },
    'Đã xác nhận': {
        label: 'Đã xác nhận',
        color: 'bg-blue-600',
        textColor: 'text-blue-700',
        bgLight: 'bg-blue-50',
        icon: CheckCircle
    },
    'Đang vận chuyển': {
        label: 'Đang vận chuyển',
        color: 'bg-cyan-600',
        textColor: 'text-cyan-700',
        bgLight: 'bg-cyan-50',
        icon: Truck
    },
    'Hoàn thành': {
        label: 'Hoàn thành',
        color: 'bg-green-600',
        textColor: 'text-green-700',
        bgLight: 'bg-green-50',
        icon: CheckCircle
    },
    'Đã hủy': {
        label: 'Đã hủy đơn',
        color: 'bg-red-600',
        textColor: 'text-red-700',
        bgLight: 'bg-red-50',
        icon: XCircle
    }
};

// Payment status configuration - Match với dữ liệu thực tế
const PAYMENT_CONFIG = {
    'unpaid': {
        label: 'Chưa thanh toán',
        color: 'bg-amber-500',
        textColor: 'text-amber-700',
        bgLight: 'bg-amber-50'
    },
    'paid': {
        label: 'Đã thanh toán',
        color: 'bg-green-600',
        textColor: 'text-green-700',
        bgLight: 'bg-green-50'
    },
    'cancelled': {
        label: 'Hủy thanh toán',
        color: 'bg-red-600',
        textColor: 'text-red-700',
        bgLight: 'bg-red-50'
    }
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ open, onClose, onConfirm, title, description, type = 'warning' }) => {
    const footer = (
        <div className="flex items-center justify-end gap-3 w-full">
            <Button
                onClick={onClose}
                className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 bg-gray-500 text-white hover:text-white hover:bg-gray-500 font-black uppercase text-[11px] tracking-widest px-6 transition-all"
            >
                Hủy bỏ
            </Button>
            <Button
                onClick={onConfirm}
                className={`flex items-center justify-center h-10 !rounded-2xl text-white shadow-xl font-black uppercase text-[11px] tracking-widest px-8 transition-all ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-100'}`}
            >
                Xác nhận
            </Button>
        </div>
    );

    const icons = {
        warning: AlertCircle,
        danger: XCircle,
        info: Info
    };

    const Icon = icons[type] || AlertCircle;
    const iconColors = {
        warning: 'text-amber-600',
        danger: 'text-red-600',
        info: 'text-blue-600'
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            size="sm"
            noPadding={true}
            title={
                <div className={`flex items-center gap-2 ${iconColors[type]}`}>
                    <Icon size={22} />
                    <span className="font-bold">{title}</span>
                </div>
            }
            footer={footer}
        >
            <p className="text-gray-700">{description}</p>
        </Dialog>
    );
};

// Helper function to parse address and map link
const parseAddress = (address) => {
    if (!address) return { text: 'N/A', url: null };
    // Match address and google maps link
    const mapMatch = address.match(/(.*?)\s*\(\s*?\s*Bản đồ:\s*(https:\/\/www\.google\.com\/maps[^\s)]+)\s*\)/i) ||
        address.match(/(.*?)\s*(https:\/\/www\.google\.com\/maps[^\s)]+)/i);

    if (mapMatch) {
        return {
            text: mapMatch[1].trim() || 'Vị trí trên bản đồ',
            url: mapMatch[2].trim()
        };
    }
    return { text: address, url: null };
};

// Order Detail Modal
const OrderDetailModal = ({ open, onClose, order, onEdit }) => {
    const [fullOrder, setFullOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && order?.id) {
            setLoading(true);
            fetch(`/api/admin/orders/${order.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        // Parse items_list từ string
                        let parsedItems = [];
                        if (data.order.items_list) {
                            if (typeof data.order.items_list === 'string') {
                                parsedItems = data.order.items_list.split('|||')
                                    .map(itemStr => {
                                        try {
                                            return JSON.parse(itemStr);
                                        } catch {
                                            return null;
                                        }
                                    })
                                    .filter(Boolean);
                            } else if (Array.isArray(data.order.items_list)) {
                                parsedItems = data.order.items_list;
                            }
                        }
                        setFullOrder({ ...data.order, parsedItems });
                    }
                })
                .catch(error => {
                    console.error('Error fetching order details:', error);
                    setFullOrder(order); // Fallback to passed order
                })
                .finally(() => setLoading(false));
        } else if (open && order) {
            // If order already has items, use it directly
            setFullOrder(order);
        }
    }, [open, order]);

    if (!order) return null;

    const orderData = fullOrder || order;
    const items = orderData.parsedItems || orderData.items || [];
    const subtotal = orderData.subtotal || orderData.total_amount || 0;
    const shippingFee = orderData.shipping_fee || 0;
    const discount = orderData.discount || orderData.voucher_discount || orderData.promotion_discount || 0;
    const voucherCode = orderData.voucher_code || orderData.promotion_code || null;
    const total = orderData.total_amount || subtotal;

    const footer = (
        <div className="flex items-center justify-between gap-2 w-full px-1">
            <Button
                onClick={() => onEdit(orderData)}
                className="flex items-center justify-center h-9 !rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px] px-6 shadow-md shadow-orange-100"
            >
                Chỉnh sửa đơn hàng
            </Button>
            <Button
                variant="outline"
                onClick={onClose}
                className="flex items-center justify-center h-9 !rounded-xl font-black text-[10px] px-6 shadow-md"
            >
                Đóng
            </Button>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title, color = '#3b82f6' }) => (
        <div className="flex items-center gap-2 mb-3">
            <div
                className="w-10 h-10 rounded-3xl flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
            >
                <Icon size={24} style={{ color }} />
            </div>
            <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">{title}</span>
        </div>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            size="xl"
            noPadding={true}
            title={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <ShoppingCart size={22} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-bold text-red-600 block">Đơn hàng #{order.order_code}</span>
                        <p className="text-xs text-gray-600 font-medium">Chi tiết và lịch sử giao dịch</p>
                    </div>
                </div>
            }
            footer={footer}
        >
            {loading ? (
                <div className="space-y-6">
                    <SkeletonCard lines={4} />
                    <SkeletonCard lines={4} />
                    <div className="space-y-3">
                        <Skeleton variant="text" width="w-32" height="h-6" />
                        <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="flex-1 space-y-2">
                                        <Skeleton variant="text" width="w-3/4" height="h-4" />
                                        <Skeleton variant="text" width="w-1/2" height="h-3" />
                                    </div>
                                    <Skeleton variant="text" width="w-20" height="h-4" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <SkeletonCard lines={3} />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Two columns for Info */}
                    {/* Two columns for Info - Standardized Height */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <SectionHeader icon={User} title="Khách hàng" color="#3b82f6" />
                            <div className="h-[280px] p-5 bg-white rounded-2xl border border-gray-500 shadow-sm space-y-3 overflow-y-auto custom-scrollbar">
                                <div>
                                    <p className="text-xs text-gray-600 font-bold uppercase mb-1">Người nhận</p>
                                    <p className="text-base font-black text-gray-900">{orderData.recipient_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-bold uppercase mb-1">Số điện thoại</p>
                                    <a href={`tel:${orderData.phone_number}`} className="text-base font-bold text-blue-600 hover:underline">{orderData.phone_number || 'N/A'}</a>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-bold uppercase mb-1">Địa chỉ giao hàng</p>
                                    <div className="flex items-start gap-2">
                                        <p className="text-sm font-medium text-gray-700 leading-relaxed flex-1">
                                            {(() => {
                                                const { text } = parseAddress(orderData.delivery_address);
                                                return text;
                                            })()}
                                        </p>
                                        {(() => {
                                            const { url } = parseAddress(orderData.delivery_address);
                                            return url ? (
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-300 transition-colors shadow-md"
                                                    title="Mở Google Maps"
                                                >
                                                    <MapPin size={20} />
                                                </a>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>

                                {orderData.note && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-[11px] font-black text-red-600 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                            <AlertCircle size={14} />
                                            Ghi chú của khách
                                        </p>
                                        <p className="text-sm text-red-700 font-medium italic leading-relaxed bg-red-50/50 p-3 rounded-xl border border-dashed border-red-500/50">{orderData.note}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className="space-y-4">
                            <SectionHeader icon={Package} title="Giao hàng & Thanh toán" color="#10b981" />
                            <div className="h-[280px] p-5 bg-white rounded-2xl border border-gray-500 shadow-sm space-y-4 overflow-y-auto custom-scrollbar">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 font-bold uppercase mb-1.5">Trạng thái đơn</p>
                                        <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight text-white shadow-sm ${STATUS_CONFIG[orderData.status]?.color}`}>
                                            {STATUS_CONFIG[orderData.status]?.label}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-600 font-bold uppercase mb-1.5">Thanh toán</p>
                                        <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight text-white shadow-sm ${PAYMENT_CONFIG[orderData.payment_status]?.color}`}>
                                            {PAYMENT_CONFIG[orderData.payment_status]?.label}
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-50 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 font-bold uppercase mb-1">Phương thức</p>
                                        <p className="text-sm font-bold text-gray-900">{orderData.payment_method || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 font-bold uppercase mb-1">Giao hàng</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {orderData.delivery_method === 'delivery' ? 'Giao tận nơi' :
                                                orderData.delivery_method === 'pickup' ? 'Tự đến lấy' :
                                                    orderData.delivery_method || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items - Hóa đơn thanh toán */}
                    <div className="space-y-4">
                        <SectionHeader icon={Inbox} title="Danh sách món đã đặt" color="#3b82f6" />
                        <div className="border-2 border-dashed border-gray-500 rounded-2xl overflow-hidden shadow-sm">
                            {/* Table Header */}
                            <div className="bg-gray-50/80 grid grid-cols-12 gap-2 px-4 py-2 text-[11px] md:text-[14px] font-black text-gray-900 uppercase tracking-wider border-b border-gray-200">
                                <div className="col-span-6">Món ăn</div>
                                <div className="col-span-2 text-right">Đơn giá</div>
                                <div className="col-span-1 text-center">SL</div>
                                <div className="col-span-3 text-right">Thành tiền</div>
                            </div>
                            {/* Table Body */}
                            <div className="divide-y divide-gray-50 bg-white">
                                {items.length > 0 ? (
                                    items.map((item, index) => {
                                        const itemPrice = item.price || item.unit_price || 0;
                                        const itemQuantity = item.quantity || 1;
                                        const itemTotal = itemPrice * itemQuantity;
                                        return (
                                            <div key={index} className="grid grid-cols-12 gap-2 px-4 py-2 text-sm hover:bg-blue-50/30 transition-colors">
                                                <div className="col-span-6">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-bold text-gray-700 leading-tight">{item.name || item.product_name || 'N/A'}</p>
                                                        {(itemPrice === 0 || item.is_gift || item.type === 'gift') && (
                                                            <span className="inline-flex items-center px-1 rounded-full text-[9px] font-black bg-green-500 text-white uppercase shadow-sm">
                                                                Tặng kèm
                                                            </span>
                                                        )}
                                                        {(item.is_promo || item.promotion_id) && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[9px] font-black bg-orange-100 text-orange-700 uppercase tracking-tighter border border-orange-200 shadow-sm">
                                                                Khuyến mãi
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.variant && (
                                                        <p className="text-[11px] text-blue-500 font-medium mt-1 inline-block bg-blue-50 px-2 py-0.5 rounded-full">
                                                            {item.variant}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="col-span-2 text-right text-gray-600 font-medium">
                                                    {formatCurrency(itemPrice)}
                                                </div>
                                                <div className="col-span-1 text-center font-black text-gray-900">
                                                    {itemQuantity}
                                                </div>
                                                <div className="col-span-3 text-right font-black text-red-600">
                                                    {formatCurrency(itemTotal)}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center text-gray-600 text-sm font-medium italic">
                                        Không tìm thấy danh sách món
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: History & Payment Summary - Payment first on Mobile */}
                    <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 items-start mt-8 pt-8 border-t border-gray-100">
                        {/* Column: History */}
                        <div className="w-full space-y-4">
                            <SectionHeader icon={History} title="Lịch sử cập nhật" color="#3b82f6" />
                            <div className="h-[350px] bg-gray-50/50 rounded-2xl p-4 border border-gray-500 overflow-y-auto custom-scrollbar">
                                {orderData.status_history && orderData.status_history.length > 0 ? (
                                    <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-100">
                                        {orderData.status_history.slice().reverse().map((log, idx) => (
                                            <div key={idx} className="relative pl-10 group">
                                                <div className={`absolute left-0 top-1 w-[32px] h-[32px] rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${log.type === 'status' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                </div>
                                                <div className="flex flex-col bg-white p-4 rounded-2xl border border-dashed border-gray-500 shadow-sm transition-all group-hover:border-blue-500">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">
                                                            {formatDate(log.time)}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-600">
                                                            {log.type === 'status' ? 'Trạng thái' : 'Thanh toán'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-black text-gray-900 mb-2">{log.note}</p>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg line-through opacity-50 font-bold">{log.from}</span>
                                                        <ChevronDown size={14} className="-rotate-90 text-gray-300" />
                                                        <span className={`px-2 py-1 rounded-lg font-black ${log.type === 'status' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                                            {log.type === 'payment' ? (PAYMENT_CONFIG[log.to]?.label || log.to) : log.to}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-md">
                                            <Inbox size={32} className="opacity-20 text-gray-700" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">Chưa có lịch sử</p>
                                        <p className="text-[10px] mt-1 italic text-center">Các thay đổi đơn hàng sẽ được ghi lại</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Column: Payment Summary */}
                        <div className="w-full space-y-4">
                            <SectionHeader icon={Receipt} title="Chi tiết thanh toán" color="#ef4444" />
                            <div className="h-[350px] bg-gray-50/50 rounded-2xl p-4 space-y-6 border border-gray-500 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-lg font-medium">
                                        <span className="text-gray-600">Tạm tính</span>
                                        <span className="text-gray-900 font-bold">{formatCurrency(subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between text-lg font-medium">
                                        <span className="text-gray-600">
                                            Giảm giá {voucherCode ? `(${voucherCode})` : ''}
                                        </span>
                                        <span className="text-green-600 font-bold">{discount > 0 ? `-${formatCurrency(discount)}` : '0 ₫'}</span>
                                    </div>

                                    <div className="flex justify-between text-lg font-medium">
                                        <span className="text-gray-600">Phí giao hàng</span>
                                        <span className="text-gray-900 font-bold">{shippingFee > 0 ? formatCurrency(shippingFee) : '0 ₫'}</span>
                                    </div>
                                </div>

                                <div className="pt-6 mt-auto border-t-2 border-dashed border-gray-400">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-black text-gray-900 uppercase tracking-wider">Tổng cộng</span>
                                        <span className="text-3xl font-black text-red-600 drop-shadow-sm">{formatCurrency(total)}</span>
                                    </div>
                                    <p className="text-[10px] text-right text-gray-500 font-bold mt-2 uppercase tracking-widest italic">Đã bao gồm các loại thuế phí</p>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            )}
        </Dialog>
    );
};

// Order Edit Modal
const OrderEditModal = ({ open, onClose, order, onSave, products = [] }) => {
    const [editData, setEditData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [historyNote, setHistoryNote] = useState('');

    useEffect(() => {
        if (open && order?.id) {
            setLoading(true);
            fetch(`/api/admin/orders/${order.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        let parsedItems = [];
                        if (data.order.items_list) {
                            if (typeof data.order.items_list === 'string') {
                                parsedItems = data.order.items_list.split('|||')
                                    .map(itemStr => {
                                        try { return JSON.parse(itemStr); } catch { return null; }
                                    })
                                    .filter(Boolean);
                            } else if (Array.isArray(data.order.items_list)) {
                                parsedItems = data.order.items_list;
                            }
                        }
                        setEditData({ ...data.order, parsedItems });
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [open, order]);

    if (!open || !editData) return null;

    const handleUpdateField = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdateItem = (index, updates) => {
        const newItems = [...editData.parsedItems];
        newItems[index] = { ...newItems[index], ...updates };

        // Recalculate subtotal
        const newSubtotal = newItems.reduce((sum, item) => sum + (item.price || item.unit_price || 0) * (item.quantity || 1), 0);

        setEditData(prev => ({
            ...prev,
            parsedItems: newItems,
            subtotal: newSubtotal,
            total_amount: newSubtotal + (prev.shipping_fee || 0) - (prev.discount || 0)
        }));
    };

    const handleRemoveItem = (index) => {
        const newItems = editData.parsedItems.filter((_, i) => i !== index);
        const newSubtotal = newItems.reduce((sum, item) => sum + (item.price || item.unit_price || 0) * (item.quantity || 1), 0);

        setEditData(prev => ({
            ...prev,
            parsedItems: newItems,
            subtotal: newSubtotal,
            total_amount: newSubtotal + (prev.shipping_fee || 0) - (prev.discount || 0)
        }));
    };

    const handleAddItem = (product) => {
        const newItem = {
            id: product.id,
            name: product.name,
            price: product.discount_price || product.price,
            quantity: 1,
            image_url: product.image_url
        };
        const newItems = [...editData.parsedItems, newItem];
        const newSubtotal = newItems.reduce((sum, item) => sum + (item.price || item.unit_price || 0) * (item.quantity || 1), 0);

        setEditData(prev => ({
            ...prev,
            parsedItems: newItems,
            subtotal: newSubtotal,
            total_amount: newSubtotal + (prev.shipping_fee || 0) - (prev.discount || 0)
        }));
        setSearchTerm('');
    };

    const handleSave = () => {
        // Chuyển parsedItems về items_list string theo format cũ
        const itemsListStr = editData.parsedItems.map(item => JSON.stringify(item)).join('|||');
        const finalData = {
            ...editData,
            items_list: itemsListStr,
            history_note: historyNote || 'Chỉnh sửa toàn bộ thông tin đơn hàng'
        };
        onSave(order.id, finalData);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            size="xl"
            noPadding={true}
            title={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Edit size={22} className="text-orange-600" />
                    </div>
                    <div>
                        <span className="font-bold text-gray-900 block">Chỉnh sửa đơn hàng #{order.order_code}</span>
                        <p className="text-xs text-gray-600 font-medium">Thay đổi thông tin khách hàng, món ăn và giá trị</p>
                    </div>
                </div>
            }
            footer={
                <div className="flex items-center justify-end gap-2 w-full px-1">
                    <Button variant="outline" onClick={onClose} className="h-9 !rounded-xl px-5 font-bold text-[10px] shadow-sm">Hủy bỏ</Button>
                    <Button onClick={handleSave} className="h-9 !rounded-xl px-7 bg-orange-600 text-white font-bold text-[10px] shadow-md shadow-orange-100">Lưu thay đổi</Button>
                </div>
            }
        >
            <div className="space-y-6 md:space-y-8 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
                {/* Customer Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <User size={18} className="text-blue-600" />
                            <span className="text-sm font-black uppercase text-gray-700">Thông tin khách hàng</span>
                        </div>
                        <div className="space-y-2.5 p-2.5 bg-gray-50 rounded-2xl border border-gray-300">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Tên người nhận</label>
                                <Input value={editData.recipient_name} onChange={(e) => handleUpdateField('recipient_name', e.target.value)} className="bg-white" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Số điện thoại</label>
                                <Input value={editData.phone_number} onChange={(e) => handleUpdateField('phone_number', e.target.value)} className="bg-white" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Địa chỉ giao hàng</label>
                                <textarea
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                                    value={editData.delivery_address}
                                    onChange={(e) => handleUpdateField('delivery_address', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings size={18} className="text-green-600" />
                            <span className="text-sm font-black uppercase text-gray-700">Trạng thái & Ghi chú</span>
                        </div>
                        <div className="space-y-2.5 p-2.5 bg-gray-50 rounded-2xl border border-gray-300">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Trạng thái đơn</label>
                                    <select
                                        className="w-full rounded-xl border border-gray-200 p-2 text-sm font-bold bg-white"
                                        value={editData.status}
                                        onChange={(e) => handleUpdateField('status', e.target.value)}
                                    >
                                        {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Thanh toán</label>
                                    <select
                                        className="w-full rounded-xl border border-gray-200 p-2 text-sm font-bold bg-white"
                                        value={editData.payment_status}
                                        onChange={(e) => handleUpdateField('payment_status', e.target.value)}
                                    >
                                        {Object.keys(PAYMENT_CONFIG).map(s => <option key={s} value={s}>{PAYMENT_CONFIG[s].label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Ghi chú của khách</label>
                                <textarea
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editData.note}
                                    onChange={(e) => handleUpdateField('note', e.target.value)}
                                />
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                                <label className="text-[10px] font-black uppercase text-red-600 mb-1 block">Lý do chỉnh sửa (Ghi vào lịch sử)</label>
                                <Input
                                    placeholder="Ví dụ: Khách đổi món, Thêm quà tặng..."
                                    value={historyNote}
                                    onChange={(e) => setHistoryNote(e.target.value)}
                                    className="border-red-200 focus:ring-red-500 bg-red-50/30"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Inbox size={18} className="text-blue-600" />
                            <span className="text-sm font-black uppercase text-gray-700">Danh sách món ăn</span>
                        </div>
                        <div className="relative w-64">
                            <Input
                                placeholder="Thêm món mới..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                startIcon={<Plus size={16} />}
                                className="h-9 text-xs !rounded-xl"
                            />
                            {searchTerm && filteredProducts.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                    {filteredProducts.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleAddItem(p)}
                                            className="w-full text-left px-4 py-2 text-xs hover:bg-orange-50 flex justify-between items-center"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{p.name}</span>
                                                {(p.discount_price === 0 || p.price === 0) && (
                                                    <span className="inline-flex items-center px-1.2 py-0.5 rounded text-[8px] font-black bg-emerald-100 text-emerald-700 uppercase">TẶNG</span>
                                                )}
                                            </div>
                                            <span className="text-red-600 font-black">{formatCurrency(p.discount_price || p.price)}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Desktop Table View */}
                        <div className="hidden md:block border border-gray-300 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr className="text-[11px] font-black uppercase text-gray-500">
                                        <th className="px-4 py-2 text-left">Sản phẩm</th>
                                        <th className="px-4 py-2 text-center w-24">Số lượng</th>
                                        <th className="px-4 py-2 text-right w-32">Đơn giá</th>
                                        <th className="px-4 py-2 text-right w-32">Thành tiền</th>
                                        <th className="px-4 py-2 text-center w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {editData.parsedItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                                                    {((item.price || item.unit_price) === 0 || item.is_gift || item.type === 'gift') && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[8px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-tighter border border-emerald-200">
                                                            Quà tặng
                                                        </span>
                                                    )}
                                                    {(item.is_promo || item.promotion_id) && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[8px] font-black bg-orange-100 text-orange-700 uppercase tracking-tighter border border-orange-200">
                                                            Khuyến mãi
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-blue-500 font-medium">{item.variant || ''}</p>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleUpdateItem(index, { quantity: Math.max(1, (item.quantity || 1) - 1) })} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><Minus size={12} /></button>
                                                    <span className="font-black w-6 text-center">{item.quantity || 1}</span>
                                                    <button onClick={() => handleUpdateItem(index, { quantity: (item.quantity || 1) + 1 })} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><Plus size={12} /></button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <input
                                                    type="number"
                                                    className="w-full bg-transparent text-right font-bold focus:outline-none focus:text-blue-600"
                                                    value={item.price || item.unit_price || 0}
                                                    onChange={(e) => handleUpdateItem(index, { price: parseFloat(e.target.value) || 0 })}
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right font-black text-red-600">
                                                {formatCurrency((item.price || item.unit_price || 0) * (item.quantity || 1))}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button onClick={() => handleRemoveItem(index)} className="text-gray-400 hover:text-red-600 transition-colors p-2"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-2">
                            {editData.parsedItems.map((item, index) => (
                                <div key={index} className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                <p className="font-black text-gray-900 leading-tight text-sm">{item.name}</p>
                                                {((item.price || item.unit_price) === 0 || item.is_gift || item.type === 'gift') && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[8px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-tighter border border-emerald-200">
                                                        Quà tặng
                                                    </span>
                                                )}
                                                {(item.is_promo || item.promotion_id) && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[8px] font-black bg-orange-100 text-orange-700 uppercase tracking-tighter border border-orange-200">
                                                        Khuyến mãi
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-blue-500 font-bold uppercase">{item.variant || ''}</p>
                                        </div>
                                        <button onClick={() => handleRemoveItem(index)} className="p-1 text-gray-400 hover:text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                                                <button onClick={() => handleUpdateItem(index, { quantity: Math.max(1, (item.quantity || 1) - 1) })} className="w-7 h-7 rounded-md bg-white shadow-sm flex items-center justify-center"><Minus size={12} /></button>
                                                <span className="font-black w-7 text-center text-xs">{item.quantity || 1}</span>
                                                <button onClick={() => handleUpdateItem(index, { quantity: (item.quantity || 1) + 1 })} className="w-7 h-7 rounded-md bg-white shadow-sm flex items-center justify-center"><Plus size={12} /></button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1 mb-0.5">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">Giá:</span>
                                                <input
                                                    type="number"
                                                    className="w-16 bg-gray-50 border border-gray-100 rounded-md px-1.5 py-0.5 text-right font-bold text-[11px]"
                                                    value={item.price || item.unit_price || 0}
                                                    onChange={(e) => handleUpdateItem(index, { price: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <p className="font-black text-red-600 text-sm">{formatCurrency((item.price || item.unit_price || 0) * (item.quantity || 1))}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Totals Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Hình thức thanh toán & Giao hàng</label>
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                className="w-full rounded-xl border border-gray-200 p-2 text-sm font-bold bg-white"
                                value={editData.payment_method}
                                onChange={(e) => handleUpdateField('payment_method', e.target.value)}
                            >
                                <option value="Tiền mặt (COD)">Tiền mặt (COD)</option>
                                <option value="Chuyển khoản">Chuyển khoản</option>
                                <option value="Thanh toán Online">Thanh toán Online</option>
                            </select>
                            <select
                                className="w-full rounded-xl border border-gray-200 p-2 text-sm font-bold bg-white"
                                value={editData.delivery_method}
                                onChange={(e) => handleUpdateField('delivery_method', e.target.value)}
                            >
                                <option value="delivery">Giao tận nơi</option>
                                <option value="pickup">Tự đến lấy</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 md:p-5 space-y-2 border border-gray-300">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-bold uppercase text-[12px]">Tạm tính</span>
                            <span className="font-bold">{formatCurrency(editData.subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-bold uppercase text-[12px]">Phí giao hàng</span>
                            <input
                                type="number"
                                className="w-32 bg-white border border-gray-200 rounded-lg p-1 text-right font-bold text-sm"
                                value={editData.shipping_fee || 0}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setEditData(prev => ({ ...prev, shipping_fee: val, total_amount: (prev.subtotal || 0) + val - (prev.discount || 0) }));
                                }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex flex-col">
                                <span className="text-gray-600 font-bold uppercase text-[12px]">Giảm giá / Khuyến mãi</span>
                                <input
                                    placeholder="Mã voucher..."
                                    className="text-[10px] font-bold text-blue-600 bg-transparent outline-none uppercase"
                                    value={editData.voucher_code || ''}
                                    onChange={(e) => handleUpdateField('voucher_code', e.target.value)}
                                />
                            </div>
                            <input
                                type="number"
                                className="w-32 bg-white border border-gray-200 rounded-lg p-1 text-right font-bold text-sm text-green-600"
                                value={editData.discount || 0}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setEditData(prev => ({ ...prev, discount: val, total_amount: (prev.subtotal || 0) + (prev.shipping_fee || 0) - val }));
                                }}
                            />
                        </div>
                        <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="font-black uppercase tracking-widest text-gray-900">Tổng cộng</span>
                            <span className="text-2xl font-black text-red-600">{formatCurrency(editData.total_amount)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

const StatusCell = ({ getValue, row, onUpdate, openStatusDropdown, setOpenStatusDropdown }) => {
    const status = getValue();
    const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-500', textColor: 'text-gray-700' };
    const isOpen = openStatusDropdown === row.original.id;
    const statusOptions = Object.keys(STATUS_CONFIG);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenStatusDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, setOpenStatusDropdown]);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-md border border-white/20 cursor-pointer transition-all hover:scale-105 active:scale-95 ${config.color}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpenStatusDropdown(isOpen ? null : row.original.id);
                }}
            >
                {config.label}
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[180px] overflow-hidden shadow-orange-100/50">
                    {statusOptions.map((statusKey) => {
                        const optionConfig = STATUS_CONFIG[statusKey];
                        const isSelected = statusKey === status;
                        return (
                            <button
                                key={statusKey}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (statusKey !== status) {
                                        setOpenStatusDropdown(null);
                                        onUpdate(row.original.id, { status: statusKey }, row.original.order_code, optionConfig.label, 'trạng thái');
                                    } else {
                                        setOpenStatusDropdown(null);
                                    }
                                }}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2.5 ${isSelected ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-600'
                                    }`}
                            >
                                <div className={`w-3 h-3 rounded-full ${optionConfig.color}`} />
                                <span>{optionConfig.label}</span>
                                {isSelected && <CheckCircle size={16} className="ml-auto text-blue-600" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const PaymentStatusCell = ({ getValue, row, onUpdate, openStatusDropdown, setOpenStatusDropdown }) => {
    const status = getValue();
    const config = PAYMENT_CONFIG[status] || { label: status, color: 'bg-gray-500', textColor: 'text-gray-700' };
    const isOpen = openStatusDropdown === `payment-${row.original.id}`;
    const paymentOptions = Object.keys(PAYMENT_CONFIG);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenStatusDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, setOpenStatusDropdown]);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-md border border-white/20 cursor-pointer transition-all hover:scale-105 active:scale-95 ${config.color}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpenStatusDropdown(isOpen ? null : `payment-${row.original.id}`);
                }}
            >
                {config.label}
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[180px] overflow-hidden shadow-amber-100/30">
                    {paymentOptions.map((paymentKey) => {
                        const optionConfig = PAYMENT_CONFIG[paymentKey];
                        const isSelected = paymentKey === status;
                        return (
                            <button
                                key={paymentKey}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (paymentKey !== status) {
                                        setOpenStatusDropdown(null);
                                        onUpdate(row.original.id, { payment_status: paymentKey }, row.original.order_code, optionConfig.label, 'thanh toán');
                                    } else {
                                        setOpenStatusDropdown(null);
                                    }
                                }}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2.5 ${isSelected ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-600'
                                    }`}
                            >
                                <div className={`w-3 h-3 rounded-full ${optionConfig.color}`} />
                                <span>{optionConfig.label}</span>
                                {isSelected && <CheckCircle size={16} className="ml-auto text-blue-600" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default function OrdersPageTailwind() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [deliveryFilter, setDeliveryFilter] = useState('all'); // 'all', 'delivery', 'pickup'
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [openStatusDropdown, setOpenStatusDropdown] = useState(null); // Track which row's dropdown is open

    // View range settings (persisted)
    const [viewRange, setViewRange] = useState('all');
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [cardColors, setCardColors] = useState(DEFAULT_CARD_COLORS);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [settingsTab, setSettingsTab] = useState('view'); // 'view', 'color'

    // Fetch all settings from DB
    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.success && data.settings) {
                const { settings } = data;
                if (settings.admin_orders_view_range) setViewRange(settings.admin_orders_view_range);
                if (settings.order_stats_colors) {
                    try {
                        const parsedColors = typeof settings.order_stats_colors === 'string'
                            ? JSON.parse(settings.order_stats_colors)
                            : settings.order_stats_colors;
                        setCardColors(prev => ({ ...prev, ...parsedColors }));
                    } catch (e) {
                        console.error('Error parsing card colors:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const saveViewRange = async (range) => {
        setIsSavingSettings(true);
        setViewRange(range);
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'admin_orders_view_range', value: range })
            });
            showToast(`Đã lưu cài đặt hiển thị mặc định: ${range === 'all' ? 'Tất cả' : range === 'week' ? 'Tuần này' : range === 'month' ? 'Tháng này' : 'Quý này'}`, 'success');
        } catch (error) {
            showToast('Lỗi khi lưu cài đặt vào Database', 'error');
        } finally {
            setIsSavingSettings(false);
            setIsSettingsModalOpen(false);
        }
    };

    const saveCardColor = async (cardId, color) => {
        const newColors = { ...cardColors, [cardId]: color };
        setCardColors(newColors);
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'order_stats_colors', value: newColors })
            });
        } catch (error) {
            console.error('Error saving card colors:', error);
        }
    };

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        description: '',
        type: 'warning',
        onConfirm: null
    });

    // Toast state
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success'
    });

    // Alert modal state
    const [alertModal, setAlertModal] = useState({
        open: false,
        title: '',
        message: '',
        type: 'info'
    });


    // Fetch orders
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders || []);
            } else {
                setError('Không thể tải danh sách đơn hàng');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Lỗi khi tải dữ liệu');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
        // Fetch products for edit modal
        fetch('/api/admin/products')
            .then(res => res.json())
            .then(data => {
                if (data.success) setProducts(data.products || []);
            })
            .catch(err => console.error('Error fetching products:', err));
    }, []);

    // Unified filtering logic
    const [dateFilter, setDateFilter] = useState({
        type: 'all', // 'all', 'day', 'month', 'year', 'range'
        date: '',
        month: '',
        year: '',
        startDate: '',
        endDate: ''
    });
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch =
                order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.phone_number?.includes(searchTerm);

            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
            const matchesDelivery = deliveryFilter === 'all' || order.delivery_method === deliveryFilter;

            // Date filtering logic
            let matchesDate = true;
            if (dateFilter.type !== 'all') {
                const orderDate = new Date(order.order_time);
                if (dateFilter.type === 'day' && dateFilter.date) {
                    const filterDate = new Date(dateFilter.date);
                    matchesDate = orderDate.toDateString() === filterDate.toDateString();
                } else if (dateFilter.type === 'month' && dateFilter.month) {
                    const [year, month] = dateFilter.month.split('-');
                    matchesDate = orderDate.getFullYear() === parseInt(year) && (orderDate.getMonth() + 1) === parseInt(month);
                } else if (dateFilter.type === 'year' && dateFilter.year) {
                    matchesDate = orderDate.getFullYear() === parseInt(dateFilter.year);
                } else if (dateFilter.type === 'range' && dateFilter.startDate && dateFilter.endDate) {
                    const start = new Date(dateFilter.startDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(dateFilter.endDate);
                    end.setHours(23, 59, 59, 999);
                    matchesDate = orderDate >= start && orderDate <= end;
                }
            } else if (viewRange !== 'all') {
                // Apply default view range if no manual date filter is active
                const orderDate = new Date(order.order_time);
                const now = new Date();
                if (viewRange === 'week') {
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
                    startOfWeek.setHours(0, 0, 0, 0);
                    matchesDate = orderDate >= startOfWeek;
                } else if (viewRange === 'month') {
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    startOfMonth.setHours(0, 0, 0, 0);
                    matchesDate = orderDate >= startOfMonth;
                } else if (viewRange === 'quarter') {
                    const quarter = Math.floor(now.getMonth() / 3);
                    const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
                    startOfQuarter.setHours(0, 0, 0, 0);
                    matchesDate = orderDate >= startOfQuarter;
                }
            }

            return matchesSearch && matchesStatus && matchesPayment && matchesDelivery && matchesDate;
        });
    }, [orders, searchTerm, statusFilter, paymentFilter, deliveryFilter, dateFilter, viewRange]);

    // Calculate stats based on filtered orders to ensure consistency
    const stats = useMemo(() => {
        const total = filteredOrders.length;
        const pending = filteredOrders.filter(o => o.status === 'Chờ xác nhận').length;
        const shipping = filteredOrders.filter(o => o.status === 'Đang vận chuyển').length;
        const completed = filteredOrders.filter(o => o.status === 'Hoàn thành').length;
        const cancelled = filteredOrders.filter(o => o.status === 'Đã hủy').length;
        const unpaid = filteredOrders.filter(o => o.payment_status === 'Chưa thanh toán').length;
        const delivery = filteredOrders.filter(o => o.delivery_method === 'delivery').length;
        const revenue = filteredOrders
            .filter(o => o.status === 'Hoàn thành')
            .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

        return { total, pending, shipping, completed, cancelled, unpaid, delivery, revenue };
    }, [filteredOrders]);

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    // Show alert modal
    const showAlert = (message, title = 'Thông báo', type = 'info') => {
        setAlertModal({ open: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertModal(prev => ({ ...prev, open: false }));
    };

    // Show confirmation dialog
    const showConfirmDialog = (title, description, type, onConfirm) => {
        setConfirmDialog({
            open: true,
            title,
            description,
            type,
            onConfirm: () => {
                setConfirmDialog(prev => ({ ...prev, open: false }));
                onConfirm();
            }
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
    };

    // Update order status
    const handleUpdateStatus = async (orderId, updateData) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                fetchOrders();
                // Determine success message based on what was updated
                if (updateData.status) {
                    const statusLabel = STATUS_CONFIG[updateData.status]?.label || updateData.status;
                    showToast(`Cập nhật trạng thái đơn hàng thành "${statusLabel}" thành công!`, 'success');
                } else if (updateData.payment_status) {
                    const paymentLabel = PAYMENT_CONFIG[updateData.payment_status]?.label || updateData.payment_status;
                    showToast(`Cập nhật trạng thái thanh toán thành "${paymentLabel}" thành công!`, 'success');
                } else {
                    showToast('Cập nhật đơn hàng thành công!', 'success');
                }
            } else {
                showToast(data.message || 'Cập nhật thất bại!', 'error');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            showToast('Lỗi khi cập nhật đơn hàng!', 'error');
        }
    };

    const showConfirmUpdate = (id, updateData, orderCode, label, typeLabel) => {
        showConfirmDialog(
            `Xác nhận thay đổi ${typeLabel}`,
            `Bạn có chắc chắn muốn chuyển đơn hàng #${orderCode} sang "${label}" không?`,
            'info',
            () => {
                handleUpdateStatus(id, updateData);
            }
        );
    };

    // Table columns
    const columns = useMemo(() => [
        {
            accessorKey: 'order_code',
            header: 'Mã đơn',
            cell: ({ getValue }) => (
                <span className="text-sm font-bold text-blue-600 font-mono">#{getValue()}</span>
            ),
            size: 100
        },
        {
            accessorKey: 'recipient_name',
            header: 'Khách hàng',
            cell: ({ row }) => (
                <div className="flex flex-col py-1">
                    <span className="text-[15px] font-black text-gray-900 leading-tight tracking-tight">{row.original.recipient_name || 'N/A'}</span>
                    <a href={`tel:${row.original.phone_number}`} className="text-[14px] text-blue-500 mt-1 font-bold uppercase tracking-tighter hover:underline">
                        {row.original.phone_number || 'N/A'}
                    </a>
                </div>
            ),
            size: 180
        },
        {
            accessorKey: 'delivery_address',
            header: 'Địa chỉ',
            cell: ({ getValue }) => {
                const { text, url } = parseAddress(getValue());
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 line-clamp-2 flex-1" title={text}>{text || 'N/A'}</span>
                        {url && (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-300 transition-colors shadow-sm"
                                title="Mở Google Maps"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MapPin size={14} />
                            </a>
                        )}
                    </div>
                );
            },
            size: 200
        },
        {
            accessorKey: 'total_amount',
            header: 'Tổng tiền hàng',
            cell: ({ getValue }) => (
                <span className="text-md font-black text-red-600">{formatCurrency(getValue())}</span>
            ),
            size: 140
        },
        {
            accessorKey: 'delivery_method',
            header: 'Hình thức',
            cell: ({ getValue }) => (
                <div className="flex justify-center">
                    <span className={`inline-block px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-md border border-white/20 ${getValue() === 'delivery' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                        {getValue() === 'delivery' ? 'Giao tận nơi' : 'Tự đến lấy'}
                    </span>
                </div>
            ),
            size: 120
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái đơn',
            cell: (props) => <StatusCell {...props} onUpdate={showConfirmUpdate} openStatusDropdown={openStatusDropdown} setOpenStatusDropdown={setOpenStatusDropdown} />,
            size: 150
        },
        {
            accessorKey: 'payment_status',
            header: 'Thanh toán',
            cell: (props) => <PaymentStatusCell {...props} onUpdate={showConfirmUpdate} openStatusDropdown={openStatusDropdown} setOpenStatusDropdown={setOpenStatusDropdown} />,
            size: 150
        },
        {
            accessorKey: 'order_time',
            header: 'Thời gian',
            cell: ({ getValue }) => {
                const date = new Date(getValue());
                return (
                    <div className="flex flex-col py-0.5">
                        <span className="text-sm font-semibold text-gray-900">
                            {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs text-gray-600 font-medium">
                            {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </span>
                    </div>
                );
            },
            size: 120
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Tooltip content="Xem chi tiết">
                        <button
                            onClick={() => setSelectedOrder(row.original)}
                            className="w-10 h-10 bg-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-md shadow-blue-50"
                        >
                            <Eye size={18} />
                        </button>
                    </Tooltip>
                    <Tooltip content="In hóa đơn">
                        <button
                            onClick={() => window.print()}
                            className="w-10 h-10 bg-gray-200 text-gray-600 hover:bg-gray-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-md shadow-gray-50"
                        >
                            <Download size={18} />
                        </button>
                    </Tooltip>
                </div>
            ),
            size: 130
        }
    ], [openStatusDropdown]);

    return (
        <div className="h-full flex flex-col">
            <style jsx global>{`
                button:focus {
                    outline: none !important;
                    box-shadow: none !important;
                    ring: 0 !important;
                }
            `}</style>
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2.5 mb-0.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100/50">
                            <ShoppingCart size={18} fill="currentColor" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Quản lý Đơn hàng</h1>
                    </div>
                    <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.15em] ml-0.5">Trạng thái đơn hàng ({stats.total} đơn hàng)</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        startIcon={<Settings size={16} />}
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="flex items-center justify-center gap-2 h-10 !rounded-2xl text-gray-600 bg-gray-500 hover:bg-gray-600 font-black uppercase text-xs tracking-widest px-3 shadow-sm transition-all"
                    >
                        Cài đặt
                    </Button>
                    <Button
                        startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
                        onClick={fetchOrders}
                        className="flex items-center justify-center gap-2 h-10 !rounded-2xl text-gray-600 bg-gray-500 hover:bg-gray-600 font-black uppercase text-xs tracking-widest px-3 shadow-sm transition-all"
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4 px-1">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Phạm vi mặc định:</span>
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">
                    {viewRange === 'all' ? 'Toàn thời gian' : viewRange === 'week' ? 'Tuần này' : viewRange === 'month' ? 'Tháng này' : 'Quý này'}
                </span>
            </div>

            {/* Stats Cards Grid - 7 cards per row on Desktop */}
            <div className="grid grid-cols-3 lg:grid-cols-7 gap-3 md:gap-4 mb-5 px-0.5">
                {loading ? (
                    Array(7).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
                ) : (
                    <>
                        {/* 1. Doanh thu */}
                        <div
                            style={{ backgroundColor: cardColors.revenue }}
                            className="group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 z-10 border-2 border-blue-600">
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <DollarSign size={70} className="md:w-[90px] md:h-[90px]" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <DollarSign size={14} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{formatCurrency(stats.revenue).replace('₫', '')}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Doanh thu (VNĐ)</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Tổng đơn */}
                        <div
                            onClick={() => setStatusFilter('all')}
                            style={{
                                backgroundColor: cardColors.total,
                                boxShadow: statusFilter === 'all' ? `0 0 0 2px white, 0 0 0 4px ${cardColors.total}` : ''
                            }}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'all' ? 'z-20 scale-[1.02] shadow-xl' : 'z-10'}`}>
                            <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <ShoppingCart size={70} className="md:w-[90px] md:h-[90px]" fill="currentColor" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 md:mb-3 shadow-inner">
                                    <ShoppingCart size={14} className="md:w-[18px] md:h-[18px]" fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.total}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight">Tổng đơn</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Chưa thanh toán */}
                        <div
                            onClick={() => setPaymentFilter('Chưa thanh toán')}
                            style={{
                                backgroundColor: cardColors.unpaid,
                                boxShadow: paymentFilter === 'Chưa thanh toán' ? `0 0 0 2px white, 0 0 0 4px ${cardColors.unpaid}` : ''
                            }}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${paymentFilter === 'Chưa thanh toán' ? 'z-20 scale-[1.02] shadow-xl' : 'z-10'}`}>
                            <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <CreditCard size={70} className="md:w-[90px] md:h-[90px]" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 md:mb-3 shadow-inner">
                                    <CreditCard size={14} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.unpaid}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight">Chưa thanh toán</p>
                                </div>
                            </div>
                        </div>

                        {/* 4. Hoàn thành */}
                        <div
                            onClick={() => setStatusFilter('Hoàn thành')}
                            style={{
                                backgroundColor: cardColors.completed,
                                boxShadow: statusFilter === 'Hoàn thành' ? `0 0 0 2px white, 0 0 0 4px ${cardColors.completed}` : ''
                            }}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'Hoàn thành' ? 'z-20 scale-[1.02] shadow-xl' : 'z-10'}`}>
                            <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <CheckCircle size={70} className="md:w-[90px] md:h-[90px]" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 md:mb-3 shadow-inner">
                                    <CheckCircle size={14} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.completed}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Hoàn thành</p>
                                </div>
                            </div>
                        </div>

                        {/* 5. Chờ xác nhận */}
                        <div
                            onClick={() => setStatusFilter('Chờ xác nhận')}
                            style={{
                                backgroundColor: cardColors.pending,
                                boxShadow: statusFilter === 'Chờ xác nhận' ? `0 0 0 2px white, 0 0 0 4px ${cardColors.pending}` : ''
                            }}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'Chờ xác nhận' ? 'z-20 scale-[1.02] shadow-xl' : 'z-10'}`}>
                            <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <Clock size={70} className="md:w-[90px] md:h-[90px]" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 md:mb-3 shadow-inner">
                                    <Clock size={14} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.pending}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Chờ xác nhận</p>
                                </div>
                            </div>
                        </div>

                        {/* 6. Giao hàng */}
                        <div
                            onClick={() => {
                                setDeliveryFilter('delivery');
                                setStatusFilter('all');
                                setPaymentFilter('all');
                            }}
                            style={{
                                backgroundColor: cardColors.delivery,
                                boxShadow: deliveryFilter === 'delivery' ? `0 0 0 2px white, 0 0 0 4px ${cardColors.delivery}` : ''
                            }}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${deliveryFilter === 'delivery' ? 'z-20 scale-[1.02] shadow-xl' : 'z-10'}`}>
                            <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <Truck size={70} className="md:w-[90px] md:h-[90px]" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 md:mb-3 shadow-inner">
                                    <Truck size={14} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.delivery}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Đang giao hàng</p>
                                </div>
                            </div>
                        </div>

                        {/* 7. Đã hủy */}
                        <div
                            onClick={() => setStatusFilter('Đã hủy')}
                            style={{
                                backgroundColor: cardColors.cancelled,
                                boxShadow: statusFilter === 'Đã hủy' ? `0 0 0 2px white, 0 0 0 4px ${cardColors.cancelled}` : ''
                            }}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'Đã hủy' ? 'z-20 scale-[1.02] shadow-xl' : 'z-10'}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <XCircle size={70} className="md:w-[90px] md:h-[90px]" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <XCircle size={14} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.cancelled}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Đã hủy</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[300px]">
                    <div className="relative group">
                        <Input
                            placeholder="TÌM KIẾM MÃ ĐƠN, TÊN HOẶC SỐ ĐIỆN THOẠI KHÁCH HÀNG..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            startIcon={<Search size={18} className="text-gray-600 group-focus-within:text-orange-500 transition-colors" />}
                            className="!rounded-2xl border-gray-200 bg-gray-50/50 font-bold uppercase tracking-tight focus:bg-white transition-all pl-12"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsDateModalOpen(true)}
                        className={`flex items-center gap-2 px-3 py-3 text-[11px] font-black rounded-xl transition-all active:scale-95 uppercase tracking-widest border ${dateFilter.type !== 'all' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Calendar size={16} />
                        {dateFilter.type === 'all' ? 'Lọc Đơn Hàng' : 'Đã lọc'}
                    </button>

                    {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || deliveryFilter !== 'all' || dateFilter.type !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setPaymentFilter('all');
                                setDeliveryFilter('all');
                                setDateFilter({ type: 'all', date: '', month: '', year: '', startDate: '', endDate: '' });
                            }}
                            className="flex items-center gap-2 px-3 py-3 text-[11px] font-black text-red-500 hover:text-red-600 bg-red-50 rounded-xl transition-all active:scale-95 uppercase tracking-widest"
                        >
                            <X size={14} />
                            Xóa
                        </button>
                    )}
                    <div className="h-8 w-px bg-gray-200" />
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredOrders.length} đơn hàng</span>
                </div>
            </div>

            {/* Date Filter Modal */}
            <Dialog
                open={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                title={
                    <div className="flex items-center gap-2 text-orange-600">
                        <Calendar size={22} />
                        <span className="font-black uppercase tracking-tight text-[15px]">Bộ lọc thời gian nâng cao</span>
                    </div>
                }
                size="xl"
                footer={
                    <div className="flex items-center justify-end gap-3 w-full">
                        <Button
                            onClick={() => {
                                setDateFilter({ type: 'all', date: '', month: '', year: '', startDate: '', endDate: '' });
                                setIsDateModalOpen(false);
                            }}
                            className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 bg-gray-400 text-gray-600 uppercase hover:bg-gray-500 font-black text-[8px] px-6"
                        >
                            Hủy lọc
                        </Button>
                        <Button
                            onClick={() => setIsDateModalOpen(false)}
                            className="flex items-center justify-center h-10 !rounded-2xl bg-orange-600 text-white font-black uppercase text-[8px] px-8 shadow-md shadow-orange-100"
                        >
                            Áp dụng lọc
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6 p-1">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setDateFilter({ ...dateFilter, type: 'day' })}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${dateFilter.type === 'day' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                        >
                            <p className="text-[10px] font-black uppercase text-gray-600 mb-1">Lọc theo ngày</p>
                            <Input
                                type="date"
                                value={dateFilter.date}
                                onChange={(e) => setDateFilter({ ...dateFilter, type: 'day', date: e.target.value })}
                                className="!bg-transparent border-none p-0 h-auto font-bold"
                            />
                        </button>

                        <button
                            onClick={() => setDateFilter({ ...dateFilter, type: 'month' })}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${dateFilter.type === 'month' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                        >
                            <p className="text-[10px] font-black uppercase text-gray-600 mb-1">Lọc theo tháng</p>
                            <Input
                                type="month"
                                value={dateFilter.month}
                                onChange={(e) => setDateFilter({ ...dateFilter, type: 'month', month: e.target.value })}
                                className="!bg-transparent border-none p-0 h-auto font-bold"
                            />
                        </button>

                        <button
                            onClick={() => setDateFilter({ ...dateFilter, type: 'year' })}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${dateFilter.type === 'year' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                        >
                            <p className="text-[10px] font-black uppercase text-gray-600 mb-1">Lọc theo năm</p>
                            <select
                                value={dateFilter.year}
                                onChange={(e) => setDateFilter({ ...dateFilter, type: 'year', year: e.target.value })}
                                className="w-full bg-transparent border-none p-0 font-bold focus:ring-0 outline-none"
                            >
                                <option value="">Chọn năm...</option>
                                {[2024, 2025, 2026].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </button>

                        <button
                            onClick={() => setDateFilter({ ...dateFilter, type: 'range' })}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${dateFilter.type === 'range' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                        >
                            <p className="text-[10px] font-black uppercase text-gray-600 mb-1">Lọc theo khoảng</p>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={dateFilter.startDate}
                                    onChange={(e) => setDateFilter({ ...dateFilter, type: 'range', startDate: e.target.value })}
                                    className="!bg-transparent border-none p-0 h-auto font-bold w-full"
                                />
                                <span className="text-gray-300">-</span>
                                <Input
                                    type="date"
                                    value={dateFilter.endDate}
                                    onChange={(e) => setDateFilter({ ...dateFilter, type: 'range', endDate: e.target.value })}
                                    className="!bg-transparent border-none p-0 h-auto font-bold w-full"
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </Dialog>

            {/* Data Table */}
            <div className="flex-1 min-h-[600px]">
                <div className={`transition-all duration-500 ${openStatusDropdown ? 'pb-64' : 'pb-0'}`}>
                    <DataTable
                        data={filteredOrders}
                        columns={columns}
                        loading={loading}
                        searchable={false}
                        pageSize={20}
                        emptyStateIcon={<ShoppingCart size={48} className="text-gray-600" />}
                        emptyStateTitle="Không có đơn hàng"
                        emptyStateDescription="Chưa có đơn hàng nào để hiển thị"
                    />
                </div>
            </div>

            <Dialog
                open={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                title={
                    <div className="flex items-center gap-2 text-gray-900">
                        <Settings size={22} className="text-gray-600" />
                        <span className="font-black uppercase tracking-tight">Cài đặt bảng điều khiển</span>
                    </div>
                }
                size="lg"
                footer={null}
            >
                <div className="p-1">
                    <div className="flex border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setSettingsTab('view')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 flex-shrink-0 ${settingsTab === 'view' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <Calendar size={14} /> Hiển thị
                        </button>
                        <button
                            onClick={() => setSettingsTab('color')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 flex-shrink-0 ${settingsTab === 'color' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <Palette size={14} /> Màu sắc thẻ
                        </button>
                    </div>

                    {settingsTab === 'view' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 font-medium mb-4">Chọn phạm vi thời gian dữ liệu sẽ được hiển thị mặc định mỗi khi bạn truy cập trang này.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { id: 'all', label: 'Toàn bộ thời gian', desc: 'Hiển thị tất cả đơn hàng' },
                                    { id: 'week', label: 'Tuần này', desc: 'Hiển thị đơn hàng trong tuần' },
                                    { id: 'month', label: 'Tháng này', desc: 'Hiển thị đơn hàng trong tháng' },
                                    { id: 'quarter', label: 'Quý này', desc: 'Hiển thị đơn hàng trong quý' }
                                ].map((range) => (
                                    <button
                                        key={range.id}
                                        onClick={() => saveViewRange(range.id)}
                                        disabled={isSavingSettings}
                                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${viewRange === range.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                    >
                                        <div className="text-left">
                                            <p className={`font-black uppercase tracking-tight text-xs ${viewRange === range.id ? 'text-orange-600' : 'text-gray-700'}`}>{range.label}</p>
                                            <p className="text-[10px] text-gray-600 font-medium">{range.desc}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${viewRange === range.id ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-200'}`}>
                                            {viewRange === range.id && <CheckCircle size={12} fill="currentColor" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-sm text-gray-600 font-medium mb-4">Tùy chỉnh màu sắc cho các thẻ thống kê. Thay đổi sẽ được lưu tự động vào Database.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { id: 'total', label: 'Tổng đơn hàng', icon: <ShoppingCart size={14} /> },
                                    { id: 'pending', label: 'Chờ xác nhận', icon: <Clock size={14} /> },
                                    { id: 'completed', label: 'Hoàn thành', icon: <CheckCircle size={14} /> },
                                    { id: 'unpaid', label: 'Chưa thanh toán', icon: <CreditCard size={14} /> },
                                    { id: 'delivery', label: 'Giao hàng', icon: <Truck size={14} /> },
                                    { id: 'cancelled', label: 'Đơn đã hủy', icon: <XCircle size={14} /> },
                                    { id: 'revenue', label: 'Doanh thu', icon: <DollarSign size={14} /> }
                                ].map((card) => (
                                    <div key={card.id} className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div style={{ backgroundColor: cardColors[card.id] }} className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm">
                                                {card.icon}
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-tight text-gray-700">{card.label}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {PRESET_COLORS.map((color) => (
                                                <button
                                                    key={color.hex}
                                                    onClick={() => saveCardColor(card.id, color.hex)}
                                                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${cardColors[card.id] === color.hex ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`}
                                                    style={{ backgroundColor: color.hex }}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>

            {/* Order Detail Modal */}
            <OrderDetailModal
                open={Boolean(selectedOrder)}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
                onEdit={(order) => {
                    setSelectedOrder(null);
                    setEditingOrder(order);
                }}
            />

            {/* Order Edit Modal */}
            <OrderEditModal
                open={Boolean(editingOrder)}
                onClose={() => setEditingOrder(null)}
                order={editingOrder}
                products={products}
                onSave={async (id, data) => {
                    await handleUpdateStatus(id, data);
                    setEditingOrder(null);
                }}
            />

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={confirmDialog.open}
                onClose={closeConfirmDialog}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                description={confirmDialog.description}
                type={confirmDialog.type}
            />

            {/* Alert Modal */}
            <AlertModal
                open={alertModal.open}
                onClose={closeAlert}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />

            {/* Toast Notification */}
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </div>
    );
}
