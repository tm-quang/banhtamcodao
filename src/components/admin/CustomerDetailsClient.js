// src/components/admin/CustomerDetailsClient.js
'use client';
import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Chip, Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Edit, Trash2, ArrowLeft } from 'lucide-react'; // 1. Import icon ArrowLeft
import { DataGrid } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // 2. Import Link từ Next.js

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const OrderStatusModal = ({ open, onClose, onSave, order }) => {
    const [status, setStatus] = useState(order?.status || '');
    useEffect(() => { setStatus(order?.status || ''); }, [order]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogContent>
                <Typography sx={{mt: 2}}>Đơn hàng: <strong>{order?.order_code}</strong></Typography>
                <FormControl fullWidth sx={{mt: 2}}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select value={status} label="Trạng thái" onChange={(e) => setStatus(e.target.value)}>
                        <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
                        <MenuItem value="Đã xác nhận">Đã xác nhận</MenuItem>
                        <MenuItem value="Đang vận chuyển">Đang vận chuyển</MenuItem>
                        <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                        <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={() => onSave(order.id, status)} variant="contained">Lưu</Button>
            </DialogActions>
        </Dialog>
    );
};

export default function CustomerDetailsClient({ customer, initialOrders }) {
    const router = useRouter();
    const [orders, setOrders] = useState(initialOrders);
    const [deletingOrder, setDeletingOrder] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    
    const handleDeleteOrder = async () => {
        if (!deletingOrder) return;
        const res = await fetch(`/api/admin/orders/${deletingOrder.id}`, { method: 'DELETE' });
        if(res.ok) {
            alert('Xóa đơn hàng thành công!');
            setOrders(prev => prev.filter(o => o.id !== deletingOrder.id));
        } else {
            alert('Xóa thất bại!');
        }
        setDeletingOrder(null);
    };

    const handleUpdateStatus = async (orderId, status) => {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if(res.ok) {
            alert('Cập nhật thành công!');
            setOrders(prev => prev.map(o => o.id === orderId ? {...o, status} : o));
        } else {
            alert('Cập nhật thất bại!');
        }
        setEditingOrder(null);
    }
    
    const columns = [
        { field: 'order_code', headerName: 'Mã ĐH', width: 150 },
        { field: 'order_time', headerName: 'Ngày đặt', width: 150, valueFormatter: (value) => format(new Date(value), 'dd/MM/yyyy HH:mm') },
        { field: 'total_amount', headerName: 'Tổng tiền', width: 120, valueFormatter: (value) => formatCurrency(value) },
        { field: 'status', headerName: 'Trạng thái', width: 150, renderCell: (params) => <Chip label={params.value} color="primary" size="small" /> },
        {
            field: 'actions', headerName: 'Hành động', width: 120,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" color="info" onClick={() => setEditingOrder(params.row)}><Edit size={18} /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeletingOrder(params.row)}><Trash2 size={18} /></IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box>
             {/* 3. THÊM NÚT QUAY LẠI TẠI ĐÂY */}
            <Button
                component={Link}
                href="/admin/customers"
                startIcon={<ArrowLeft size={18} />}
                sx={{ mb: 2 }}
            >
                Quay lại danh sách
            </Button>
            
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h4" gutterBottom>Chi tiết Khách hàng</Typography>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>{customer.full_name}</Typography>
                        <Typography><strong>Email:</strong> {customer.email || 'N/A'}</Typography>
                        <Typography><strong>SĐT:</strong> {customer.phone_number || 'N/A'}</Typography>
                        <Typography><strong>Username:</strong> {customer.username}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                     <Typography variant="h5" gutterBottom>Lịch sử Đơn hàng</Typography>
                     <Paper sx={{ height: '60vh', width: '100%' }}>
                         <DataGrid rows={orders} columns={columns} />
                     </Paper>
                </Grid>
                
                <Dialog open={Boolean(deletingOrder)} onClose={() => setDeletingOrder(null)}>
                     <DialogTitle>Xác nhận xóa</DialogTitle>
                     <DialogContent><DialogContentText>Bạn có chắc muốn xóa đơn hàng "{deletingOrder?.order_code}" không?</DialogContentText></DialogContent>
                     <DialogActions>
                         <Button onClick={() => setDeletingOrder(null)}>Hủy</Button>
                         <Button onClick={handleDeleteOrder} color="error">Xóa</Button>
                     </DialogActions>
                </Dialog>

                <OrderStatusModal open={Boolean(editingOrder)} onClose={() => setEditingOrder(null)} onSave={handleUpdateStatus} order={editingOrder} />
            </Grid>
        </Box>
    );
}