// src/components/admin/OrderEditModal.js
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem, Typography, Box } from '@mui/material';

export default function OrderEditModal({ open, onClose, onSave, order }) {
    const [data, setData] = useState({});

    useEffect(() => {
        if (order) {
            // Nếu order có status là "Đã hủy", tự động set payment_status thành "cancelled"
            const orderData = { ...order };
            if (orderData.status === 'Đã hủy' && orderData.payment_status !== 'cancelled') {
                orderData.payment_status = 'cancelled';
            }
            setData(orderData);
        }
    }, [order]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Nếu status được đổi thành "Đã hủy", tự động set payment_status thành "cancelled"
        if (name === 'status' && value === 'Đã hủy') {
            setData(prev => ({ ...prev, [name]: value, payment_status: 'cancelled' }));
        } else {
            setData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        // Chỉ gửi những trường cần thiết để cập nhật
        const { id, status, payment_status, recipient_name, phone_number, delivery_address, note } = data;
        onSave({ id, status, payment_status, recipient_name, phone_number, delivery_address, note });
    };

    if (!order) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: '16px', // Bo góc xl
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }
            }}
        >
            <DialogTitle sx={{ 
                borderBottom: '1px solid #E5E7EB',
                pb: 2,
                px: 3,
                pt: 3,
                fontWeight: 600,
                color: '#111827',
                fontSize: '1.25rem'
            }}>
                Chỉnh Sửa Đơn Hàng: #{order.order_code}
            </DialogTitle>
            <DialogContent sx={{ px: 3, pt: 6, pb: 2 }}>
                <Box>
                    {/* Thông tin khách hàng */}
                    <Box sx={{ 
                        bgcolor: '#F9FAFB', 
                        borderRadius: '12px', 
                        p: 2.5, 
                        mb: 3 
                    }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#111827' }}>
                            Thông tin khách hàng
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    name="recipient_name" 
                                    label="Tên người nhận" 
                                    value={data.recipient_name || ''} 
                                    onChange={handleChange} 
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            bgcolor: '#FFFFFF'
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    name="phone_number" 
                                    label="Số điện thoại" 
                                    value={data.phone_number || ''} 
                                    onChange={handleChange} 
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            bgcolor: '#FFFFFF'
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    name="delivery_address" 
                                    label="Địa chỉ" 
                                    value={data.delivery_address || ''} 
                                    onChange={handleChange} 
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            bgcolor: '#FFFFFF'
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Trạng thái */}
                    <Box sx={{ 
                        bgcolor: '#F9FAFB', 
                        borderRadius: '12px', 
                        p: 2.5, 
                        mb: 3 
                    }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#111827' }}>
                            Trạng thái
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    name="status" 
                                    label="Trạng thái đơn hàng" 
                                    value={data.status || ''} 
                                    onChange={handleChange} 
                                    select 
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            bgcolor: '#FFFFFF'
                                        }
                                    }}
                                >
                                    <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
                                    <MenuItem value="Đã xác nhận">Đã xác nhận</MenuItem>
                                    <MenuItem value="Đang vận chuyển">Đang vận chuyển</MenuItem>
                                    <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                                    <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    name="payment_status" 
                                    label="Trạng thái thanh toán" 
                                    value={data.payment_status || ''} 
                                    onChange={handleChange} 
                                    select 
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            bgcolor: '#FFFFFF'
                                        }
                                    }}
                                    disabled={data.status === 'Đã hủy'}
                                >
                                    <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
                                    <MenuItem value="paid">Đã thanh toán</MenuItem>
                                    <MenuItem value="cancelled">Hủy T.Toán</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Ghi chú */}
                    <Box sx={{ 
                        bgcolor: '#F9FAFB', 
                        borderRadius: '12px', 
                        p: 2.5, 
                        mb: 3 
                    }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#111827' }}>
                            Ghi chú
                        </Typography>
                        <TextField 
                            name="note" 
                            label="Ghi chú" 
                            value={data.note || ''} 
                            onChange={handleChange} 
                            multiline 
                            rows={3} 
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    bgcolor: '#FFFFFF'
                                }
                            }}
                        />
                    </Box>

                    {/* Thông báo sắp có */}
                    <Box sx={{ 
                        bgcolor: '#FEF3C7', 
                        borderRadius: '12px', 
                        p: 2.5,
                        border: '1px solid #FDE68A'
                    }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#92400E' }}>
                            Chỉnh sửa món ăn (sắp có)
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#78350F' }}>
                            Chức năng chỉnh sửa chi tiết các món trong đơn hàng sẽ được phát triển ở phiên bản sau.
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ 
                px: 3, 
                pb: 3, 
                pt: 2,
                borderTop: '1px solid #E5E7EB',
                gap: 1.5
            }}>
                <Button 
                    onClick={onClose}
                    sx={{
                        color: '#6B7280',
                        fontWeight: 500,
                        textTransform: 'none',
                        px: 3,
                        '&:hover': {
                            bgcolor: '#F3F4F6'
                        }
                    }}
                >
                    Hủy
                </Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained"
                    sx={{
                        bgcolor: '#3B82F6',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 3,
                        borderRadius: '8px',
                        '&:hover': {
                            bgcolor: '#2563EB'
                        }
                    }}
                >
                    Lưu thay đổi
                </Button>
            </DialogActions>
        </Dialog>
    );
}