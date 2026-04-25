/**
 * Admin Orders Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/orders/page.js
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    ShoppingCart, Package, TrendingUp, DollarSign, Search, Filter,
    Calendar, User, MapPin, CreditCard, Clock, CheckCircle, XCircle,
    AlertCircle, Truck, Eye, Edit, RefreshCw, Download, X, ChevronDown, Info, Inbox, Settings
} from 'lucide-react';
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
                className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 bg-white text-gray-400 hover:text-gray-600 font-black uppercase text-[11px] tracking-widest px-6 transition-all"
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

// Order Detail Modal
const OrderDetailModal = ({ open, onClose, order }) => {
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
        <div className="flex items-center justify-end gap-3 w-full">
            <Button
                onClick={onClose}
                className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 bg-white text-gray-400 hover:text-gray-600 font-black uppercase text-[11px] tracking-widest px-8 transition-all active:scale-95 shadow-sm"
            >
                Đóng cửa sổ
            </Button>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title, color = '#3b82f6' }) => (
        <div className="flex items-center gap-2 mb-3">
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
            >
                <Icon size={16} style={{ color }} />
            </div>
            <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">{title}</span>
        </div>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            size="xl"
            title={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <ShoppingCart size={22} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-black text-gray-900 block">Đơn hàng #{order.order_code}</span>
                        <p className="text-xs text-gray-500 font-medium">Chi tiết và lịch sử giao dịch</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <SectionHeader icon={User} title="Khách hàng" color="#3b82f6" />
                            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Người nhận</p>
                                    <p className="text-base font-black text-gray-900">{orderData.recipient_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Số điện thoại</p>
                                    <p className="text-base font-bold text-blue-600">{orderData.phone_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Địa chỉ giao hàng</p>
                                    <p className="text-sm font-medium text-gray-700 leading-relaxed">{orderData.delivery_address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className="space-y-4">
                            <SectionHeader icon={Package} title="Vận chuyển & Thanh toán" color="#10b981" />
                            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1.5">Trạng thái đơn</p>
                                        <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight text-white shadow-sm ${STATUS_CONFIG[orderData.status]?.color}`}>
                                            {STATUS_CONFIG[orderData.status]?.label}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1.5">Thanh toán</p>
                                        <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight text-white shadow-sm ${PAYMENT_CONFIG[orderData.payment_status]?.color}`}>
                                            {PAYMENT_CONFIG[orderData.payment_status]?.label}
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-50 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Phương thức</p>
                                        <p className="text-sm font-bold text-gray-900">{orderData.payment_method || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Giao hàng</p>
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
                        <SectionHeader icon={Inbox} title="Danh sách món đã đặt" color="#8b5cf6" />
                        <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                            {/* Table Header */}
                            <div className="bg-gray-50/80 grid grid-cols-12 gap-2 p-4 text-[11px] font-black text-gray-500 uppercase tracking-wider border-b border-gray-100">
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
                                            <div key={index} className="grid grid-cols-12 gap-2 p-4 text-sm hover:bg-blue-50/30 transition-colors">
                                                <div className="col-span-6">
                                                    <p className="font-bold text-gray-900 leading-tight">{item.name || item.product_name || 'N/A'}</p>
                                                    {item.variant && (
                                                        <p className="text-[11px] text-blue-500 font-medium mt-1 inline-block bg-blue-50 px-2 py-0.5 rounded-full">
                                                            {item.variant}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="col-span-2 text-right text-gray-500 font-medium">
                                                    {formatCurrency(itemPrice)}
                                                </div>
                                                <div className="col-span-1 text-center font-black text-gray-900">
                                                    {itemQuantity}
                                                </div>
                                                <div className="col-span-3 text-right font-black text-blue-600">
                                                    {formatCurrency(itemTotal)}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center text-gray-400 text-sm font-medium italic">
                                        Không tìm thấy danh sách món
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        {/* Note */}
                        {orderData.note ? (
                            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 h-fit self-start">
                                <p className="text-[11px] font-black text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    Ghi chú từ khách
                                </p>
                                <p className="text-sm text-amber-900 font-medium leading-relaxed italic">{orderData.note}</p>
                            </div>
                        ) : <div />}

                        <div className="bg-gray-50/50 rounded-3xl p-6 space-y-3 border border-gray-100 shadow-inner">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-500">Tạm tính</span>
                                <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                            </div>

                            {shippingFee > 0 && (
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-500">Phí vận chuyển</span>
                                    <span className="text-gray-900">{formatCurrency(shippingFee)}</span>
                                </div>
                            )}

                            {discount > 0 && (
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-500">
                                        {voucherCode ? `Khuyến mãi (${voucherCode})` : 'Khuyến mãi'}
                                    </span>
                                    <span className="text-red-600">-{formatCurrency(discount)}</span>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-black text-gray-900 uppercase">Tổng cộng</span>
                                    <span className="text-2xl font-black text-red-600 drop-shadow-sm">{formatCurrency(total)}</span>
                                </div>
                                <p className="text-[10px] text-right text-gray-400 font-medium mt-1 italic">Đã bao gồm các loại thuế phí</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Dialog>
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
    const [error, setError] = useState(null);
    const [openStatusDropdown, setOpenStatusDropdown] = useState(null); // Track which row's dropdown is open

    // View range settings (persisted)
    const [viewRange, setViewRange] = useState('all');
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedRange = localStorage.getItem('admin_orders_view_range');
            if (savedRange) setViewRange(savedRange);
        }
    }, []);

    const saveViewRange = (range) => {
        setViewRange(range);
        if (typeof window !== 'undefined') {
            localStorage.setItem('admin_orders_view_range', range);
        }
        setIsSettingsModalOpen(false);
        showToast(`Đã lưu cài đặt hiển thị mặc định: ${range === 'all' ? 'Tất cả' : range === 'week' ? 'Tuần này' : range === 'month' ? 'Tháng này' : 'Quý này'}`, 'success');
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
        const unpaid = filteredOrders.filter(o => o.payment_status === 'unpaid').length;
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
                    <span className="text-[11px] text-blue-600 mt-1 font-bold uppercase tracking-tighter">{row.original.phone_number || 'N/A'}</span>
                </div>
            ),
            size: 180
        },
        {
            accessorKey: 'delivery_address',
            header: 'Địa chỉ',
            cell: ({ getValue }) => (
                <span className="text-sm text-gray-600 line-clamp-2">{getValue() || 'N/A'}</span>
            ),
            size: 200
        },
        {
            accessorKey: 'total_amount',
            header: 'Tổng tiền hàng',
            cell: ({ getValue }) => (
                <span className="text-md font-black text-red-600">{formatCurrency(getValue())}</span>
            ),
            size: 130
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
            size: 130
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái đơn',
            cell: ({ getValue, row }) => {
                const status = getValue();
                const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-500', textColor: 'text-gray-700' };
                const isOpen = openStatusDropdown === row.original.id;
                const statusOptions = Object.keys(STATUS_CONFIG);

                return (
                    <div className="relative">
                        <div
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg border border-white/20 cursor-pointer transition-all hover:scale-105 active:scale-95 ${config.color}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenStatusDropdown(isOpen ? null : row.original.id);
                            }}
                        >
                            {config.label}
                            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setOpenStatusDropdown(null)}
                                />
                                {/* Dropdown Menu */}
                                <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[180px] overflow-hidden">
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
                                                        showConfirmDialog(
                                                            'Xác nhận thay đổi trạng thái',
                                                            `Bạn có chắc chắn muốn chuyển đơn hàng #${row.original.order_code} sang "${optionConfig.label}" không?`,
                                                            'info',
                                                            () => {
                                                                handleUpdateStatus(row.original.id, { status: statusKey });
                                                            }
                                                        );
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
                            </>
                        )}
                    </div>
                );
            },
            size: 150
        },
        {
            accessorKey: 'payment_status',
            header: 'Thanh toán',
            cell: ({ getValue, row }) => {
                const status = getValue();
                const config = PAYMENT_CONFIG[status] || { label: status, color: 'bg-gray-500', textColor: 'text-gray-700' };
                const isOpen = openStatusDropdown === `payment-${row.original.id}`;
                const paymentOptions = Object.keys(PAYMENT_CONFIG);

                return (
                    <div className="relative">
                        <div
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg border border-white/20 cursor-pointer transition-all hover:scale-105 active:scale-95 ${config.color}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenStatusDropdown(isOpen ? null : `payment-${row.original.id}`);
                            }}
                        >
                            {config.label}
                            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setOpenStatusDropdown(null)}
                                />
                                {/* Dropdown Menu */}
                                <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[180px] overflow-hidden">
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
                                                        showConfirmDialog(
                                                            'Xác nhận thay đổi thanh toán',
                                                            `Bạn có chắc chắn muốn chuyển đơn hàng #${row.original.order_code} sang "${optionConfig.label}" không?`,
                                                            'info',
                                                            () => {
                                                                handleUpdateStatus(row.original.id, { payment_status: paymentKey });
                                                            }
                                                        );
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
                            </>
                        )}
                    </div>
                );
            },
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
                        <span className="text-xs text-gray-500 font-medium">
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
                            className="w-10 h-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-50"
                        >
                            <Eye size={18} />
                        </button>
                    </Tooltip>
                    <Tooltip content="In hóa đơn">
                        <button
                            onClick={() => window.print()}
                            className="w-10 h-10 bg-gray-50 text-gray-500 hover:bg-gray-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-gray-50"
                        >
                            <Download size={18} />
                        </button>
                    </Tooltip>
                </div>
            ),
            size: 150
        }
    ], [openStatusDropdown]);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2.5 mb-0.5">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-lg shadow-orange-100/50">
                            <ShoppingCart size={18} fill="currentColor" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý Đơn hàng</h1>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-0.5">Xử lý và theo dõi tiến độ giao nhận ({stats.total} đơn hàng)</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        startIcon={<Settings size={16} />}
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="flex items-center justify-center h-10 w-10 !rounded-2xl border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 shadow-sm transition-all active:scale-95"
                    />
                    <Button
                        startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
                        onClick={fetchOrders}
                        className="flex items-center justify-center gap-2 h-10 !rounded-2xl border border-gray-200 text-gray-500 bg-gray-500 hover:bg-gray-600 font-black uppercase text-xs tracking-widest px-6 shadow-sm transition-all active:scale-95"
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4 px-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phạm vi mặc định:</span>
                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest">
                    {viewRange === 'all' ? 'Toàn thời gian' : viewRange === 'week' ? 'Tuần này' : viewRange === 'month' ? 'Tháng này' : 'Quý này'}
                </span>
            </div>

            {/* Stats Cards Grid - 5 cards per row on Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-5">
                {loading ? (
                    Array(7).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
                ) : (
                    <>
                        <div
                            onClick={() => setStatusFilter('all')}
                            className={`group relative p-4 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'all' ? 'ring-4 ring-orange-300 ring-offset-2' : 'shadow-orange-100'}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <ShoppingCart size={90} fill="currentColor" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <ShoppingCart size={18} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.total}</p>
                                    <p className="text-[15px] font-black uppercase tracking-[0.1em] opacity-80 leading-none">Tổng đơn hàng</p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('Chờ xác nhận')}
                            className={`group relative p-4 rounded-[24px] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'Chờ xác nhận' ? 'ring-4 ring-amber-300 ring-offset-2' : 'shadow-amber-100'}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <Clock size={90} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.pending}</p>
                                    <p className="text-[15px] font-black uppercase tracking-[0.1em] opacity-80 leading-none">Chờ xác nhận</p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('Hoàn thành')}
                            className={`group relative p-4 rounded-[24px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'Hoàn thành' ? 'ring-4 ring-emerald-300 ring-offset-2' : 'shadow-emerald-100'}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <CheckCircle size={90} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <CheckCircle size={18} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.completed}</p>
                                    <p className="text-[15px] font-black uppercase tracking-[0.1em] opacity-80 leading-none">Đã hoàn thành</p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setPaymentFilter('unpaid')}
                            className={`group relative p-4 rounded-[24px] bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${paymentFilter === 'unpaid' ? 'ring-4 ring-amber-300 ring-offset-2' : ''}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <CreditCard size={90} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <CreditCard size={18} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.unpaid}</p>
                                    <p className="text-[15px] font-black uppercase tracking-[0.15em] opacity-80 leading-none">Chưa thanh toán</p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => {
                                setDeliveryFilter('delivery');
                                setStatusFilter('all');
                                setPaymentFilter('all');
                            }}
                            className={`group relative p-4 rounded-[24px] bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${deliveryFilter === 'delivery' ? 'ring-4 ring-cyan-300 ring-offset-2' : ''}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <Truck size={90} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <Truck size={18} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.delivery}</p>
                                    <p className="text-[15px] font-black uppercase tracking-[0.15em] opacity-80 leading-none">Giao tận nơi</p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('Đã hủy')}
                            className={`group relative p-4 rounded-[24px] bg-gradient-to-br from-red-600 to-pink-700 text-white shadow-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'Đã hủy' ? 'ring-4 ring-red-300 ring-offset-2' : ''}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <XCircle size={90} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <XCircle size={18} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.cancelled}</p>
                                    <p className="text-[15px] font-black uppercase tracking-[0.15em] opacity-80 leading-none">Đơn đã hủy</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`group relative p-4 rounded-[24px] bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-blue-100`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <DollarSign size={90} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <DollarSign size={18} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{formatCurrency(stats.revenue).replace('₫', '')}</p>
                                    <p className="text-[15px] font-black uppercase tracking-[0.15em] opacity-80 leading-none">Doanh thu (VNĐ)</p>
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
                            startIcon={<Search size={18} className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />}
                            className="!rounded-2xl border-gray-200 bg-gray-50/50 font-bold uppercase tracking-tight focus:bg-white transition-all pl-12"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsDateModalOpen(true)}
                        className={`flex items-center gap-2 px-6 py-2.5 text-[11px] font-black rounded-xl transition-all active:scale-95 uppercase tracking-widest border ${dateFilter.type !== 'all' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Calendar size={16} />
                        {dateFilter.type === 'all' ? 'Bộ lọc thời gian' : 'Đã lọc thời gian'}
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
                            className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-red-500 hover:text-red-600 bg-red-50 rounded-xl transition-all active:scale-95 uppercase tracking-widest"
                        >
                            <X size={14} />
                            Xóa bộ lọc
                        </button>
                    )}
                    <div className="h-8 w-px bg-gray-200" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredOrders.length} đơn hàng</span>
                </div>
            </div>

            {/* Date Filter Modal */}
            <Dialog
                open={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                title={
                    <div className="flex items-center gap-2 text-orange-600">
                        <Calendar size={22} />
                        <span className="font-black uppercase tracking-tight">Bộ lọc thời gian nâng cao</span>
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
                            className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 bg-gray-400 text-gray-400 hover:bg-gray-500 font-black uppercase text-[10px] tracking-widest px-6"
                        >
                            Hủy lọc
                        </Button>
                        <Button
                            onClick={() => setIsDateModalOpen(false)}
                            className="flex items-center justify-center h-10 !rounded-2xl bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-orange-100"
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
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Lọc theo ngày</p>
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
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Lọc theo tháng</p>
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
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Lọc theo năm</p>
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
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Lọc theo khoảng</p>
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
            <div className={`flex-1 min-h-[600px] transition-all duration-500 ${openStatusDropdown ? 'pb-52' : 'pb-0'}`}>
                <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <DataTable
                        data={filteredOrders}
                        columns={columns}
                        loading={loading}
                        searchable={false}
                        pageSize={20}
                        emptyStateIcon={<ShoppingCart size={48} className="text-gray-400" />}
                        emptyStateTitle="Không có đơn hàng"
                        emptyStateDescription="Chưa có đơn hàng nào để hiển thị"
                    />
                </div>
            </div>

            {/* Settings Modal */}
            <Dialog
                open={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                title={
                    <div className="flex items-center gap-2 text-gray-900">
                        <Settings size={22} className="text-gray-400" />
                        <span className="font-black uppercase tracking-tight">Cài đặt hiển thị mặc định</span>
                    </div>
                }
                size="md"
                footer={null}
            >
                <div className="space-y-4 p-1">
                    <p className="text-sm text-gray-500 font-medium mb-4">Chọn phạm vi thời gian dữ liệu sẽ được hiển thị mặc định mỗi khi bạn truy cập trang này.</p>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: 'all', label: 'Toàn bộ thời gian', desc: 'Hiển thị tất cả đơn hàng từ trước đến nay' },
                            { id: 'week', label: 'Tuần này', desc: 'Chỉ hiển thị đơn hàng trong tuần hiện tại' },
                            { id: 'month', label: 'Tháng này', desc: 'Chỉ hiển thị đơn hàng trong tháng hiện tại' },
                            { id: 'quarter', label: 'Quý này', desc: 'Chỉ hiển thị đơn hàng trong quý hiện tại' }
                        ].map((range) => (
                            <button
                                key={range.id}
                                onClick={() => saveViewRange(range.id)}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${viewRange === range.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                            >
                                <div className="text-left">
                                    <p className={`font-black uppercase tracking-tight ${viewRange === range.id ? 'text-orange-600' : 'text-gray-700'}`}>{range.label}</p>
                                    <p className="text-[11px] text-gray-400 font-medium">{range.desc}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${viewRange === range.id ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-200'}`}>
                                    {viewRange === range.id && <CheckCircle size={14} fill="currentColor" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </Dialog>

            {/* Order Detail Modal */}
            <OrderDetailModal
                open={Boolean(selectedOrder)}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
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
