// src/components/admin/CustomerTable.js
'use client';
import React, { useState, useMemo } from 'react';
import {
    Box, Button, Paper, Typography, Chip, IconButton, TextField,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Tooltip, alpha, InputAdornment, Stack, Avatar, MenuItem
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Trash2, Eye, Search, Users, UserCheck, UserX, Phone, X, UserPlus, TrendingUp, DollarSign, Award, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import CustomerModal from './CustomerModal';
import CustomerDetailModal from './CustomerDetailModal';


const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

// Confirmation Dialog
const ConfirmationDialog = ({ open, onClose, onConfirm, customerName }) => (
    <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
            sx: {
                borderRadius: 3,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }
        }}
    >
        <DialogTitle sx={{
            fontWeight: 700,
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
        }}>
            <Trash2 size={22} />
            Xác nhận xóa khách hàng
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                Bạn có chắc chắn muốn xóa khách hàng "{customerName}" không?
            </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
                Hủy
            </Button>
            <Button onClick={onConfirm} variant="contained" color="error" autoFocus sx={{ borderRadius: 2, fontWeight: 600 }}>
                Xóa
            </Button>
        </DialogActions>
    </Dialog>
);

export default function CustomerTable({ customers }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [timeRange, setTimeRange] = useState('month');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [deletingCustomer, setDeletingCustomer] = useState(null);
    const [viewingCustomerId, setViewingCustomerId] = useState(null);
    const [isUpdatingMembership, setIsUpdatingMembership] = useState(false);

    // Stats
    const stats = useMemo(() => {
        const total = customers.length;
        const active = customers.filter(c => c.status === 'active').length;
        const inactive = customers.filter(c => c.status === 'inactive').length;
        const totalOrders = customers.reduce((sum, c) => sum + (c.total_orders || 0), 0);
        const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
        
        return {
            total,
            active,
            inactive,
            totalOrders,
            totalSpent,
        };
    }, [customers]);

    // Filtered customers
    const filteredCustomers = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return customers.filter(customer => {
            const searchMatch = !search ||
                customer.full_name?.toLowerCase().includes(search) ||
                customer.email?.toLowerCase().includes(search) ||
                customer.phone_number?.includes(search);
            const statusMatch = !statusFilter || customer.status === statusFilter;
            return searchMatch && statusMatch;
        });
    }, [customers, searchTerm, statusFilter]);

    const hasFilters = searchTerm || statusFilter;

    const handleSave = async (customerData) => {
        const isEditMode = Boolean(customerData.id);
        const url = isEditMode ? `/api/admin/customers/${customerData.id}` : '/api/admin/customers';
        const method = isEditMode ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData),
        });

        if (res.ok) {
            setIsModalOpen(false);
            router.refresh();
        } else {
            const err = await res.json();
            alert(`Có lỗi xảy ra: ${err.message}`);
        }
    };

    const handleDelete = async () => {
        if (!deletingCustomer) return;
        const res = await fetch(`/api/admin/customers/${deletingCustomer.id}`, { method: 'DELETE' });
        if (res.ok) {
            setDeletingCustomer(null);
            router.refresh();
        } else {
            alert('Xóa thất bại!');
        }
    };

    const handleUpdateMembershipLevels = async () => {
        if (!confirm('Bạn có chắc muốn cập nhật lại nhóm khách hàng cho tất cả khách hàng dựa trên điểm tích lũy?')) {
            return;
        }

        setIsUpdatingMembership(true);
        try {
            const res = await fetch('/api/admin/customers/update-membership-levels', {
                method: 'POST',
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                alert(`Đã cập nhật nhóm khách hàng cho ${data.updated_count || 0} khách hàng thành công!`);
                router.refresh();
            } else {
                alert('Cập nhật thất bại: ' + (data.message || 'Lỗi không xác định'));
            }
        } catch (error) {
            console.error('Error updating membership levels:', error);
            alert('Có lỗi xảy ra khi cập nhật nhóm khách hàng');
        } finally {
            setIsUpdatingMembership(false);
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 70,
            minWidth: 70,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <span className="text-sm font-bold text-blue-600">#{params.value}</span>
                </Box>
            )
        },
        {
            field: 'full_name',
            headerName: 'Khách hàng',
            width: 280,
            minWidth: 250,
            flex: 1,
            renderCell: (params) => (
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%' }}>
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: alpha('#06b6d4', 0.1),
                            color: '#0891b2',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            flexShrink: 0,
                        }}
                    >
                        {params.value?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', lineHeight: 1.3 }}>
                            {params.value}
                        </Typography>
                        {params.row.email && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.3 }}>
                                {params.row.email}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            )
        },
        {
            field: 'phone_number',
            headerName: 'SĐT',
            width: 140,
            minWidth: 130,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {params.value ? (
                        <Chip
                            icon={<Phone size={12} />}
                            label={params.value}
                            size="small"
                            variant="outlined"
                            component="a"
                            href={`tel:${params.value}`}
                            clickable
                            sx={{
                                fontSize: '0.75rem',
                                borderColor: alpha('#10b981', 0.3),
                                color: '#059669',
                            }}
                        />
                    ) : <span className="text-gray-400 text-xs">—</span>}
                </Box>
            )
        },
        {
            field: 'membership_level',
            headerName: 'Nhóm khách hàng',
            width: 180,
            minWidth: 140,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const getMembershipColor = (level) => {
                    if (!level) {
                        return {
                            bgcolor: alpha('#6b7280', 0.1),
                            color: '#6b7280',
                            borderColor: alpha('#6b7280', 0.2),
                        };
                    }
                    
                    const levelLower = level.toLowerCase();
                    
                    // Khách hàng mới - Xám
                    if (levelLower.includes('mới') || levelLower.includes('new')) {
                        return {
                            bgcolor: alpha('#9ca3af', 0.15),
                            color: '#4b5563',
                            borderColor: alpha('#9ca3af', 0.4),
                        };
                    }
                    // Khách hàng thân thiết - Xanh dương
                    else if (levelLower.includes('thân thiết') || levelLower.includes('loyal') || levelLower.includes('regular')) {
                        return {
                            bgcolor: alpha('#2563eb', 0.15),
                            color: '#1d4ed8',
                            borderColor: alpha('#2563eb', 0.4),
                        };
                    }
                    // Khách hàng VIP - Vàng/Cam
                    else if (levelLower.includes('vip') || levelLower.includes('premium')) {
                        return {
                            bgcolor: alpha('#f59e0b', 0.15),
                            color: '#d97706',
                            borderColor: alpha('#f59e0b', 0.4),
                        };
                    }
                    // Diamond/Kim cương - Tím
                    else if (levelLower.includes('diamond') || levelLower.includes('kim cương')) {
                        return {
                            bgcolor: alpha('#8b5cf6', 0.15),
                            color: '#7c3aed',
                            borderColor: alpha('#8b5cf6', 0.4),
                        };
                    }
                    // Mặc định - Xanh lá
                    else {
                        return {
                            bgcolor: alpha('#10b981', 0.15),
                            color: '#059669',
                            borderColor: alpha('#10b981', 0.4),
                        };
                    }
                };

                const colors = getMembershipColor(params.value);

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {params.value ? (
                            <Chip
                                label={params.value}
                                size="small"
                                sx={{
                                    ...colors,
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    height: '28px',
                                    px: 1.5,
                                    borderRadius: '10px',
                                    border: '1px solid',
                                }}
                            />
                        ) : (
                            <Chip
                                label="Chưa có nhóm"
                                size="small"
                                sx={{
                                    bgcolor: alpha('#6b7280', 0.1),
                                    color: '#6b7280',
                                    fontWeight: 500,
                                    fontSize: '0.8rem',
                                    height: '28px',
                                    px: 1.5,
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: alpha('#6b7280', 0.2),
                                }}
                            />
                        )}
                    </Box>
                );
            }
        },
        {
            field: 'reward_points',
            headerName: 'Điểm tích lũy',
            width: 120,
            minWidth: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Chip
                        icon={<Award size={14} style={{ color: '#d97706' }} />}
                        label={new Intl.NumberFormat('vi-VN').format(params.value || 0)}
                        size="small"
                        sx={{
                            bgcolor: alpha('#f59e0b', 0.1),
                            color: '#DC2626',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            height: '28px',
                            px: 1.5,
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: alpha('#f59e0b', 0.3),
                        }}
                    />
                </Box>
            )
        },

        {
            field: 'total_orders',
            headerName: 'Đơn hàng',
            width: 100,
            minWidth: 90,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <span className="text-sm font-semibold text-gray-700">{params.value || 0}</span>
                </Box>
            )
        },
        {
            field: 'total_spent',
            headerName: 'Tổng chi tiêu',
            width: 100,
            minWidth: 100,
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
            field: 'role',
            headerName: 'Vai trò',
            width: 130,
            minWidth: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Chip
                        label={params.value === 'admin' ? 'Admin' : 'Khách hàng'}
                        size="small"
                        sx={{
                            bgcolor: params.value === 'admin' ? '#2563eb' : '#6b7280',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            height: '32px',
                            px: 1.5,
                            borderRadius: '10px',
                        }}
                    />
                </Box>
            )
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 130,
            minWidth: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Chip
                        label={params.value === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                        size="small"
                        sx={{
                            bgcolor: params.value === 'active' ? '#16a34a' : '#6b7280',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            height: '32px',
                            px: 1.5,
                            borderRadius: '10px',
                        }}
                    />
                </Box>
            )
        },
        {
            field: 'created_at',
            headerName: 'Tham gia',
            width: 120,
            minWidth: 110,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <span className="text-xs text-gray-600">
                        {params.value ? format(new Date(params.value), 'dd/MM/yy') : '—'}
                    </span>
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: 'Thao tác',
            width: 150,
            minWidth: 140,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Xem" arrow>
                            <IconButton
                                size="medium"
                                onClick={() => setViewingCustomerId(params.row.id)}
                                sx={{ 
                                    color: '#06b6d4', 
                                    '&:hover': { bgcolor: alpha('#06b6d4', 0.1) },
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
                                onClick={() => { setEditingCustomer(params.row); setIsModalOpen(true); }}
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
                                onClick={() => setDeletingCustomer(params.row)}
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
        },
    ];

    return (
        <Box 
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            {/* Compact Header */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                        Thông tin khách hàng
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        ({stats.total} khách)
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshCw size={18} className={isUpdatingMembership ? 'animate-spin' : ''} />}
                    onClick={handleUpdateMembershipLevels}
                    disabled={isUpdatingMembership}
                    sx={{
                        borderRadius: 2,
                        px: 2.5,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#2563eb',
                        color: '#2563eb',
                        '&:hover': {
                            borderColor: '#1d4ed8',
                            bgcolor: alpha('#2563eb', 0.05),
                        },
                        '&:disabled': {
                            opacity: 0.6,
                        }
                    }}
                >
                    {isUpdatingMembership ? 'Đang cập nhật...' : 'Cập nhật nhóm KH'}
                </Button>
            </Box>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                {/* Tổng khách hàng */}
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
                    <Users 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <Users size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.total}</p>
                        <p className="text-sm opacity-90">Tổng khách hàng</p>
                    </div>
                </Box>
                {/* Active */}
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
                    <UserCheck 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <UserCheck size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.active}</p>
                        <p className="text-sm opacity-90">Hoạt động</p>
                    </div>
                </Box>
                {/* Inactive */}
                <Box sx={{ 
                    p: 2, 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', 
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
                    <UserX 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <UserX size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.inactive}</p>
                        <p className="text-sm opacity-90">Tạm khóa</p>
                    </div>
                </Box>
                {/* Tổng đơn hàng */}
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
                    <TrendingUp 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <TrendingUp size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.totalOrders}</p>
                        <p className="text-sm opacity-90">Tổng đơn hàng</p>
                    </div>
                </Box>
                {/* Tổng chi tiêu */}
                <Box sx={{ 
                    p: 2, 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
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
                    <DollarSign 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <DollarSign size={32} className="opacity-90 mb-3" />
                        <p className="text-2xl font-bold mb-1">{formatCurrency(stats.totalSpent)}</p>
                        <p className="text-sm opacity-90">Tổng chi tiêu</p>
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
                            <em>Tất cả Trạng thái</em>
                        </MenuItem>
                        <MenuItem value="active">Hoạt động</MenuItem>
                        <MenuItem value="inactive">Tạm khóa</MenuItem>
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

            {/* Data Table */}
            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: '600px',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    '& .MuiDataGrid-root': {
                        border: 'none',
                    },
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
                        '&:hover': {
                            bgcolor: alpha('#06b6d4', 0.04),
                        }
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
                    rows={filteredCustomers}
                    columns={columns}
                    rowHeight={68}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 50 } },
                        sorting: { sortModel: [{ field: 'id', sort: 'desc' }] },
                    }}
                    localeText={{
                        noRowsLabel: 'Không có khách hàng nào',
                        MuiTablePagination: {
                            labelRowsPerPage: 'Hiển thị:',
                            labelDisplayedRows: ({ from, to, count }) => `${from}-${to} / ${count}`,
                        }
                    }}
                    sx={{
                        '& .MuiDataGrid-virtualScroller': {
                            '&::-webkit-scrollbar': {
                                width: 6,
                                height: 6,
                            },
                            '&::-webkit-scrollbar-thumb': {
                                bgcolor: alpha('#000', 0.15),
                                borderRadius: 3,
                            }
                        }
                    }}
                />
            </Paper>

            {/* Customer Modal */}
            <CustomerModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                customerToEdit={editingCustomer}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={Boolean(deletingCustomer)}
                onClose={() => setDeletingCustomer(null)}
                onConfirm={handleDelete}
                customerName={deletingCustomer?.full_name}
            />

            {/* Customer Detail Modal */}
            <CustomerDetailModal
                open={Boolean(viewingCustomerId)}
                onClose={() => setViewingCustomerId(null)}
                customerId={viewingCustomerId}
                onCustomerUpdated={() => {
                    // Refresh page or refetch data
                    window.location.reload();
                }}
            />
        </Box>
    );
}