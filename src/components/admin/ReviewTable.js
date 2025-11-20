// src/components/admin/ReviewTable.js
'use client';
import React, { useState, useMemo } from 'react';
import { Box, Paper, Typography, Chip, IconButton, TextField, MenuItem, Rating, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/context/ToastContext';

// --- COMPONENT MỚI: DIALOG XÁC NHẬN ---
const ConfirmationDialog = ({ open, onClose, onConfirm, title, message }) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent><DialogContentText>{message}</DialogContentText></DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Hủy</Button>
            <Button onClick={onConfirm} color="primary" variant="contained">Xác nhận</Button>
        </DialogActions>
    </Dialog>
);

const getStatusChip = (status) => {
    const statusMap = {
        pending: { label: 'Chờ duyệt', color: 'warning' },
        approved: { label: 'Đã duyệt', color: 'success' },
        rejected: { label: 'Đã từ chối', color: 'error' },
    };
    const { label, color } = statusMap[status] || { label: status, color: 'default' };
    return <Chip label={label} color={color} size="small" />;
};

export default function ReviewTable({ initialReviews }) {
    const [reviews, setReviews] = useState(initialReviews);
    const [filters, setFilters] = useState({ searchTerm: '', status: '' });
    const { showToast } = useToast();
    // State mới để quản lý dialog
    const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleUpdateStatus = (id, status) => {
        // Mở dialog thay vì gọi confirm()
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
                setConfirm({ isOpen: false }); // Đóng dialog sau khi thực hiện
            }
        });
    };

    const handleDelete = (id) => {
        // Mở dialog thay vì gọi confirm()
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
                setConfirm({ isOpen: false }); // Đóng dialog
            }
        });
    };

    const filteredReviews = useMemo(() => {
        return reviews.filter(review => {
            const searchTerm = filters.searchTerm.toLowerCase();
            const searchMatch = !searchTerm ||
                (review.product_name && review.product_name.toLowerCase().includes(searchTerm)) ||
                (review.customer_name && review.customer_name.toLowerCase().includes(searchTerm)) ||
                (review.comment && review.comment.toLowerCase().includes(searchTerm));
            const statusMatch = !filters.status || review.status === filters.status;
            return searchMatch && statusMatch;
        });
    }, [reviews, filters]);

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'product_name', headerName: 'Sản phẩm', flex: 1, minWidth: 200 },
        { field: 'customer_name', headerName: 'Khách hàng', width: 150 },
        { field: 'rating', headerName: 'Đánh giá', width: 150, renderCell: (params) => <Rating value={params.value} readOnly /> },
        { field: 'comment', headerName: 'Nội dung', flex: 2, minWidth: 250 },
        { field: 'status', headerName: 'Trạng thái', width: 150, renderCell: (params) => getStatusChip(params.value) },
        { field: 'created_at', headerName: 'Ngày gửi', width: 150, valueFormatter: (value) => value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '' },
        {
            field: 'actions', headerName: 'Hành động', width: 150, align: 'center', sortable: false,
            renderCell: (params) => (
                <Box>
                    {params.row.status !== 'approved' && (
                        <IconButton size="small" color="success" onClick={() => handleUpdateStatus(params.row.id, 'approved')} title="Duyệt">
                            <CheckCircle size={18} />
                        </IconButton>
                    )}
                    {params.row.status !== 'rejected' && (
                         <IconButton size="small" color="warning" onClick={() => handleUpdateStatus(params.row.id, 'rejected')} title="Từ chối">
                            <XCircle size={18} />
                        </IconButton>
                    )}
                    <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)} title="Xóa">
                        <Trash2 size={18} />
                    </IconButton>
                </Box>
            )
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Quản lý Đánh giá
                </Typography>
            </Box>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, bgcolor: 'background.default' }}>
                <TextField variant="outlined" size="small" placeholder="Tìm theo sản phẩm, khách hàng, nội dung..." onChange={(e) => handleFilterChange('searchTerm', e.target.value)} sx={{ flexGrow: 1, minWidth: 250, bgcolor: 'white' }} />
                <TextField select variant="outlined" size="small" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} SelectProps={{ displayEmpty: true }} sx={{ minWidth: 180, bgcolor: 'white' }}>
                    <MenuItem value=""><em>Tất cả trạng thái</em></MenuItem>
                    <MenuItem value="pending">Chờ duyệt</MenuItem>
                    <MenuItem value="approved">Đã duyệt</MenuItem>
                    <MenuItem value="rejected">Đã từ chối</MenuItem>
                </TextField>
            </Paper>
            <Paper sx={{ height: '75vh', width: '100%' }}>
                <DataGrid
                    rows={filteredReviews}
                    columns={columns}
                    checkboxSelection
                    disableRowSelectionOnClick
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8fafc' },
                    }}
                />
            </Paper>
            {/* Thêm Dialog vào cuối */}
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