/**
 * Admin Orders Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/orders/page.js
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    ShoppingCart, Package, TrendingUp, DollarSign, Search, Filter,
    Calendar, User, MapPin, CreditCard, Clock, CheckCircle, XCircle,
    AlertCircle, Truck, Eye, Edit, RefreshCw, Download, X, ChevronDown, Info, Inbox
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
        <div className="flex items-center justify-end gap-3">
            <Button
                variant="outline"
                onClick={onClose}
                className="!bg-gray-300 !hover:bg-gray-500 text-gray-700"
            >
                Hủy
            </Button>
            <Button
                variant={type === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                className="!hover:bg-opacity-90"
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
        <div className="flex items-center justify-end gap-3">
            <Button
                variant="outline"
                onClick={onClose}
                className="!bg-gray-300 !hover:bg-gray-500 text-gray-700"
            >
                Đóng
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
            size="lg"
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
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [error, setError] = useState(null);
    const [openStatusDropdown, setOpenStatusDropdown] = useState(null); // Track which row's dropdown is open

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

    // Calculate stats - Match với status tiếng Việt
    const stats = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter(o => o.status === 'Chờ xác nhận').length;
        const shipping = orders.filter(o => o.status === 'Đang vận chuyển').length;
        const completed = orders.filter(o => o.status === 'Hoàn thành').length;
        const cancelled = orders.filter(o => o.status === 'Đã hủy').length;
        const revenue = orders
            .filter(o => o.status === 'Hoàn thành')
            .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

        return { total, pending, shipping, completed, cancelled, revenue };
    }, [orders]);

    // Filter orders
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch =
                order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer_phone?.includes(searchTerm);

            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;

            return matchesSearch && matchesStatus && matchesPayment;
        });
    }, [orders, searchTerm, statusFilter, paymentFilter]);

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
                <div className="flex flex-col py-0.5">
                    <span className="text-base font-semibold text-gray-900 leading-tight">{row.original.recipient_name || 'N/A'}</span>
                    <span className="text-xs text-blue-600 mt-0.5 font-medium">{row.original.phone_number || 'N/A'}</span>
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
            header: 'Hình thức giao hàng',
            cell: ({ getValue }) => (
                <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-black tracking-tight text-white shadow-sm ${getValue() === 'delivery' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                    {getValue() === 'delivery' ? 'Giao tận nơi' : 'Tự đến lấy'}
                </span>
            ),
            size: 120
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black tracking-tight text-white shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95 ${config.color}`}
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black tracking-tight text-white shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95 ${config.color}`}
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
                <div className="flex items-center justify-center gap-1">
                    <Tooltip content="Xem chi tiết">
                        <button
                            onClick={() => setSelectedOrder(row.original)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                            <Eye size={18} />
                        </button>
                    </Tooltip>
                    <Tooltip content="Sửa">
                        <button
                            onClick={() => {
                                showAlert('Chức năng chỉnh sửa đang được phát triển', 'Thông báo', 'info');
                            }}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                        >
                            <Edit size={18} />
                        </button>
                    </Tooltip>
                </div>
            ),
            size: 100
        }
    ], [openStatusDropdown]);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                    <span className="text-sm text-gray-500">({stats.total} đơn)</span>
                </div>
                <Button
                    variant="outline"
                    startIcon={<RefreshCw size={16} />}
                    onClick={fetchOrders}
                    className="!bg-gray-500 !hover:bg-gray-600 text-white"
                >
                    Làm mới
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                {loading ? (
                    <>
                        <SkeletonStatsCard />
                        <SkeletonStatsCard />
                        <SkeletonStatsCard />
                        <SkeletonStatsCard />
                        <SkeletonStatsCard />
                        <SkeletonStatsCard />
                    </>
                ) : (
                    <>
                        {/* Total Orders */}
                        <div
                            onClick={() => {
                                setStatusFilter('all');
                                setSearchTerm('');
                            }}
                            className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
                        >
                            <ShoppingCart size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <ShoppingCart size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{stats.total}</p>
                                <p className="text-sm opacity-90">Tổng đơn hàng</p>
                            </div>
                        </div>

                        {/* Pending */}
                        <div
                            onClick={() => {
                                setStatusFilter('Chờ xác nhận');
                                setSearchTerm('');
                            }}
                            className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
                        >
                            <Clock size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <Clock size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{stats.pending}</p>
                                <p className="text-sm opacity-90">Chờ xác nhận</p>
                            </div>
                        </div>

                        {/* Shipping */}
                        <div
                            onClick={() => {
                                setStatusFilter('Đang vận chuyển');
                                setSearchTerm('');
                            }}
                            className="relative p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
                        >
                            <Truck size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <Truck size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{stats.shipping}</p>
                                <p className="text-sm opacity-90">Đang vận chuyển</p>
                            </div>
                        </div>

                        {/* Completed */}
                        <div
                            onClick={() => {
                                setStatusFilter('Hoàn thành');
                                setSearchTerm('');
                            }}
                            className="relative p-4 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
                        >
                            <CheckCircle size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <CheckCircle size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{stats.completed}</p>
                                <p className="text-sm opacity-90">Hoàn thành</p>
                            </div>
                        </div>

                        {/* Cancelled */}
                        <div
                            onClick={() => {
                                setStatusFilter('Đã hủy');
                                setSearchTerm('');
                            }}
                            className="relative p-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
                        >
                            <XCircle size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <XCircle size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{stats.cancelled}</p>
                                <p className="text-sm opacity-90">Đã hủy</p>
                            </div>
                        </div>

                        {/* Revenue */}
                        <div
                            onClick={() => {
                                setStatusFilter('Hoàn thành');
                                setSearchTerm('');
                            }}
                            className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
                        >
                            <DollarSign size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <DollarSign size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{formatCurrency(stats.revenue)}</p>
                                <p className="text-sm opacity-90">Doanh thu</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Filters */}
            <div className="p-4 mb-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo mã, tên, SĐT..."
                            startIcon={<Search size={16} />}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Chờ xác nhận">Chờ xác nhận</option>
                        <option value="Đã xác nhận">Đã xác nhận</option>
                        <option value="Đang vận chuyển">Đang vận chuyển</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Đã hủy">Đã hủy</option>
                    </select>

                    {/* Payment Filter */}
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="all">Tất cả thanh toán</option>
                        <option value="unpaid">Chưa Thanh toán</option>
                        <option value="paid">Đã Thanh toán</option>
                        <option value="cancelled">Hủy Thanh toán</option>
                    </select>

                    {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all') && (
                        <Button
                            size="sm"
                            variant="ghost"
                            startIcon={<X size={14} />}
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setPaymentFilter('all');
                            }}
                        >
                            Xóa lọc
                        </Button>
                    )}
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 min-h-[600px]">
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
