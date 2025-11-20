// src/components/admin/OrderDetailModal.js
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Chip, CircularProgress } from '@mui/material';
import { X as CloseIcon } from 'lucide-react';
import { format } from 'date-fns';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const InfoRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', py: 1 }}>
        <Typography variant="body2" sx={{ width: '120px', color: 'text.secondary' }}>{label}:</Typography>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{value}</Typography>
    </Box>
);

export default function OrderDetailModal({ orderId, open, onClose }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (orderId) {
            setLoading(true);
            fetch(`/api/admin/orders/${orderId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        // Xử lý chuỗi items_list
                        const items = data.order.items_list.split('|||').map(itemStr => {
                            try { return JSON.parse(itemStr); } catch { return null; }
                        }).filter(Boolean);
                        setOrder({ ...data.order, parsed_items: items });
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [orderId]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                Chi Tiết Đơn Hàng #{order?.order_code}
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}
                {!loading && order && (
                    <Box>
                        <InfoRow label="Mã đơn hàng" value={order.order_code} />
                        <InfoRow label="Khách hàng" value={order.recipient_name} />
                        <InfoRow label="SĐT" value={order.phone_number} />
                        <InfoRow label="Địa chỉ" value={order.delivery_address} />
                        <InfoRow label="Hình thức" value={order.delivery_method} />
                        <InfoRow label="Ngày giao/lấy" value={`${format(new Date(order.delivery_date), 'dd/MM/yyyy')} lúc ${order.delivery_time.substring(0, 5)}`} />
                        <InfoRow label="Ghi chú" value={order.note || 'Không có'} />

                        <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2, pt: 2 }}>
                            <Typography variant="h6" gutterBottom>Danh sách món:</Typography>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                                {order.parsed_items.map((item, index) => (
                                    <li key={index}>{item.name} x {item.qty} ({formatCurrency(item.totalPrice / item.qty)})</li>
                                ))}
                            </ul>
                        </Box>

                        <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2, pt: 2, fontWeight: 'medium' }}>
                            <InfoRow label="Tổng tiền hàng" value={formatCurrency(order.subtotal)} />
                            <InfoRow label="Phí ship" value={formatCurrency(order.shipping_fee)} />
                            <InfoRow label="Giảm giá" value={`- ${formatCurrency(order.discount_amount)}`} />
                            <Typography variant="h6" sx={{ mt: 1 }}>
                                Tổng cộng: <span style={{ color: '#ea580c', fontWeight: 'bold' }}>{formatCurrency(order.total_amount)}</span>
                            </Typography>
                        </Box>
                        
                        <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2, pt: 2 }}>
                             <Typography variant="body2" sx={{ color: 'text.secondary', display: 'inline' }}>Trạng thái: </Typography>
                             <Chip label={order.status} color="success" />
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}