/**
 * Admin promotions management page
 * @file src/app/(admin)/dashboard/promotions/page.js
 */
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Paper, Typography, Chip, IconButton, TextField, InputAdornment, Tooltip, alpha, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2, Search, Ticket, X, Calendar, Percent, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import PromotionModal from '@/components/admin/PromotionModal';

const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

// Stats Badge Component
const StatBadge = ({ label, value, color }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color}`}>
        <span className="text-sm font-bold">{value}</span>
        <span className="text-xs opacity-80">{label}</span>
    </div>
);

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
                <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
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
                            bgcolor: alpha('#8b5cf6', 0.1),
                            color: '#7c3aed',
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
            width: 100,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value === 'active' ? 'Hoạt động' : 'Tắt'}
                    size="small"
                    sx={{
                        bgcolor: params.value === 'active' ? alpha('#10b981', 0.1) : alpha('#6b7280', 0.1),
                        color: params.value === 'active' ? '#059669' : '#4b5563',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                    }}
                />
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
                    <Tooltip title="Sửa" arrow>
                        <IconButton
                            size="small"
                            onClick={() => { setEditingPromotion(params.row); setIsModalOpen(true); }}
                            sx={{ color: '#3b82f6', '&:hover': { bgcolor: alpha('#3b82f6', 0.1) } }}
                        >
                            <Edit size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa" arrow>
                        <IconButton
                            size="small"
                            onClick={() => handleDelete(params.row.id)}
                            sx={{ color: '#ef4444', '&:hover': { bgcolor: alpha('#ef4444', 0.1) } }}
                        >
                            <Trash2 size={16} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Khuyến mãi</h1>
                    <span className="text-sm text-gray-500">({stats.total} mã)</span>
                </div>
                <Button
                    variant="contained"
                    startIcon={<PlusCircle size={18} />}
                    onClick={() => { setEditingPromotion(null); setIsModalOpen(true); }}
                    sx={{
                        bgcolor: '#8b5cf6',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        '&:hover': { bgcolor: '#7c3aed' }
                    }}
                >
                    Thêm mã KM
                </Button>
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
                        <StatBadge label="Tổng" value={stats.total} color="bg-purple-100 text-purple-700" />
                        <StatBadge label="Hoạt động" value={stats.active} color="bg-green-100 text-green-700" />
                        <StatBadge label="Tắt" value={stats.inactive} color="bg-gray-100 text-gray-700" />
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
                            width: 200,
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
                        '&:hover': { bgcolor: alpha('#8b5cf6', 0.04) }
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
                    rowHeight={60}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
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