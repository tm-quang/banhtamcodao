// src/components/admin/ProductTable.js
'use client';
import React, { useState, useMemo } from 'react';
import {
    Box, Button, IconButton, TextField, MenuItem, Paper, Chip, Switch, Typography,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Stack, Avatar, InputAdornment, alpha, Tooltip,
    useMediaQuery, useTheme
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2, Search, Package, ShoppingBag, EyeOff, Star, X } from 'lucide-react';
import Image from 'next/image';
import ProductModal from './ProductModal';
import { useRouter } from 'next/navigation';

// Confirmation Dialog
const ConfirmationDialog = ({ open, onClose, onConfirm, title, description }) => (
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
            {title}
        </DialogTitle>
        <DialogContent>
            <DialogContentText>{description}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
                Hủy
            </Button>
            <Button onClick={onConfirm} variant="contained" color="error" autoFocus sx={{ borderRadius: 2, fontWeight: 600 }}>
                Xác nhận xóa
            </Button>
        </DialogActions>
    </Dialog>
);

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === 0) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Compact Stats Badge
const StatBadge = ({ label, value, color }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color}`}>
        <span className="text-sm font-bold">{value}</span>
        <span className="text-xs opacity-80">{label}</span>
    </div>
);

export default function ProductTable({ products, categories }) {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [filters, setFilters] = useState({ name: '', category: '', status: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);

    // Calculate stats
    const stats = useMemo(() => ({
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        inactive: products.filter(p => p.status === 'inactive' || p.status === 'hidden').length,
        special: products.filter(p => p.is_special).length,
    }), [products]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ name: '', category: '', status: '' });
    };

    const hasActiveFilters = filters.name || filters.category || filters.status;

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(filters.name.toLowerCase());
            const categoryMatch = filters.category ? product.category_name === filters.category : true;
            const statusMatch = filters.status ? product.status === filters.status : true;
            return nameMatch && categoryMatch && statusMatch;
        });
    }, [products, filters]);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = (product) => {
        setDeletingProduct(product);
    };

    const confirmDelete = async () => {
        if (!deletingProduct) return;
        const res = await fetch(`/api/admin/products/${deletingProduct.id}`, { method: 'DELETE' });
        if (res.ok) {
            setDeletingProduct(null);
            router.refresh();
        } else {
            alert('Xóa thất bại!');
        }
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleToggleSpecial = async (product) => {
        try {
            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_special: !product.is_special })
            });
            if (res.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error('Error toggling special:', error);
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 60,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <span className="text-xs font-semibold text-blue-600">#{params.value}</span>
            )
        },
        {
            field: 'image_url',
            headerName: 'Ảnh',
            width: 70,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    position: 'relative',
                }}>
                    <Image
                        src={params.value || '/placeholder.jpg'}
                        alt={params.row.name}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </Box>
            ),
            sortable: false,
            filterable: false,
        },
        {
            field: 'name',
            headerName: 'Tên món',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', py: 0.5 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', lineHeight: 1.3 }}>
                        {params.value}
                    </Typography>
                    {params.row.is_special && (
                        <Chip
                            label="Bán chạy"
                            size="small"
                            sx={{
                                mt: 0.5,
                                height: 18,
                                fontSize: '0.65rem',
                                bgcolor: alpha('#f59e0b', 0.15),
                                color: '#d97706',
                                fontWeight: 600,
                                width: 'fit-content',
                            }}
                        />
                    )}
                </Box>
            )
        },
        {
            field: 'category_name',
            headerName: 'Danh mục',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    variant="outlined"
                    sx={{
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        borderColor: alpha('#6366f1', 0.3),
                        color: '#6366f1',
                    }}
                />
            )
        },
        {
            field: 'price',
            headerName: 'Giá Bán',
            width: 110,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params) => (
                <Typography sx={{ fontWeight: 700, color: '#10b981', fontSize: '0.875rem' }}>
                    {formatCurrency(params.value)}
                </Typography>
            )
        },
        {
            field: 'discount_price',
            headerName: 'Giá KM',
            width: 100,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params) => (
                params.value ? (
                    <Typography sx={{ fontWeight: 600, color: '#ef4444', fontSize: '0.8rem' }}>
                        {formatCurrency(params.value)}
                    </Typography>
                ) : (
                    <Typography color="text.disabled" sx={{ fontSize: '0.8rem' }}>-</Typography>
                )
            )
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 100,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const statusConfig = {
                    active: { label: 'Đang bán', color: '#10b981', bgcolor: alpha('#10b981', 0.1) },
                    inactive: { label: 'Ngưng', color: '#6b7280', bgcolor: alpha('#6b7280', 0.1) },
                    hidden: { label: 'Ẩn', color: '#f59e0b', bgcolor: alpha('#f59e0b', 0.1) },
                };
                const config = statusConfig[params.value] || { label: params.value, color: '#6b7280', bgcolor: '#f3f4f6' };
                return (
                    <Chip
                        label={config.label}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            color: config.color,
                            bgcolor: config.bgcolor,
                        }}
                    />
                );
            }
        },
        {
            field: 'is_special',
            headerName: 'Hot',
            width: 70,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Switch
                    checked={!!params.value}
                    size="small"
                    color="warning"
                    onChange={() => handleToggleSpecial(params.row)}
                />
            ),
        },
        {
            field: 'actions',
            headerName: '',
            width: 90,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Sửa" arrow>
                        <IconButton
                            size="small"
                            onClick={() => handleEdit(params.row)}
                            sx={{
                                color: '#3b82f6',
                                '&:hover': { bgcolor: alpha('#3b82f6', 0.1) }
                            }}
                        >
                            <Edit size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa" arrow>
                        <IconButton
                            size="small"
                            onClick={() => handleDelete(params.row)}
                            sx={{
                                color: '#ef4444',
                                '&:hover': { bgcolor: alpha('#ef4444', 0.1) }
                            }}
                        >
                            <Trash2 size={16} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        },
    ];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">QUẢN LÝ MÓN</h1>
                    <span className="text-sm text-gray-500">({stats.total} món)</span>
                </div>
                <Button
                    variant="contained"
                    startIcon={<PlusCircle size={18} />}
                    onClick={handleAddNew}
                    sx={{
                        bgcolor: '#16a34a',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 2.5,
                        py: 1,
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
                        '&:hover': {
                            bgcolor: '#15803d',
                        }
                    }}
                >
                    Thêm món
                </Button>
            </div>

            {/* Compact Filter & Stats Row */}
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
                    {/* Stats Badges */}
                    <div className="flex items-center gap-2 mr-2">
                        <StatBadge label="Tổng" value={stats.total} color="bg-blue-100 text-blue-700" />
                        <StatBadge label="Bán" value={stats.active} color="bg-green-100 text-green-700" />
                        <StatBadge label="Ngưng" value={stats.inactive} color="bg-gray-100 text-gray-600" />
                        <StatBadge label="Hot" value={stats.special} color="bg-amber-100 text-amber-700" />
                    </div>

                    <div className="h-6 w-px bg-gray-300 hidden md:block" />

                    {/* Search & Filters */}
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Tìm kiếm..."
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
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
                    <TextField
                        select
                        variant="outlined"
                        size="small"
                        value={filters.category}
                        displayEmpty
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        sx={{
                            minWidth: 130,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.875rem',
                            }
                        }}
                    >
                        <MenuItem value="">Danh mục</MenuItem>
                        {categories.map(cat => <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>)}
                    </TextField>
                    <TextField
                        select
                        variant="outlined"
                        size="small"
                        value={filters.status}
                        displayEmpty
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        sx={{
                            minWidth: 120,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.875rem',
                            }
                        }}
                    >
                        <MenuItem value="">Trạng thái</MenuItem>
                        <MenuItem value="active">Đang bán</MenuItem>
                        <MenuItem value="inactive">Ngưng bán</MenuItem>
                        <MenuItem value="hidden">Ẩn</MenuItem>
                    </TextField>

                    {hasActiveFilters && (
                        <Button
                            size="small"
                            startIcon={<X size={14} />}
                            onClick={clearFilters}
                            sx={{
                                color: 'text.secondary',
                                textTransform: 'none',
                                fontSize: '0.8rem',
                            }}
                        >
                            Xóa lọc
                        </Button>
                    )}
                </div>
            </Paper>

            {/* Data Table - Takes remaining height */}
            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: 0,
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
                            bgcolor: alpha('#3b82f6', 0.04),
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
                    rows={filteredProducts}
                    columns={columns}
                    rowHeight={68}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                        sorting: { sortModel: [{ field: 'id', sort: 'desc' }] },
                    }}
                    localeText={{
                        noRowsLabel: 'Không có món nào',
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

            {/* Product Modal */}
            <ProductModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categories={categories}
                productToEdit={editingProduct}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={Boolean(deletingProduct)}
                onClose={() => setDeletingProduct(null)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa món"
                description={`Bạn có chắc chắn muốn xóa món "${deletingProduct?.name}" không?`}
            />
        </Box>
    );
}