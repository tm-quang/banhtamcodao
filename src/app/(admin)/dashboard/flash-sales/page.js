/**
 * Admin Flash Sales management page
 * @file src/app/(admin)/dashboard/flash-sales/page.js
 */
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Paper, Typography, Chip, IconButton, TextField, InputAdornment, Tooltip, alpha, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2, Search, Zap, X, Calendar, Percent, Eye, EyeOff, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import FlashSaleModal from '@/components/admin/FlashSaleModal';

const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};


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
            const res = await fetch(url, { 
                method, 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(data) 
            });
            
            const result = await res.json();
            
            if (res.ok && result.success) {
                setIsModalOpen(false);
                setEditingFlashSale(null);
                fetchFlashSales();
                alert(result.message || 'Thành công!');
            } else {
                alert(result.message || 'Có lỗi xảy ra! Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error saving flash sale:', error);
            alert('Có lỗi xảy ra! Vui lòng kiểm tra kết nối và thử lại.');
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
                            bgcolor: isExpired ? alpha('#ef4444', 1) : isRunning ? alpha('#16a34a', 1) : params.value === 'active' ? alpha('#f59e0b', 1) : alpha('#4b5563', 1),
                            color: '#FFFFFF',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                        }}
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Thao tác',
            width: 180,
            minWidth: 160,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title={params.row.status === 'active' ? 'Tắt' : 'Bật'} arrow>
                            <IconButton
                                size="medium"
                                onClick={() => handleToggleStatus(params.row)}
                                sx={{
                                    color: params.row.status === 'active' ? '#10b981' : '#6b7280',
                                    '&:hover': { bgcolor: alpha(params.row.status === 'active' ? '#10b981' : '#6b7280', 0.1) },
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                {params.row.status === 'active' ? <Eye size={20} /> : <EyeOff size={20} />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Sửa" arrow>
                            <IconButton
                                size="medium"
                                onClick={() => { setEditingFlashSale(params.row); setIsModalOpen(true); }}
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
                    <h1 className="text-xl font-bold text-gray-900">Quản lý Flash Sale</h1>
                    <span className="text-sm text-gray-500">({stats.total} chương trình)</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Tổng */}
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
                    <Zap 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <Zap size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.total}</p>
                        <p className="text-sm opacity-90">Tổng chương trình</p>
                    </div>
                </Box>
                {/* Đang chạy */}
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
                        <p className="text-3xl font-bold mb-1">{stats.running}</p>
                        <p className="text-sm opacity-90">Đang chạy</p>
                    </div>
                </Box>
                {/* Hoạt động */}
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
                        <p className="text-sm opacity-90">Hoạt động</p>
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
                        onClick={() => { setEditingFlashSale(null); setIsModalOpen(true); }}
                        sx={{
                            bgcolor: '#f59e0b',
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 2.5,
                            py: 1,
                            textTransform: 'none',
                            boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)',
                            '&:hover': {
                                bgcolor: '#d97706',
                                boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.4)',
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        + Thêm Flash Sale
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
                    rowHeight={68}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                    }}
                    localeText={{
                        noRowsLabel: 'Chưa có Flash Sale nào',
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

            <FlashSaleModal
                open={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingFlashSale(null); }}
                onSave={handleSave}
                flashSaleToEdit={editingFlashSale}
            />
        </Box>
    );
}
