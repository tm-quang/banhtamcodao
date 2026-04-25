// src/components/admin/OrderTable.js
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Paper, Typography, Chip, IconButton, TextField, Menu, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
    Tooltip, alpha, InputAdornment, Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Eye, Edit, Search, ShoppingCart, Clock, CheckCircle, Truck, XCircle, X, Phone, Package } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subDays, subWeeks, subMonths, subQuarters, subYears, isWithinInterval } from 'date-fns';
import OrderDetailModal from './OrderDetailModal';
import OrderEditModal from './OrderEditModal';
import { useToast } from '@/context/ToastContext';

const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

// Compact Stats Badge
const StatBadge = ({ label, value, color }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color}`}>
        <span className="text-sm font-bold">{value}</span>
        <span className="text-xs opacity-80">{label}</span>
    </div>
);

// Confirmation Dialog
const ConfirmationDialog = ({ open, onClose, onConfirm, title, message, customActions }) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        PaperProps={{
            sx: {
                borderRadius: 3,
                boxShadow: '0 25px 50px -10px rgba(0,0,0,0.25)',
            }
        }}
    >
        <DialogTitle sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontWeight: 500,
        }}>
            <Box sx={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '500'
            }}>?</Box>
            {title}
        </DialogTitle>
        <DialogContent><DialogContentText>{message}</DialogContentText></DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
            {customActions ? customActions : (
                <>
                    <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Hủy</Button>
                    <Button onClick={onConfirm} variant="contained" sx={{
                        borderRadius: 2,
                        fontWeight: 500,
                        backgroundColor: '#f97316',
                        '&:hover': { backgroundColor: '#ea580c' }
                    }}>Đồng ý</Button>
                </>
            )}
        </DialogActions>
    </Dialog>
);

export default function OrderTable({ orders: initialOrders }) {
    const [orders, setOrders] = useState(initialOrders);
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [timeRange, setTimeRange] = useState('month'); // 'day', 'week', 'month', 'quarter', 'year'
    const [viewingOrderId, setViewingOrderId] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, customActions: null });
    const [statusMenu, setStatusMenu] = useState({ anchorEl: null, row: null, options: [] });

    useEffect(() => { setOrders(initialOrders); }, [initialOrders]);

    // Get date range based on timeRange filter
    const getDateRange = (range) => {
        const now = new Date();
        switch (range) {
            case 'day':
                const todayStart = new Date(now);
                todayStart.setHours(0, 0, 0, 0);
                const todayEnd = new Date(now);
                todayEnd.setHours(23, 59, 59, 999);
                return { start: todayStart, end: todayEnd };
            case 'week':
                return { start: startOfWeek(now), end: endOfWeek(now) };
            case 'month':
                return { start: startOfMonth(now), end: endOfMonth(now) };
            case 'quarter':
                return { start: startOfQuarter(now), end: endOfQuarter(now) };
            case 'year':
                return { start: startOfYear(now), end: endOfYear(now) };
            default:
                return { start: startOfMonth(now), end: endOfMonth(now) };
        }
    };

    // Filter orders by time range
    const timeFilteredOrders = useMemo(() => {
        if (!timeRange) return orders;
        const { start, end } = getDateRange(timeRange);
        return orders.filter(order => {
            const orderDate = new Date(order.order_time);
            return isWithinInterval(orderDate, { start, end });
        });
    }, [orders, timeRange]);

    // Stats based on filtered orders
    const stats = useMemo(() => {
        const filtered = timeFilteredOrders;
        const completed = filtered.filter(o => o.status === 'Hoàn thành').length;
        const cancelled = filtered.filter(o => o.status === 'Đã hủy').length;
        const error = filtered.filter(o => {
            // Đơn có lỗi: đã hủy hoặc có vấn đề thanh toán sau khi hoàn thành
            return o.status === 'Đã hủy' || (o.status === 'Hoàn thành' && o.payment_status === 'unpaid');
        }).length;
        const totalValue = filtered.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        
        return {
            total: filtered.length,
            pending: filtered.filter(o => o.status === 'Chờ xác nhận').length,
            shipping: filtered.filter(o => o.status === 'Đang vận chuyển').length,
            completed,
            cancelled,
            error,
            totalValue,
        };
    }, [timeFilteredOrders]);

    const handleUpdate = async (orderId, data, successMessage) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Cập nhật thất bại');

            setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, ...data } : o)));
            showToast(successMessage, 'success');
            return true;
        } catch (error) {
            showToast(error.message, 'error');
            return false;
        }
    };

    const getNextStatusOptions = (current) => {
        switch (current) {
            case 'Chờ xác nhận': return ['Đã xác nhận', 'Đã hủy'];
            case 'Đã xác nhận': return ['Đang vận chuyển', 'Đã hủy'];
            case 'Đang vận chuyển': return ['Hoàn thành', 'Đã hủy'];
            default: return [];
        }
    };

    const openStatusMenu = (event, row) => {
        const options = getNextStatusOptions(row.status);
        if (options.length > 0) {
            setStatusMenu({ anchorEl: event.currentTarget, row, options });
        }
    };

    const handleSelectNextStatus = async (nextStatus) => {
        const row = statusMenu.row;
        if (!row) return;
        if (nextStatus === 'Đã hủy') {
            setConfirm({
                isOpen: true,
                title: 'Xác nhận hủy đơn',
                message: `Bạn chắc chắn muốn hủy đơn #${row.order_code}? Trạng thái thanh toán cũng sẽ được đặt thành "Hủy T.Toán".`,
                onConfirm: async () => {
                    // Tự động set payment_status thành "cancelled" khi hủy đơn
                    await handleUpdate(row.id, { status: nextStatus, payment_status: 'cancelled' }, 'Đã hủy đơn hàng.');
                    setConfirm({ isOpen: false });
                },
            });
        } else {
            await handleUpdate(row.id, { status: nextStatus }, 'Đã cập nhật trạng thái đơn.');
        }
        setStatusMenu({ anchorEl: null, row: null, options: [] });
    };

    const handlePaymentClick = (row) => {
        if (row.payment_status === 'unpaid') {
            setConfirm({
                isOpen: true,
                title: 'Xác nhận thanh toán',
                message: `Chuyển đơn hàng #${row.order_code} sang "Đã thanh toán"?`,
                onConfirm: () => {
                    handleUpdate(row.id, { payment_status: 'paid' }, 'Đã cập nhật thanh toán!');
                    setConfirm({ isOpen: false });
                },
            });
        }
    };

    const handleSaveEditModal = async (data) => {
        const success = await handleUpdate(data.id, data, 'Đã cập nhật thông tin đơn hàng!');
        if (success) setEditingOrder(null);
    };

    const filteredOrders = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return timeFilteredOrders.filter(order => {
            const searchMatch = !search ||
                order.order_code.toLowerCase().includes(search) ||
                order.recipient_name?.toLowerCase().includes(search) ||
                order.phone_number?.includes(search);
            const statusMatch = !statusFilter || order.status === statusFilter;
            const paymentMatch = !paymentFilter || order.payment_status === paymentFilter;
            return searchMatch && statusMatch && paymentMatch;
        });
    }, [timeFilteredOrders, searchTerm, statusFilter, paymentFilter]);

    // ============================================
    // CHỈNH MÀU BADGE TRẠNG THÁI ĐƠN HÀNG Ở ĐÂY
    // ============================================
    const getStatusChip = (status) => {
        const config = {
            'Chờ xác nhận': { color: '#FFFFFF', bg: '#f59e0b', icon: Clock }, // Màu cam
            'Đã xác nhận': { color: '#FFFFFF', bg: '#3B82F6', icon: CheckCircle }, // Màu xanh dương
            'Đang vận chuyển': { color: '#FFFFFF', bg: '#0ea5e9', icon: Truck }, // Màu xanh cyan
            'Hoàn thành': { color: '#FFFFFF', bg: '#16a34a', icon: CheckCircle }, // Màu xanh lá
            'Đã hủy': { color: '#FFFFFF', bg: '#EF4444', icon: XCircle }, // Màu đỏ
        };
        const cfg = config[status] || { color: '#FFFFFF', bg: '#6B7280' }; // Màu xám mặc định
        return (
            <Chip
                label={status}
                size="medium"
                sx={{
                    bgcolor: cfg.bg, // Màu nền badge
                    color: cfg.color, // Màu chữ
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    height: '32px',
                    px: 1.5,
                    borderRadius: '10px', // Bo góc xl
                    cursor: 'pointer',
                    '& .MuiChip-label': {
                        px: 1,
                    },
                }}
            />
        );
    };

    const columns = [
        {
            field: 'order_code',
            headerName: 'Mã đơn',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <span className="text-sm font-bold text-blue-600">{params.value}</span>
                </Box>
            )
        },
        {
            field: 'order_time',
            headerName: 'Thời gian',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <span className="text-xs text-gray-600">
                        {format(new Date(params.value), 'HH:mm dd/MM')}
                    </span>
                </Box>
            )
        },
        {
            field: 'recipient_name',
            headerName: 'Khách hàng',
            flex: 1,
            minWidth: 200,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%' }}>
                    <Box sx={{ textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.2 }}>
                            {params.value || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', lineHeight: 1.2 }}>
                            {params.row.phone_number || 'N/A'}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: 'delivery_address',
            headerName: 'Địa chỉ',
            flex: 1,
            minWidth: 250,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%', px: 1 }}>
                    <Typography 
                        sx={{ 
                            fontSize: '0.875rem', 
                            color: 'text.primary',
                            textAlign: 'left',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.3
                        }}
                    >
                        {params.value || 'N/A'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'delivery_method',
            headerName: 'Hình thức giao',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            // ============================================
            // CHỈNH MÀU BADGE PHƯƠNG THỨC GIAO Ở ĐÂY
            // ============================================
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Chip
                        label={params.value === 'delivery' ? 'Giao hàng' : 'Tự đến lấy'}
                        size="medium"
                        sx={{
                            bgcolor: params.value === 'delivery' ? '#3B82F6' : '#16A34A', // Ship: xanh dương, Lấy: xanh lá
                            color: '#FFFFFF',
                            fontWeight: 500,
                            fontSize: '0.85rem',
                            height: '32px',
                            px: 1.5,
                            borderRadius: '10px', // Bo góc xl
                            '& .MuiChip-label': {
                                px: 1,
                            },
                        }}
                    />
                </Box>
            )
        },
        {
            field: 'payment_status',
            headerName: 'Thanh toán',
            width: 140,
            headerAlign: 'center',
            align: 'center',
            // ============================================
            // CHỈNH MÀU BADGE THANH TOÁN Ở ĐÂY
            // ============================================
            renderCell: (params) => {
                const getPaymentLabel = (value) => {
                    if (value === 'paid') return 'Đã T.Toán';
                    if (value === 'cancelled') return 'Hủy T.Toán';
                    return 'Chưa T.Toán';
                };
                const getPaymentColor = (value) => {
                    if (value === 'paid') return '#16a34a'; // Xanh lá
                    if (value === 'cancelled') return '#EF4444'; // Đỏ
                    return '#f59e0b'; // Cam
                };
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Chip
                            label={getPaymentLabel(params.value)}
                            size="medium"
                            onClick={() => params.value !== 'cancelled' && handlePaymentClick(params.row)}
                            sx={{
                                bgcolor: getPaymentColor(params.value),
                                color: '#FFFFFF',
                                fontWeight: 500,
                                fontSize: '0.85rem',
                                height: '32px',
                                px: 1.5,
                                borderRadius: '10px', // Bo góc xl
                                cursor: params.value === 'unpaid' ? 'pointer' : 'default',
                                '& .MuiChip-label': {
                                    px: 1,
                                },
                            }}
                        />
                    </Box>
                );
            }
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 160,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box 
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                    onClick={(e) => openStatusMenu(e, params.row)}
                >
                    {getStatusChip(params.value)}
                </Box>
            )
        },
        {
            field: 'total_amount',
            headerName: 'Tổng tiền',
            width: 140,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <span className="text-sm font-bold text-red-600">
                        {formatCurrency(params.value)}
                    </span>
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: '',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Xem" arrow>
                            <IconButton
                                size="medium"
                                onClick={() => setViewingOrderId(params.row.id)}
                                sx={{ 
                                    color: '#3b82f6', 
                                    '&:hover': { bgcolor: alpha('#3b82f6', 0.1) },
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <Eye size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Sửa" arrow>
                            <IconButton
                                size="medium"
                                onClick={() => setEditingOrder(params.row)}
                                sx={{ 
                                    color: '#f97316', 
                                    '&:hover': { bgcolor: alpha('#f97316', 0.1) },
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <Edit size={20} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
            )
        }
    ];

    const hasFilters = searchTerm || statusFilter || paymentFilter;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                    <span className="text-sm text-gray-500">({stats.total} đơn)</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                {/* Tổng đơn hàng */}
                {/* ============================================ */}
                {/* CHỈNH CHIỀU CAO THẺ Ở ĐÂY: p (padding) hoặc minHeight/height */}
                {/* ============================================ */}
                <Box sx={{ 
                    p: 2,
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    {/* Icon nền mờ */}
                    <ShoppingCart 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    {/* Icon chính ở top-left */}
                    <div className="relative z-10">
                        <ShoppingCart size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.total}</p>
                        <p className="text-sm opacity-90">
                            Tổng đơn hàng
                            {timeRange === 'day' && ' (Hôm nay)'}
                            {timeRange === 'week' && ' (Tuần này)'}
                            {timeRange === 'month' && ' (Tháng này)'}
                            {timeRange === 'quarter' && ' (Quý này)'}
                            {timeRange === 'year' && ' (Năm này)'}
                        </p>
                    </div>
                </Box>
                {/* Đơn hoàn tất */}
                <Box sx={{ 
                    p: 2, 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <CheckCircle 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <CheckCircle size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.completed}</p>
                        <p className="text-sm opacity-90">Đơn hoàn tất</p>
                    </div>
                </Box>
                {/* Đơn chờ xác nhận */}
                <Box sx={{ 
                    p: 2, 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <Clock 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <Clock size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.pending}</p>
                        <p className="text-sm opacity-90">Đơn chờ xác nhận</p>
                    </div>
                </Box>
                {/* Đơn hàng chờ giao */}
                <Box sx={{ 
                    p: 2, 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <Truck 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <Truck size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.shipping}</p>
                        <p className="text-sm opacity-90">Đơn hàng chờ giao</p>
                    </div>
                </Box>
                {/* Đã hủy */}
                <Box sx={{ 
                    p: 2, 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <XCircle 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <XCircle size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.cancelled}</p>
                        <p className="text-sm opacity-90">Đã hủy</p>
                    </div>
                </Box>
            </div>

            {/* Filter & Stats Row */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <div className="flex flex-wrap items-center gap-3">
                    {/* Time Range Filter */}
                    <TextField
                        select
                        variant="outlined"
                        size="small"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        sx={{
                            width: 140,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.8rem',
                            }
                        }}
                    >
                        <MenuItem value="day">Hôm nay</MenuItem>
                        <MenuItem value="week">Tuần này</MenuItem>
                        <MenuItem value="month">Tháng này</MenuItem>
                        <MenuItem value="quarter">Quý này</MenuItem>
                        <MenuItem value="year">Năm này</MenuItem>
                    </TextField>

                    <div className="h-6 w-px bg-gray-300 hidden md:block" />

                    {/* Search */}
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={16} className="text-gray-400" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: 180,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.875rem',
                            }
                        }}
                    />

                    {/* Status Filter */}
                    <TextField
                        select
                        variant="outlined"
                        size="small"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        SelectProps={{
                            displayEmpty: true,
                        }}
                        sx={{
                            width: 140,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.8rem',
                            }
                        }}
                    >
                        <MenuItem value="">
                            <em>Tất cả TT</em>
                        </MenuItem>
                        <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
                        <MenuItem value="Đã xác nhận">Đã xác nhận</MenuItem>
                        <MenuItem value="Đang vận chuyển">Đang vận chuyển</MenuItem>
                        <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                        <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                    </TextField>

                    {/* Payment Filter */}
                    <TextField
                        select
                        variant="outlined"
                        size="small"
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        SelectProps={{
                            displayEmpty: true,
                        }}
                        sx={{
                            width: 140,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.8rem',
                            }
                        }}
                    >
                        <MenuItem value="">
                            <em>Tất cả</em>
                        </MenuItem>
                        <MenuItem value="paid">Đã thanh toán</MenuItem>
                        <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
                        <MenuItem value="cancelled">Hủy T.Toán</MenuItem>
                    </TextField>

                    {hasFilters && (
                        <Button
                            size="small"
                            startIcon={<X size={14} />}
                            onClick={() => { setSearchTerm(''); setStatusFilter(''); setPaymentFilter(''); }}
                            sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.8rem' }}
                        >
                            Xóa lọc
                        </Button>
                    )}
                </div>
            </Paper>

            {/* Data Table */}
            {/* ============================================ */}
            {/* CHỈNH CHIỀU CAO BẢNG Ở ĐÂY: minHeight và height của DataGrid */}
            {/* ============================================ */}
            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: '600px', // Tăng chiều cao tối thiểu của bảng
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    '& .MuiDataGrid-root': { border: 'none' },
                    '& .MuiDataGrid-columnHeaders': {
                        bgcolor: '#f8fafc',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    },
                    '& .MuiDataGrid-columnHeader': {
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        color: 'text.secondary',
                    },
                    '& .MuiDataGrid-row': {
                        '&:hover': { bgcolor: alpha('#3b82f6', 0.04) }
                    },
                    '& .MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid',
                        borderColor: alpha('#000', 0.05),
                        justifyContent: 'center',
                    },
                    '& .MuiDataGrid-cell--textLeft': {
                        justifyContent: 'flex-start',
                    },
                    '& .MuiDataGrid-cell--textRight': {
                        justifyContent: 'flex-end',
                    },
                }}
            >
                <DataGrid
                    rows={filteredOrders}
                    columns={columns}
                    rowHeight={64}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 50 } },
                        sorting: { sortModel: [{ field: 'order_time', sort: 'desc' }] },
                    }}
                    localeText={{
                        noRowsLabel: 'Không có đơn hàng nào',
                        MuiTablePagination: {
                            labelRowsPerPage: 'Hiển thị:',
                            labelDisplayedRows: ({ from, to, count }) => `${from}-${to} / ${count}`,
                        }
                    }}
                />
            </Paper>

            {/* Modals */}
            <OrderDetailModal orderId={viewingOrderId} open={Boolean(viewingOrderId)} onClose={() => setViewingOrderId(null)} />
            <OrderEditModal open={Boolean(editingOrder)} onClose={() => setEditingOrder(null)} onSave={handleSaveEditModal} order={editingOrder} />
            <ConfirmationDialog
                open={confirm.isOpen}
                onClose={() => setConfirm({ isOpen: false })}
                onConfirm={confirm.onConfirm}
                title={confirm.title}
                message={confirm.message}
                customActions={confirm.customActions}
            />
            <Menu
                anchorEl={statusMenu.anchorEl}
                open={Boolean(statusMenu.anchorEl)}
                onClose={() => setStatusMenu({ anchorEl: null, row: null, options: [] })}
            >
                {statusMenu.options.map((opt) => (
                    <MenuItem key={opt} onClick={() => handleSelectNextStatus(opt)}>{opt}</MenuItem>
                ))}
            </Menu>
        </Box>
    );
}