// src/components/admin/ReviewTable.js
'use client';
import React, { useState, useMemo } from 'react';
import {
    Box, Paper, Typography, Chip, IconButton, TextField, MenuItem, Rating,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button,
    alpha, InputAdornment, Tooltip, Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { CheckCircle, XCircle, Trash2, Search, Star, X, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/context/ToastContext';

// Stats Badge Component
const StatBadge = ({ label, value, color }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color}`}>
        <span className="text-sm font-bold">{value}</span>
        <span className="text-xs opacity-80">{label}</span>
    </div>
);

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
        pending: { label: 'Chờ duyệt', color: '#f59e0b', bg: alpha('#f59e0b', 0.1) },
        approved: { label: 'Đã duyệt', color: '#10b981', bg: alpha('#10b981', 0.1) },
        rejected: { label: 'Từ chối', color: '#ef4444', bg: alpha('#ef4444', 0.1) },
    };
    const { label, color, bg } = statusMap[status] || { label: status, color: '#6b7280', bg: alpha('#6b7280', 0.1) };
    return (
        <Chip
            label={label}
            size="small"
            sx={{
                bgcolor: bg,
                color: color,
                fontWeight: 600,
                fontSize: '0.7rem',
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
            headerName: '',
            width: 110,
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5}>
                    {params.row.status !== 'approved' && (
                        <Tooltip title="Duyệt" arrow>
                            <IconButton
                                size="small"
                                onClick={() => handleUpdateStatus(params.row.id, 'approved')}
                                sx={{ color: '#10b981', '&:hover': { bgcolor: alpha('#10b981', 0.1) } }}
                            >
                                <CheckCircle size={16} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {params.row.status !== 'rejected' && (
                        <Tooltip title="Từ chối" arrow>
                            <IconButton
                                size="small"
                                onClick={() => handleUpdateStatus(params.row.id, 'rejected')}
                                sx={{ color: '#f59e0b', '&:hover': { bgcolor: alpha('#f59e0b', 0.1) } }}
                            >
                                <XCircle size={16} />
                            </IconButton>
                        </Tooltip>
                    )}
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
        },
    ];

    const hasFilters = searchTerm || statusFilter;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Đánh giá</h1>
                    <span className="text-sm text-gray-500">({stats.total} đánh giá)</span>
                </div>
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
                        <StatBadge label="Chờ duyệt" value={stats.pending} color="bg-amber-100 text-amber-700" />
                        <StatBadge label="Đã duyệt" value={stats.approved} color="bg-green-100 text-green-700" />
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
                    rowHeight={60}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
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