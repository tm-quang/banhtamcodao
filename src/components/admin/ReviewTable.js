// src/components/admin/ReviewTable.js
'use client';
import React, { useState, useMemo } from 'react';
import {
    Box, Paper, Typography, Chip, IconButton, TextField, MenuItem, Rating,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button,
    alpha, InputAdornment, Tooltip, Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { CheckCircle, XCircle, Trash2, Search, Star, X, MessageSquare, Clock, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/context/ToastContext';


// Confirmation Dialog
const ConfirmationDialog = ({ open, onClose, onConfirm, title, message }) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
    >
        <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
        <DialogContent><DialogContentText>{message}</DialogContentText></DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Hủy</Button>
            <Button onClick={onConfirm} variant="contained" sx={{ borderRadius: 2 }}>Xác nhận</Button>
        </DialogActions>
    </Dialog>
);

const getStatusChip = (status) => {
    const statusMap = {
        pending: { label: 'Chờ duyệt', color: '#FFFFFF', bg: alpha('#f59e0b', 1) },
        approved: { label: 'Đã duyệt', color: '#FFFFFF', bg: alpha('#16a34a', 1) },
        rejected: { label: 'Từ chối', color: '#FFFFFF', bg: alpha('#ef4444', 1) },
    };
    const { label, color, bg } = statusMap[status] || { label: status, color: '#FFFFFF', bg: alpha('#4b5563', 1) };
    return (
        <Chip
            label={label}
            size="small"
            sx={{
                bgcolor: bg,
                color: color,
                fontWeight: 500,
                fontSize: '0.9rem',
            }}
        />
    );
};

export default function ReviewTable({ initialReviews }) {
    const [reviews, setReviews] = useState(initialReviews);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const { showToast } = useToast();
    const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Stats
    const stats = useMemo(() => ({
        total: reviews.length,
        pending: reviews.filter(r => r.status === 'pending').length,
        approved: reviews.filter(r => r.status === 'approved').length,
    }), [reviews]);

    const handleUpdateStatus = (id, status) => {
        setConfirm({
            isOpen: true,
            title: 'Xác nhận hành động',
            message: `Bạn có chắc muốn ${status === 'approved' ? 'DUYỆT' : 'TỪ CHỐI'} đánh giá này?`,
            onConfirm: async () => {
                const res = await fetch(`/api/admin/reviews/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                });
                if (res.ok) {
                    setReviews(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
                    showToast(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} đánh giá!`, 'success');
                } else {
                    showToast('Cập nhật thất bại!', 'error');
                }
                setConfirm({ isOpen: false });
            }
        });
    };

    const handleDelete = (id) => {
        setConfirm({
            isOpen: true,
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc chắn muốn XÓA vĩnh viễn đánh giá này?',
            onConfirm: async () => {
                const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setReviews(prev => prev.filter(r => r.id !== id));
                    showToast('Xóa đánh giá thành công!', 'success');
                } else {
                    showToast('Xóa thất bại!', 'error');
                }
                setConfirm({ isOpen: false });
            }
        });
    };

    const filteredReviews = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return reviews.filter(review => {
            const searchMatch = !search ||
                (review.product_name && review.product_name.toLowerCase().includes(search)) ||
                (review.customer_name && review.customer_name.toLowerCase().includes(search)) ||
                (review.comment && review.comment.toLowerCase().includes(search));
            const statusMatch = !statusFilter || review.status === statusFilter;
            return searchMatch && statusMatch;
        });
    }, [reviews, searchTerm, statusFilter]);

    const columns = [
        {
            field: 'product_name',
            headerName: 'Sản phẩm',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'customer_name',
            headerName: 'Khách hàng',
            width: 140,
            renderCell: (params) => (
                <span className="text-sm text-gray-700">{params.value}</span>
            )
        },
        {
            field: 'rating',
            headerName: 'Đánh giá',
            width: 130,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={params.value} readOnly size="small" />
                    <span className="text-xs text-gray-500">({params.value})</span>
                </Box>
            )
        },
        {
            field: 'comment',
            headerName: 'Nội dung',
            flex: 2,
            minWidth: 200,
            renderCell: (params) => (
                <Typography
                    sx={{
                        fontSize: '0.8rem',
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 110,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => getStatusChip(params.value)
        },
        {
            field: 'created_at',
            headerName: 'Ngày gửi',
            width: 100,
            renderCell: (params) => (
                <span className="text-xs text-gray-500">
                    {params.value ? format(new Date(params.value), 'dd/MM/yy') : ''}
                </span>
            )
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
                        {params.row.status !== 'approved' && (
                            <Tooltip title="Duyệt" arrow>
                                <IconButton
                                    size="medium"
                                    onClick={() => handleUpdateStatus(params.row.id, 'approved')}
                                    sx={{ 
                                        color: '#10b981', 
                                        '&:hover': { bgcolor: alpha('#10b981', 0.1) },
                                        width: 40,
                                        height: 40,
                                    }}
                                >
                                    <CheckCircle size={20} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {params.row.status !== 'rejected' && (
                            <Tooltip title="Từ chối" arrow>
                                <IconButton
                                    size="medium"
                                    onClick={() => handleUpdateStatus(params.row.id, 'rejected')}
                                    sx={{ 
                                        color: '#f59e0b', 
                                        '&:hover': { bgcolor: alpha('#f59e0b', 0.1) },
                                        width: 40,
                                        height: 40,
                                    }}
                                >
                                    <XCircle size={20} />
                                </IconButton>
                            </Tooltip>
                        )}
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
        },
    ];

    const hasFilters = searchTerm || statusFilter;

    return (
        <Box 
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            suppressHydrationWarning={true}
        >
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Quản lý đánh giá</h1>
                    <span className="text-sm text-gray-500">({stats.total} đánh giá)</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {/* Tổng đánh giá */}
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
                    <Star 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <Star size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.total}</p>
                        <p className="text-sm opacity-90">Tổng đánh giá</p>
                    </div>
                </Box>
                {/* Chờ duyệt */}
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
                        <p className="text-sm opacity-90">Chờ duyệt</p>
                    </div>
                </Box>
                {/* Đã duyệt */}
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
                    <ThumbsUp 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <ThumbsUp size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.approved}</p>
                        <p className="text-sm opacity-90">Đã duyệt</p>
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
                            flex: 1,
                            minWidth: 180,
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
                        sx={{
                            width: 130,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.8rem',
                            }
                        }}
                    >
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value="pending">Chờ duyệt</MenuItem>
                        <MenuItem value="approved">Đã duyệt</MenuItem>
                        <MenuItem value="rejected">Từ chối</MenuItem>
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
                    rows={filteredReviews}
                    columns={columns}
                    rowHeight={68}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                        sorting: { sortModel: [{ field: 'created_at', sort: 'desc' }] },
                    }}
                    localeText={{
                        noRowsLabel: 'Không có đánh giá nào',
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

            <ConfirmationDialog
                open={confirm.isOpen}
                onClose={() => setConfirm({ isOpen: false })}
                onConfirm={confirm.onConfirm}
                title={confirm.title}
                message={confirm.message}
            />
        </Box>
    );
}