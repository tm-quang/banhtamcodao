// src/components/admin/CustomerDetailsClient.js
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Grid, Chip, Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Select, MenuItem, FormControl, InputLabel, Tooltip, Stack, alpha, TextField, InputAdornment } from '@mui/material';
import { Edit, Trash2, ArrowLeft, User, Mail, Phone, ShoppingCart, CheckCircle, Clock, Truck, XCircle, Search, X } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const OrderStatusModal = ({ open, onClose, onSave, order }) => {
    const [status, setStatus] = useState(order?.status || '');
    useEffect(() => { setStatus(order?.status || ''); }, [order]);

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }
            }}
        >
            <DialogTitle sx={{ 
                borderBottom: '1px solid #E5E7EB',
                pb: 2,
                px: 3,
                pt: 3
            }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                    Cập nhật trạng thái đơn hàng
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ px: 3, pt: 3, pb: 2 }}>
                <Box sx={{ 
                    bgcolor: '#F9FAFB', 
                    borderRadius: '8px', 
                    p: 2, 
                    mb: 2 
                }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        Mã đơn hàng:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
                        {order?.order_code}
                    </Typography>
                </Box>
                <FormControl fullWidth>
                    <InputLabel sx={{ color: '#6B7280' }}>Trạng thái</InputLabel>
                    <Select 
                        value={status} 
                        label="Trạng thái" 
                        onChange={(e) => setStatus(e.target.value)}
                        sx={{
                            borderRadius: '8px',
                            bgcolor: '#FFFFFF',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E5E7EB'
                            }
                        }}
                    >
                        <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
                        <MenuItem value="Đã xác nhận">Đã xác nhận</MenuItem>
                        <MenuItem value="Đang vận chuyển">Đang vận chuyển</MenuItem>
                        <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                        <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5 }}>
                <Button 
                    onClick={onClose}
                    sx={{
                        color: '#6B7280',
                        fontWeight: 500,
                        textTransform: 'none',
                        px: 3,
                        '&:hover': {
                            bgcolor: '#F3F4F6'
                        }
                    }}
                >
                    Hủy
                </Button>
                <Button 
                    onClick={() => onSave(order.id, status)} 
                    variant="contained"
                    sx={{
                        bgcolor: '#3B82F6',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 3,
                        borderRadius: '8px',
                        '&:hover': {
                            bgcolor: '#2563EB'
                        }
                    }}
                >
                    Lưu
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default function CustomerDetailsClient({ customer, initialOrders }) {
    const router = useRouter();
    const [orders, setOrders] = useState(initialOrders);
    const [deletingOrder, setDeletingOrder] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Stats tính toán từ orders
    const stats = useMemo(() => {
        const total = orders.length;
        const completed = orders.filter(o => o.status === 'Hoàn thành').length;
        const pending = orders.filter(o => o.status === 'Chờ xác nhận').length;
        const shipping = orders.filter(o => o.status === 'Đang vận chuyển').length;
        const cancelled = orders.filter(o => o.status === 'Đã hủy').length;
        const totalValue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        
        return {
            total,
            completed,
            pending,
            shipping,
            cancelled,
            totalValue,
        };
    }, [orders]);

    const handleDeleteOrder = async () => {
        if (!deletingOrder) return;
        const res = await fetch(`/api/admin/orders/${deletingOrder.id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Xóa đơn hàng thành công!');
            setOrders(prev => prev.filter(o => o.id !== deletingOrder.id));
        } else {
            alert('Xóa thất bại!');
        }
        setDeletingOrder(null);
    };

    const handleUpdateStatus = async (orderId, status) => {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            alert('Cập nhật thành công!');
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        } else {
            alert('Cập nhật thất bại!');
        }
        setEditingOrder(null);
    }

    const getStatusChip = (status) => {
        const config = {
            'Chờ xác nhận': { color: '#FFFFFF', bg: '#f59e0b' },
            'Đã xác nhận': { color: '#FFFFFF', bg: '#3B82F6' },
            'Đang vận chuyển': { color: '#FFFFFF', bg: '#0ea5e9' },
            'Hoàn thành': { color: '#FFFFFF', bg: '#16a34a' },
            'Đã hủy': { color: '#FFFFFF', bg: '#EF4444' },
        };
        const cfg = config[status] || { color: '#FFFFFF', bg: '#6B7280' };
        return (
            <Chip
                label={status}
                size="medium"
                sx={{
                    bgcolor: cfg.bg,
                    color: cfg.color,
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    height: '32px',
                    px: 1.5,
                    borderRadius: '10px',
                    '& .MuiChip-label': {
                        px: 1,
                    },
                }}
            />
        );
    };

    const filteredOrders = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return orders.filter(order => {
            const searchMatch = !search ||
                order.order_code?.toLowerCase().includes(search) ||
                order.recipient_name?.toLowerCase().includes(search);
            const statusMatch = !statusFilter || order.status === statusFilter;
            return searchMatch && statusMatch;
        });
    }, [orders, searchTerm, statusFilter]);

    const hasFilters = searchTerm || statusFilter;

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
            field: 'status', 
            headerName: 'Trạng thái', 
            width: 160,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {getStatusChip(params.value)}
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
                        <Tooltip title="Xóa" arrow>
                            <IconButton 
                                size="medium"
                                onClick={() => setDeletingOrder(params.row)}
                                sx={{ 
                                    color: '#EF4444', 
                                    '&:hover': { bgcolor: alpha('#EF4444', 0.1) },
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <Trash2 size={20} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
            <Button
                component={Link}
                href="/admin/customers"
                startIcon={<ArrowLeft size={18} />}
                        sx={{ 
                            color: '#6B7280',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#F3F4F6' }
                        }}
                    >
                        Quay lại
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-900">Thông tin khách hàng</h1>
                        <span className="text-sm text-gray-500">({customer.full_name || 'N/A'})</span>
                    </div>
                </div>
                {/* Thông tin khách hàng compact */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    px: 2.5,
                    py: 1.5,
                    bgcolor: '#F9FAFB',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB'
                }}>
                    <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '10px',
                        bgcolor: '#3B82F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                    }}>
                        <User size={20} />
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                            {customer.full_name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {customer.email || 'N/A'} {customer.phone_number && ` • ${customer.phone_number}`}
                        </Typography>
                    </Box>
                </Box>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                {/* Tổng đơn hàng */}
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
                    <ShoppingCart 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <ShoppingCart size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.total}</p>
                        <p className="text-sm opacity-90">Tổng đơn hàng</p>
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

                    {hasFilters && (
                        <Button
                            size="small"
                            startIcon={<X size={14} />}
                            onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
                            sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.8rem' }}
                        >
                            Xóa lọc
            </Button>
                    )}
                </div>
            </Paper>

            {/* Bảng đơn hàng */}
            <Paper sx={{ 
                flex: 1,
                minHeight: '600px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                '& .MuiDataGrid-root': { border: 'none' },
                '& .MuiDataGrid-columnHeaders': {
                    bgcolor: '#F9FAFB',
                    borderBottom: '1px solid #E5E7EB',
                },
                '& .MuiDataGrid-columnHeader': {
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    color: '#6B7280',
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
            }}>
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

                <Dialog 
                    open={Boolean(deletingOrder)} 
                    onClose={() => setDeletingOrder(null)}
                    PaperProps={{
                        sx: {
                            borderRadius: '16px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        borderBottom: '1px solid #E5E7EB',
                        pb: 2,
                        px: 3,
                        pt: 3
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                            Xác nhận xóa
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ px: 3, pt: 3, pb: 2 }}>
                        <DialogContentText sx={{ color: '#374151' }}>
                            Bạn có chắc muốn xóa đơn hàng <strong>&quot;{deletingOrder?.order_code}&quot;</strong> không?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5 }}>
                        <Button 
                            onClick={() => setDeletingOrder(null)}
                            sx={{
                                color: '#6B7280',
                                fontWeight: 500,
                                textTransform: 'none',
                                px: 3,
                                '&:hover': {
                                    bgcolor: '#F3F4F6'
                                }
                            }}
                        >
                            Hủy
                        </Button>
                        <Button 
                            onClick={handleDeleteOrder}
                            sx={{
                                bgcolor: '#EF4444',
                                color: '#FFFFFF',
                                fontWeight: 600,
                                textTransform: 'none',
                                px: 3,
                                borderRadius: '8px',
                                '&:hover': {
                                    bgcolor: '#DC2626'
                                }
                            }}
                        >
                            Xóa
                        </Button>
                    </DialogActions>
                </Dialog>

                <OrderStatusModal open={Boolean(editingOrder)} onClose={() => setEditingOrder(null)} onSave={handleUpdateStatus} order={editingOrder} />
        </Box>
    );
}