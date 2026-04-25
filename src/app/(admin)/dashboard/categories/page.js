/**
 * Admin categories management page - COMPACT UI
 * @file src/app/(admin)/dashboard/categories/page.js
 */
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Button, Paper, Typography, IconButton,
    Stack, Chip, TextField, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, Tooltip, alpha, InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2, FolderTree, Layers, Search, Tag, Link2, X, Package, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CategoryModal from '@/components/admin/CategoryModal';
import ClientNoSSR from '@/components/ClientNoSSR';


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

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    // Calculate stats
    const stats = useMemo(() => ({
        total: categories.length,
        parent: categories.filter(c => !c.parent_id).length,
        child: categories.filter(c => c.parent_id).length,
    }), [categories]);

    // Filter categories
    const filteredCategories = useMemo(() => {
        return categories.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.slug.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            if (data.success) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSave = async (categoryData) => {
        const isEditMode = Boolean(categoryData.id);
        const url = isEditMode ? `/api/admin/categories/${categoryData.id}` : '/api/admin/categories';
        const method = isEditMode ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData),
        });

        if (res.ok) {
            setIsModalOpen(false);
            fetchCategories();
        } else {
            alert('Có lỗi xảy ra!');
        }
    };

    const confirmDelete = async () => {
        if (!deletingCategory) return;

        const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, { method: 'DELETE' });
        if (res.ok) {
            setDeletingCategory(null);
            fetchCategories();
        } else {
            alert('Xóa thất bại!');
        }
    };

    // Get parent category name
    const getParentName = (parentId) => {
        if (!parentId) return null;
        const parent = categories.find(c => c.id === parentId);
        return parent?.name || `ID: ${parentId}`;
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
            field: 'name',
            headerName: 'Tên Danh mục',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', py: 0.5 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', lineHeight: 1.3 }}>
                        {params.value}
                    </Typography>
                    {params.row.parent_id && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                            ↳ {getParentName(params.row.parent_id)}
                        </Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'slug',
            headerName: 'Slug',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Chip
                    icon={<Link2 size={12} />}
                    label={params.value}
                    size="small"
                    variant="outlined"
                    sx={{
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        borderColor: alpha('#3b82f6', 0.3),
                        color: '#3b82f6',
                        bgcolor: alpha('#3b82f6', 0.05),
                    }}
                />
            )
        },
        {
            field: 'parent_id',
            headerName: 'Loại',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                params.value ? (
                    <Chip
                        label="Con"
                        size="small"
                        sx={{
                            bgcolor: alpha('#f59e0b', 1),
                            color: '#FFFFFF',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                        }}
                    />
                ) : (
                    <Chip
                        label="Gốc"
                        size="small"
                        sx={{
                            bgcolor: alpha('#16a34a', 1),
                            color: '#FFFFFF',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                        }}
                    />
                )
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
                                onClick={() => { setEditingCategory(params.row); setIsModalOpen(true); }}
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
                                onClick={() => setDeletingCategory(params.row)}
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
        <ClientNoSSR>
            <Box 
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                suppressHydrationWarning={true}
            >
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Quản lý danh mục</h1>
                    <span className="text-sm text-gray-500">({stats.total} danh mục)</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {/* Tổng danh mục */}
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
                    <FolderTree 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <FolderTree size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.total}</p>
                        <p className="text-sm opacity-90">Tổng danh mục</p>
                    </div>
                </Box>
                {/* Danh mục gốc */}
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
                    <Layers 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <Layers size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.parent}</p>
                        <p className="text-sm opacity-90">Danh mục gốc</p>
                    </div>
                </Box>
                {/* Danh mục con */}
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
                    <Tag 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <Tag size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.child}</p>
                        <p className="text-sm opacity-90">Danh mục con</p>
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
                            sx={{
                                color: 'text.secondary',
                                textTransform: 'none',
                                fontSize: '0.8rem',
                            }}
                        >
                            Xóa lọc
                        </Button>
                    )}

                    {/* Add Button */}
                    <Button
                        variant="contained"
                        startIcon={<PlusCircle size={18} />}
                        onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
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
                        + Thêm danh mục
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
                            bgcolor: alpha('#2563eb', 0.04),
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
                    rows={filteredCategories}
                    columns={columns}
                    loading={loading}
                    rowHeight={68}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                        sorting: { sortModel: [{ field: 'id', sort: 'asc' }] },
                    }}
                    localeText={{
                        noRowsLabel: 'Không có danh mục nào',
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

            {/* Category Modal */}
            <CategoryModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                categoryToEdit={editingCategory}
                categories={categories}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={Boolean(deletingCategory)}
                onClose={() => setDeletingCategory(null)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa danh mục"
                description={`Bạn có chắc chắn muốn xóa danh mục "${deletingCategory?.name}" không?`}
            />
            </Box>
        </ClientNoSSR>
    );
}