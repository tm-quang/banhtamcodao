/**
 * Admin Combo Promotions management page
 * @file src/app/(admin)/dashboard/combo-promotions/page.js
 */
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Paper, Typography, Chip, IconButton, TextField, InputAdornment, Tooltip, alpha, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2, Search, Gift, X, Calendar, Eye, EyeOff, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import ComboPromotionModal from '@/components/admin/ComboPromotionModal';

const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

export default function ComboPromotionsPage() {
    const [comboPromotions, setComboPromotions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchComboPromotions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/combo-promotions');
            const data = await res.json();
            if (data.success) setComboPromotions(data.comboPromotions || []);
        } catch (error) {
            console.error('Failed to fetch combo promotions:', error);
        }
        setLoading(false);
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            if (data.success) setCategories(data.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products');
            const data = await res.json();
            if (data.success) setProducts(data.products || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    useEffect(() => {
        fetchComboPromotions();
        fetchCategories();
        fetchProducts();
    }, []);

    // Stats
    const stats = useMemo(() => {
        const now = new Date();
        return {
            total: comboPromotions.length,
            active: comboPromotions.filter(c => c.status === 'active').length,
            inactive: comboPromotions.filter(c => c.status !== 'active').length,
            running: comboPromotions.filter(c => {
                if (c.status !== 'active') return false;
                if (!c.start_date || !c.end_date) return false;
                const start = new Date(c.start_date);
                const end = new Date(c.end_date);
                return start <= now && end >= now;
            }).length
        };
    }, [comboPromotions]);

    // Filtered combo promotions
    const filteredComboPromotions = useMemo(() => {
        if (!searchTerm) return comboPromotions;
        const search = searchTerm.toLowerCase();
        return comboPromotions.filter(c =>
            c.name?.toLowerCase().includes(search) ||
            c.description?.toLowerCase().includes(search)
        );
    }, [comboPromotions, searchTerm]);

    const handleSave = async (data) => {
        const isEditMode = Boolean(data.id);
        const url = isEditMode ? `/api/admin/combo-promotions/${data.id}` : '/api/admin/combo-promotions';
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
                setEditingCombo(null);
                fetchComboPromotions();
                alert(result.message || 'Thành công!');
            } else {
                alert(result.message || 'Có lỗi xảy ra! Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error saving combo promotion:', error);
            alert('Có lỗi xảy ra! Vui lòng kiểm tra kết nối và thử lại.');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa Combo Promotion này?')) {
            try {
                const res = await fetch(`/api/admin/combo-promotions/${id}`, { method: 'DELETE' });
                if (res.ok) { 
                    fetchComboPromotions();
                    alert('Xóa thành công!');
                } else { 
                    alert('Xóa thất bại!'); 
                }
            } catch (error) {
                alert('Xóa thất bại!');
            }
        }
    };

    const handleToggleStatus = async (combo) => {
        const newStatus = combo.status === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch(`/api/admin/combo-promotions/${combo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) { fetchComboPromotions(); }
        } catch (error) {
            console.error('Toggle status failed:', error);
        }
    };

    const getConditionSummary = (conditions) => {
        if (!conditions || !conditions.rules) return 'N/A';
        const rules = conditions.rules;
        if (rules.length === 0) return 'N/A';
        const firstRule = rules[0];
        return `Mua ${firstRule.min_quantity || 'X'} ${firstRule.category_slug || firstRule.product_slug || 'sản phẩm'}`;
    };

    const getRewardSummary = (rewards) => {
        if (!rewards || !rewards.products) return 'N/A';
        const products = rewards.products;
        if (products.length === 0) return 'N/A';
        const firstProduct = products[0];
        return `Tặng ${firstProduct.quantity_per_combo || 'X'} ${firstProduct.category_slug || firstProduct.product_slug || 'sản phẩm'}`;
    };

    const columns = [
        {
            field: 'name',
            headerName: 'Tên combo',
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
            field: 'conditions',
            headerName: 'Điều kiện',
            width: 180,
            renderCell: (params) => (
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {getConditionSummary(params.value)}
                </Typography>
            )
        },
        {
            field: 'rewards',
            headerName: 'Phần thưởng',
            width: 180,
            renderCell: (params) => (
                <Typography sx={{ fontSize: '0.8rem', color: 'text.primary', fontWeight: 500 }}>
                    {getRewardSummary(params.value)}
                </Typography>
            )
        },
        {
            field: 'min_order_value',
            headerName: 'Đơn tối thiểu',
            width: 120,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {params.value ? formatCurrency(params.value) : 'Không'}
                </Typography>
            )
        },
        {
            field: 'start_date',
            headerName: 'Bắt đầu',
            width: 130,
            renderCell: (params) => (
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {params.value ? format(new Date(params.value), 'dd/MM/yyyy HH:mm') : 'Không giới hạn'}
                </Typography>
            )
        },
        {
            field: 'end_date',
            headerName: 'Kết thúc',
            width: 130,
            renderCell: (params) => {
                if (!params.value) return <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Không giới hạn</Typography>;
                const isExpired = new Date(params.value) < new Date();
                return (
                    <Typography sx={{ fontSize: '0.75rem', color: isExpired ? 'error.main' : 'text.secondary' }}>
                        {format(new Date(params.value), 'dd/MM/yyyy HH:mm')}
                    </Typography>
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
                const start = params.row.start_date ? new Date(params.row.start_date) : null;
                const end = params.row.end_date ? new Date(params.row.end_date) : null;
                const isRunning = params.value === 'active' && (!start || start <= now) && (!end || end >= now);
                const isExpired = end && end < now;

                let label = 'Tắt';
                let color = '#6b7280';

                if (isExpired) {
                    label = 'Hết hạn';
                    color = '#ef4444';
                } else if (isRunning) {
                    label = 'Đang chạy';
                    color = '#10b981';
                } else if (params.value === 'active') {
                    label = 'Chờ chạy';
                    color = '#f59e0b';
                }

                return (
                    <Chip
                        label={label}
                        size="small"
                        sx={{
                            bgcolor: color,
                            color: '#FFFFFF',
                            fontWeight: 500,
                            fontSize: '0.75rem',
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
                                onClick={() => { setEditingCombo(params.row); setIsModalOpen(true); }}
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
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Quản lý Combo Promotions</h1>
                    <span className="text-sm text-gray-500">({stats.total} combo)</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Tổng */}
                <Box sx={{ 
                    p: 2,
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <Gift 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <Gift size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.total}</p>
                        <p className="text-sm opacity-90">Tổng combo</p>
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
                        onClick={() => { setEditingCombo(null); setIsModalOpen(true); }}
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
                        + Thêm Combo
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
                    rows={filteredComboPromotions}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.id}
                    rowHeight={68}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                    }}
                    localeText={{
                        noRowsLabel: 'Chưa có Combo Promotion nào',
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

            <ComboPromotionModal
                open={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingCombo(null); }}
                onSave={handleSave}
                comboToEdit={editingCombo}
                categories={categories}
                products={products}
            />
        </Box>
    );
}

