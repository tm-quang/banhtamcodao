// src/components/admin/OrderTable.js
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Paper, Typography, Chip, IconButton, TextField, Menu, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
    Tooltip, alpha, InputAdornment, Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Eye, Edit, Search, ShoppingCart, Clock, CheckCircle, Truck, XCircle, X, Phone } from 'lucide-react';
import { format } from 'date-fns';
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
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }
        }}
    >
        <DialogTitle sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontWeight: 700,
        }}>
            <Box sx={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 'bold'
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
                        fontWeight: 600,
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
    const [viewingOrderId, setViewingOrderId] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, customActions: null });
    const [statusMenu, setStatusMenu] = useState({ anchorEl: null, row: null, options: [] });

    useEffect(() => { setOrders(initialOrders); }, [initialOrders]);

    // Stats
    const stats = useMemo(() => ({
        total: orders.length,
        pending: orders.filter(o => o.status === 'Chờ xác nhận').length,
        shipping: orders.filter(o => o.status === 'Đang vận chuyển').length,
        completed: orders.filter(o => o.status === 'Hoàn thành').length,
    }), [orders]);

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
                message: `Bạn chắc chắn muốn hủy đơn #${row.order_code}?`,
                onConfirm: async () => {
                    await handleUpdate(row.id, { status: nextStatus }, 'Đã hủy đơn hàng.');
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
        return orders.filter(order => {
            const searchMatch = !search ||
                order.order_code.toLowerCase().includes(search) ||
                order.recipient_name.toLowerCase().includes(search) ||
                order.phone_number.includes(search);
            const statusMatch = !statusFilter || order.status === statusFilter;
            const paymentMatch = !paymentFilter || order.payment_status === paymentFilter;
            return searchMatch && statusMatch && paymentMatch;
        });
    }, [orders, searchTerm, statusFilter, paymentFilter]);

    const getStatusChip = (status) => {
        const config = {
            'Chờ xác nhận': { color: '#f59e0b', bg: alpha('#f59e0b', 0.1), icon: Clock },
            'Đã xác nhận': { color: '#3b82f6', bg: alpha('#3b82f6', 0.1), icon: CheckCircle },
            'Đang vận chuyển': { color: '#06b6d4', bg: alpha('#06b6d4', 0.1), icon: Truck },
            'Hoàn thành': { color: '#10b981', bg: alpha('#10b981', 0.1), icon: CheckCircle },
            'Đã hủy': { color: '#ef4444', bg: alpha('#ef4444', 0.1), icon: XCircle },
        };
        const cfg = config[status] || { color: '#6b7280', bg: alpha('#6b7280', 0.1) };
        return (
            <Chip
                label={status}
                size="small"
                sx={{
                    bgcolor: cfg.bg,
                    color: cfg.color,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                }}
            />
        );
    };

    const columns = [
        {
            field: 'order_code',
            headerName: 'Mã đơn',
            width: 110,
            renderCell: (params) => (
                <span className="text-sm font-bold text-blue-600">{params.value}</span>
            )
        },
        {
            field: 'order_time',
            headerName: 'Thời gian',
            width: 120,
            renderCell: (params) => (
                <span className="text-xs text-gray-600">
                    {format(new Date(params.value), 'HH:mm dd/MM')}
                </span>
            )
        },
        {
            field: 'recipient_name',
            headerName: 'Khách hàng',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {params.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {params.row.phone_number}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'delivery_method',
            headerName: 'Giao',
            width: 90,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value === 'delivery' ? 'Ship' : 'Lấy'}
                    size="small"
                    sx={{
                        bgcolor: params.value === 'delivery' ? alpha('#3b82f6', 0.1) : alpha('#10b981', 0.1),
                        color: params.value === 'delivery' ? '#3b82f6' : '#10b981',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                    }}
                />
            )
        },
        {
            field: 'payment_status',
            headerName: 'Thanh toán',
            width: 110,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value === 'paid' ? 'Đã TT' : 'Chưa TT'}
                    size="small"
                    onClick={() => handlePaymentClick(params.row)}
                    sx={{
                        bgcolor: params.value === 'paid' ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                        color: params.value === 'paid' ? '#10b981' : '#f59e0b',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        cursor: params.value === 'unpaid' ? 'pointer' : 'default',
                    }}
                />
            )
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 130,
            renderCell: (params) => (
                <Box onClick={(e) => openStatusMenu(e, params.row)}>
                    {getStatusChip(params.value)}
                </Box>
            )
        },
        {
            field: 'total_amount',
            headerName: 'Tổng tiền',
            width: 110,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <span className="text-sm font-bold text-amber-600">
                    {formatCurrency(params.value)}
                </span>
            )
        },
        {
            field: 'actions',
            headerName: '',
            width: 90,
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Xem" arrow>
                        <IconButton
                            size="small"
                            onClick={() => setViewingOrderId(params.row.id)}
                            sx={{ color: '#3b82f6', '&:hover': { bgcolor: alpha('#3b82f6', 0.1) } }}
                        >
                            <Eye size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa" arrow>
                        <IconButton
                            size="small"
                            onClick={() => setEditingOrder(params.row)}
                            sx={{ color: '#f97316', '&:hover': { bgcolor: alpha('#f97316', 0.1) } }}
                        >
                            <Edit size={16} />
                        </IconButton>
                    </Tooltip>
                </Stack>
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
                    {/* Stats */}
                    <div className="flex items-center gap-2 mr-2">
                        <StatBadge label="Chờ" value={stats.pending} color="bg-amber-100 text-amber-700" />
                        <StatBadge label="Đang giao" value={stats.shipping} color="bg-cyan-100 text-cyan-700" />
                        <StatBadge label="Xong" value={stats.completed} color="bg-green-100 text-green-700" />
                    </div>

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
                        displayEmpty
                        sx={{
                            width: 140,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.8rem',
                            }
                        }}
                    >
                        <MenuItem value="">Tất cả TT</MenuItem>
                        <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
                        <MenuItem value="Đã xác nhận">Đã xác nhận</MenuItem>
                        <MenuItem value="Đang vận chuyển">Đang vận chuyển</MenuItem>
                        <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                        <MenuItem value="Đã hủy">Đã hủy</MenuItem>
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
            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: 0,
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
                        fontWeight: 600,
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
                    },
                }}
            >
                <DataGrid
                    rows={filteredOrders}
                    columns={columns}
                    rowHeight={64}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
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