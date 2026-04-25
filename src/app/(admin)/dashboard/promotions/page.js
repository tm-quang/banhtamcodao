/**
 * Admin promotions management page
 * @file src/app/(admin)/dashboard/promotions/page.js
 */
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Paper, Typography, Chip, IconButton, TextField, InputAdornment, Tooltip, alpha, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2, Search, Ticket, X, Calendar, Percent, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import PromotionModal from '@/components/admin/PromotionModal';

const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};


export default function PromotionsPage() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/promotions');
            const data = await res.json();
            if (data.success) setPromotions(data.promotions || []);
        } catch (error) {
            console.error('Failed to fetch promotions:', error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchPromotions(); }, []);

    // Stats
    const stats = useMemo(() => ({
        total: promotions.length,
        active: promotions.filter(p => p.status === 'active').length,
        inactive: promotions.filter(p => p.status !== 'active').length,
    }), [promotions]);

    // Filtered promotions
    const filteredPromotions = useMemo(() => {
        if (!searchTerm) return promotions;
        const search = searchTerm.toLowerCase();
        return promotions.filter(p =>
            p.promo_code?.toLowerCase().includes(search) ||
            p.title?.toLowerCase().includes(search)
        );
    }, [promotions, searchTerm]);

    const handleSave = async (data) => {
        const isEditMode = Boolean(data.id);
        const url = isEditMode ? `/api/admin/promotions/${data.id}` : '/api/admin/promotions';
        const method = isEditMode ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (res.ok) {
                setIsModalOpen(false);
                fetchPromotions();
            } else {
                alert('Có lỗi xảy ra!');
            }
        } catch (error) {
            alert('Có lỗi xảy ra!');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này?')) {
            try {
                const res = await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE' });
                if (res.ok) { fetchPromotions(); }
                else { alert('Xóa thất bại!'); }
            } catch (error) {
                alert('Xóa thất bại!');
            }
        }
    };

    const columns = [
        {
            field: 'promo_code',
            headerName: 'Mã KM',
            width: 130,
            renderCell: (params) => (
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {params.value}
                </span>
            )
        },
        {
            field: 'title',
            headerName: 'Tên chương trình',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'discount_type',
            headerName: 'Loại',
            width: 100,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const icons = { percent: Percent, fixed: DollarSign, free_shipping: Ticket };
                const Icon = icons[params.value] || Ticket;
                return (
                    <Chip
                        icon={<Icon size={14} />}
                        label={params.value === 'percent' ? '%' : params.value === 'fixed' ? 'VND' : 'Ship'}
                        size="small"
                        sx={{
                            bgcolor: alpha('#2563eb', 0.1),
                            color: '#1d4ed8',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                        }}
                    />
                );
            }
        },
        {
            field: 'discount_value',
            headerName: 'Giá trị',
            width: 100,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <span className="text-sm font-bold text-green-600">
                    {params.row.discount_type === 'percent' ? `${params.value}%` : formatCurrency(params.value)}
                </span>
            )
        },
        {
            field: 'min_order_value',
            headerName: 'Đơn tối thiểu',
            width: 120,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <span className="text-xs text-gray-600">
                    {formatCurrency(params.value)}
                </span>
            )
        },
        {
            field: 'end_date',
            headerName: 'Hết hạn',
            width: 120,
            renderCell: (params) => {
                const isExpired = new Date(params.value) < new Date();
                return (
                    <span className={`text-xs ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>
                        {format(new Date(params.value), 'dd/MM/yyyy')}
                    </span>
                );
            }
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value === 'active' ? 'Hoạt động' : 'Tắt'}
                    size="small"
                    sx={{
                        bgcolor: params.value === 'active' ? alpha('#16a34a', 1) : alpha('#4b5563', 1),
                        color: '#FFFFFF',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                    }}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Thao tác',
            width: 150,
            minWidth: 140,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Sửa" arrow>
                            <IconButton
                                size="medium"
                                onClick={() => { setEditingPromotion(params.row); setIsModalOpen(true); }}
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
                                onClick={() => handleDelete(params.row.id)}
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
        <Box 
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            suppressHydrationWarning={true}
        >
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
                    <span className="text-sm text-gray-500">({stats.total} mã)</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {/* Tổng mã */}
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
                    <Ticket 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <Ticket size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.total}</p>
                        <p className="text-sm opacity-90">Tổng mã KM</p>
                    </div>
                </Box>
                {/* Hoạt động */}
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
                        <p className="text-3xl font-bold mb-1">{stats.active}</p>
                        <p className="text-sm opacity-90">Đang hoạt động</p>
                    </div>
                </Box>
                {/* Tắt */}
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
                        <p className="text-3xl font-bold mb-1">{stats.inactive}</p>
                        <p className="text-sm opacity-90">Đã tắt</p>
                    </div>
                </Box>
            </div>

            {/* Filter & Actions Row */}
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
                <div className="flex flex-wrap items-center justify-between gap-3">
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
                            flex: 1,
                            minWidth: 220,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.875rem',
                            }
                        }}
                    />

                    {searchTerm && (
                        <Button
                            size="small"
                            startIcon={<X size={14} />}
                            onClick={() => setSearchTerm('')}
                            sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.8rem' }}
                        >
                            Xóa lọc
                        </Button>
                    )}

                    {/* Add Button */}
                    <Button
                        variant="contained"
                        startIcon={<PlusCircle size={18} />}
                        onClick={() => { setEditingPromotion(null); setIsModalOpen(true); }}
                        sx={{
                            bgcolor: '#2563eb',
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 2.5,
                            py: 1,
                            textTransform: 'none',
                            boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)',
                            '&:hover': {
                                bgcolor: '#1d4ed8',
                                boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.4)',
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        + Thêm mã KM
                    </Button>
                </div>
            </Paper>

            {/* Data Table */}
            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: 600,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'white',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
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
                        '&:hover': { bgcolor: alpha('#2563eb', 0.04) }
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
                    rows={filteredPromotions}
                    columns={columns}
                    loading={loading}
                    rowHeight={68}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                    }}
                    localeText={{
                        noRowsLabel: 'Không có mã khuyến mãi nào',
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

            <PromotionModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                promotionToEdit={editingPromotion}
            />
        </Box>
    );
}