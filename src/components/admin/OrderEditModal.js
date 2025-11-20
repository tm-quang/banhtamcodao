// src/components/admin/OrderEditModal.js
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem, Typography, Box } from '@mui/material';

export default function OrderEditModal({ open, onClose, onSave, order }) {
    const [data, setData] = useState({});

    useEffect(() => {
        if (order) {
            setData(order);
        }
    }, [order]);

    const handleChange = (e) => {
        setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        // Chỉ gửi những trường cần thiết để cập nhật
        const { id, status, payment_status, recipient_name, phone_number, delivery_address, note } = data;
        onSave({ id, status, payment_status, recipient_name, phone_number, delivery_address, note });
    };

    if (!order) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Chỉnh Sửa Đơn Hàng: #{order.order_code}</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Thông tin khách hàng</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField name="recipient_name" label="Tên người nhận" value={data.recipient_name || ''} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="phone_number" label="Số điện thoại" value={data.phone_number || ''} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12}><TextField name="delivery_address" label="Địa chỉ" value={data.delivery_address || ''} onChange={handleChange} fullWidth /></Grid>
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Trạng thái</Typography>
                     <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField name="status" label="Trạng thái đơn hàng" value={data.status || ''} onChange={handleChange} select fullWidth>
                                <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
                                <MenuItem value="Đã xác nhận">Đã xác nhận</MenuItem>
                                <MenuItem value="Đang vận chuyển">Đang vận chuyển</MenuItem>
                                <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                                <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="payment_status" label="Trạng thái thanh toán" value={data.payment_status || ''} onChange={handleChange} select fullWidth>
                                <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
                                <MenuItem value="paid">Đã thanh toán</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Ghi chú</Typography>
                    <TextField name="note" label="Ghi chú" value={data.note || ''} onChange={handleChange} multiline rows={3} fullWidth />

                    <Typography variant="h6" gutterBottom sx={{ mt: 4, color: 'text.secondary' }}>Chỉnh sửa món ăn (sắp có)</Typography>
                    <Typography variant="body2" color="text.secondary">Chức năng chỉnh sửa chi tiết các món trong đơn hàng sẽ được phát triển ở phiên bản sau.</Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSave} variant="contained">Lưu thay đổi</Button>
            </DialogActions>
        </Dialog>
    );
}