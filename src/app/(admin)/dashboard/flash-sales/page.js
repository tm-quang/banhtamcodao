/**
 * Admin Flash Sales management page
 * @file src/app/(admin)/dashboard/flash-sales/page.js
 */
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Paper, Typography, Chip, IconButton, TextField, InputAdornment, Tooltip, alpha, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2, Search, Zap, X, Calendar, Percent, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import FlashSaleModal from '@/components/admin/FlashSaleModal';

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

export default function FlashSalesPage() {
    const [flashSales, setFlashSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFlashSale, setEditingFlashSale] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchFlashSales = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/flash-sales');
            const data = await res.json();
            if (data.success) setFlashSales(data.flashSales || []);
        } catch (error) {
            console.error('Failed to fetch flash sales:', error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchFlashSales(); }, []);

    // Stats
    const stats = useMemo(() => {
        const now = new Date();
        return {
            total: flashSales.length,
            active: flashSales.filter(f => f.status === 'active').length,
            inactive: flashSales.filter(f => f.status !== 'active').length,
            running: flashSales.filter(f => {
                const start = new Date(f.start_date);
                const end = new Date(f.end_date);
                return f.status === 'active' && start <= now && end >= now;
            }).length
        };
    }, [flashSales]);

    // Filtered flash sales
    const filteredFlashSales = useMemo(() => {
        if (!searchTerm) return flashSales;
        const search = searchTerm.toLowerCase();
        return flashSales.filter(f =>
            f.name?.toLowerCase().includes(search) ||
            f.description?.toLowerCase().includes(search) ||
            f.badge_text?.toLowerCase().includes(search)
        );
    }, [flashSales, searchTerm]);

    const handleSave = async (data) => {
        const isEditMode = Boolean(data.id);
        const url = isEditMode ? `/api/admin/flash-sales/${data.id}` : '/api/admin/flash-sales';
        const method = isEditMode ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (res.ok) {
                setIsModalOpen(false);
                setEditingFlashSale(null);
                fetchFlashSales();
            } else {
                alert('Có lỗi xảy ra!');
            }
        } catch (error) {
            alert('Có lỗi xảy ra!');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa Flash Sale này?')) {
            try {
                const res = await fetch(`/api/admin/flash-sales/${id}`, { method: 'DELETE' });
                if (res.ok) { fetchFlashSales(); }
                else { alert('Xóa thất bại!'); }
            } catch (error) {
                alert('Xóa thất bại!');
            }
        }
    };

    const handleToggleStatus = async (flashSale) => {
        const newStatus = flashSale.status === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch(`/api/admin/flash-sales/${flashSale.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) { fetchFlashSales(); }
        } catch (error) {
            console.error('Toggle status failed:', error);
        }
    };

    const columns = [
        {
            field: 'badge_text',
            headerName: 'Badge',
            width: 100,
            renderCell: (params) => (
                <span
                    className="text-xs font-bold px-2 py-1 rounded"
                    style={{
                        backgroundColor: params.row.badge_color || '#FFD93D',
                        color: ['#FFD93D', '#4ECDC4', '#1ABC9C'].includes(params.row.badge_color) ? '#222' : '#fff'
                    }}
                >
                    {params.value}
                </span>
            )
        },
        {
            field: 'name',
            headerName: 'Tên chương trình',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {params.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {params.row.description?.substring(0, 50)}...
                    </Typography>
                </Box>
            )
        },
        {
            field: 'discount_value',
            headerName: 'Giảm giá',
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
            field: 'start_date',
            headerName: 'Bắt đầu',
            width: 130,
            renderCell: (params) => (
                <span className="text-xs text-gray-600">
                    {format(new Date(params.value), 'dd/MM/yyyy HH:mm')}
                </span>
            )
        },
        {
            field: 'end_date',
            headerName: 'Kết thúc',
            width: 130,
            renderCell: (params) => {
                const isExpired = new Date(params.value) < new Date();
                return (
                    <span className={`text-xs ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>
                        {format(new Date(params.value), 'dd/MM/yyyy HH:mm')}
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
            renderCell: (params) => {
                const now = new Date();
                const start = new Date(params.row.start_date);
                const end = new Date(params.row.end_date);
                const isRunning = params.value === 'active' && start <= now && end >= now;
                const isExpired = end < now;

                let label = 'Tắt';
                let color = alpha('#6b7280', 0.1);
                let textColor = '#4b5563';

                if (isExpired) {
                    label = 'Hết hạn';
                    color = alpha('#ef4444', 0.1);
                    textColor = '#dc2626';
                } else if (isRunning) {
                    label = 'Đang chạy';
                    color = alpha('#10b981', 0.1);
                    textColor = '#059669';
                } else if (params.value === 'active') {
                    label = 'Chờ chạy';
                    color = alpha('#f59e0b', 0.1);
                    textColor = '#d97706';
                }

                return (
                    <Chip
                        label={label}
                        size="small"
                        sx={{
                            bgcolor: color,
                            color: textColor,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                        }}
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: '',
            width: 120,
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title={params.row.status === 'active' ? 'Tắt' : 'Bật'} arrow>
                        <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(params.row)}
                            sx={{
                                color: params.row.status === 'active' ? '#10b981' : '#6b7280',
                                '&:hover': { bgcolor: alpha(params.row.status === 'active' ? '#10b981' : '#6b7280', 0.1) }
                            }}
                        >
                            {params.row.status === 'active' ? <Eye size={16} /> : <EyeOff size={16} />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa" arrow>
                        <IconButton
                            size="small"
                            onClick={() => { setEditingFlashSale(params.row); setIsModalOpen(true); }}
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <Zap size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Flash Sale</h1>
                        <span className="text-sm text-gray-500">{stats.running} đang chạy</span>
                    </div>
                </div>
                <Button
                    variant="contained"
                    startIcon={<PlusCircle size={18} />}
                    onClick={() => { setEditingFlashSale(null); setIsModalOpen(true); }}
                    sx={{
                        bgcolor: '#f59e0b',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        '&:hover': { bgcolor: '#d97706' }
                    }}
                >
                    Thêm Flash Sale
                </Button>
            </div>

            {/* Filter & Stats Row */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: '#fffbeb',
                    border: '1px solid',
                    borderColor: alpha('#f59e0b', 0.2),
                }}
            >
                <div className="flex flex-wrap items-center gap-3">
                    {/* Stats */}
                    <div className="flex items-center gap-2 mr-2">
                        <StatBadge label="Tổng" value={stats.total} color="bg-yellow-100 text-yellow-700" />
                        <StatBadge label="Đang chạy" value={stats.running} color="bg-green-100 text-green-700" />
                        <StatBadge label="Hoạt động" value={stats.active} color="bg-orange-100 text-orange-700" />
                        <StatBadge label="Tắt" value={stats.inactive} color="bg-gray-100 text-gray-700" />
                    </div>

                    <div className="h-6 w-px bg-yellow-300 hidden md:block" />

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
                        bgcolor: '#fffbeb',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    },
                    '& .MuiDataGrid-columnHeader': {
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        color: 'text.secondary',
                    },
                    '& .MuiDataGrid-row': {
                        '&:hover': { bgcolor: alpha('#f59e0b', 0.04) }
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
                    rows={filteredFlashSales}
                    columns={columns}
                    loading={loading}
                    rowHeight={70}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    localeText={{
                        noRowsLabel: 'Chưa có Flash Sale nào',
                        MuiTablePagination: {
                            labelRowsPerPage: 'Hiển thị:',
                            labelDisplayedRows: ({ from, to, count }) => `${from}-${to} / ${count}`,
                        }
                    }}
                />
            </Paper>

            <FlashSaleModal
                open={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingFlashSale(null); }}
                onSave={handleSave}
                flashSaleToEdit={editingFlashSale}
            />
        </Box>
    );
}
