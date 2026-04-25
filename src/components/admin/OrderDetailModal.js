// src/components/admin/OrderDetailModal.js
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Chip, CircularProgress, Divider, Grid } from '@mui/material';
import { X as CloseIcon, User, Phone, MapPin, Truck, Calendar, FileText, ShoppingCart, Receipt, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const InfoRow = ({ label, value, icon: Icon }) => (
    <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        py: 1.5,
        borderBottom: '1px solid #E5E7EB',
        '&:last-child': {
            borderBottom: 'none'
        }
    }}>
        {Icon && (
            <Box sx={{ 
                mr: 1.5, 
                color: '#6B7280',
                display: 'flex',
                alignItems: 'center'
            }}>
                <Icon size={18} />
            </Box>
        )}
        <Typography variant="body2" sx={{ 
            width: Icon ? '120px' : '140px', 
            color: '#6B7280',
            fontWeight: 500,
            flexShrink: 0
        }}>
            {label}:
        </Typography>
        <Typography variant="body2" sx={{ 
            fontWeight: 600, 
            color: '#111827',
            flex: 1
        }}>
            {value}
        </Typography>
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

    const getStatusColor = (status) => {
        const colors = {
            'Chờ xác nhận': { bg: '#F59E0B', color: '#FFFFFF' },
            'Đã xác nhận': { bg: '#3B82F6', color: '#FFFFFF' },
            'Đang vận chuyển': { bg: '#0EA5E9', color: '#FFFFFF' },
            'Hoàn thành': { bg: '#16A34A', color: '#FFFFFF' },
            'Đã hủy': { bg: '#EF4444', color: '#FFFFFF' },
        };
        return colors[status] || { bg: '#6B7280', color: '#FFFFFF' };
    };

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
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid #E5E7EB',
                pb: 2.5,
                px: 3.5,
                pt: 3.5,
                bgcolor: '#F9FAFB'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '10px',
                        bgcolor: '#3B82F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                    }}>
                        <Receipt size={20} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                            Chi Tiết Đơn Hàng
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                            #{order?.order_code}
                        </Typography>
                    </Box>
                </Box>
                <IconButton 
                    onClick={onClose}
                    sx={{ 
                        color: '#6B7280',
                        '&:hover': { 
                            bgcolor: '#F3F4F6',
                            color: '#111827'
                        },
                        transition: 'all 0.2s'
                    }}
                >
                    <CloseIcon size={20} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3.5, px: 3.5, pb: 3.5, bgcolor: '#FFFFFF' }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                        <CircularProgress sx={{ color: '#3B82F6' }} />
                    </Box>
                )}
                {!loading && order && (
                    <Box>
                        {/* Thông tin đơn hàng */}
                        <Box sx={{ 
                            bgcolor: '#FFFFFF', 
                            borderRadius: '12px', 
                            border: '1px solid #E5E7EB',
                            p: 3, 
                            mb: 2,
                            mt: 2,
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <User size={20} color="#3B82F6" />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                                    Thông tin đơn hàng
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <InfoRow label="Mã đơn hàng" value={order.order_code} />
                                <InfoRow label="Khách hàng" value={order.recipient_name || 'N/A'} icon={User} />
                                <InfoRow label="SĐT" value={order.phone_number || 'N/A'} icon={Phone} />
                                <InfoRow label="Hình thức" value={order.delivery_method === 'delivery' ? 'Giao hàng' : 'Tự đến lấy'} icon={Truck} />
                                <InfoRow label="Địa chỉ" value={order.delivery_address || 'N/A'} icon={MapPin} />
                                <InfoRow label="Ngày giao/lấy" value={`${format(new Date(order.delivery_date), 'dd/MM/yyyy')} lúc ${order.delivery_time?.substring(0, 5) || 'N/A'}`} icon={Calendar} />
                                <InfoRow label="Ghi chú" value={order.note || 'Không có'} icon={FileText} />
                            </Box>
                        </Box>

                        {/* Danh sách món */}
                        <Box sx={{ 
                            bgcolor: '#FFFFFF', 
                            borderRadius: '12px', 
                            border: '1px solid #E5E7EB',
                            p: 3, 
                            mb: 2,
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                <ShoppingCart size={20} color="#3B82F6" />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                                    Danh sách món
                                </Typography>
                            </Box>
                            {/* Bảng danh sách món */}
                            <Box sx={{ 
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                {/* Header */}
                                <Box sx={{ 
                                    display: 'grid',
                                    gridTemplateColumns: '50px 1fr 100px 120px 140px',
                                    bgcolor: '#F9FAFB',
                                    borderBottom: '2px solid #E5E7EB',
                                    p: 1.5,
                                    gap: 2
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', textAlign: 'center' }}>
                                        STT
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                                        Tên món
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', textAlign: 'center' }}>
                                        Số lượng
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', textAlign: 'right' }}>
                                        Đơn giá
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', textAlign: 'right' }}>
                                        Thành tiền
                                    </Typography>
                                </Box>
                                {/* Body */}
                                <Box>
                                    {order.parsed_items?.map((item, index) => (
                                        <Box 
                                            key={index}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '50px 1fr 100px 120px 140px',
                                                p: 1.5,
                                                gap: 2,
                                                borderBottom: '1px solid #E5E7EB',
                                                '&:last-child': {
                                                    borderBottom: 'none'
                                                },
                                                '&:hover': {
                                                    bgcolor: '#F9FAFB'
                                                },
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center' }}>
                                                {index + 1}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                                                {item.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#374151', textAlign: 'center' }}>
                                                {item.qty}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#374151', textAlign: 'right' }}>
                                                {formatCurrency(item.totalPrice / item.qty)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', textAlign: 'right' }}>
                                                {formatCurrency(item.totalPrice)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>

                        {/* Tổng tiền */}
                        <Box sx={{ 
                            bgcolor: '#FFFFFF', 
                            borderRadius: '12px', 
                            border: '1px solid #E5E7EB',
                            p: 3, 
                            mb: 2,
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                <Receipt size={20} color="#3B82F6" />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                                    Tổng tiền
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                    <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                        Tổng tiền hàng:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                                        {formatCurrency(order.subtotal)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                    <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                        Phí ship:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                                        {formatCurrency(order.shipping_fee)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                    <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                        Giảm giá:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#16A34A' }}>
                                        - {formatCurrency(order.discount_amount)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ my: 2, borderColor: '#E5E7EB' }} />
                            <Box sx={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2,
                                bgcolor: '#FEF2F2',
                                borderRadius: '8px',
                                border: '1px solid #FECACA'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                                    Tổng cộng:
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#EF4444' }}>
                                    {formatCurrency(order.total_amount)}
                                </Typography>
                            </Box>
                        </Box>
                        
                        {/* Trạng thái */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            bgcolor: '#FFFFFF',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            p: 3,
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CheckCircle size={20} color="#3B82F6" />
                                <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600 }}>
                                    Trạng thái đơn hàng:
                                </Typography>
                            </Box>
                            <Chip 
                                label={order.status} 
                                icon={<CheckCircle size={16} />}
                                sx={{
                                    bgcolor: getStatusColor(order.status).bg,
                                    color: getStatusColor(order.status).color,
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    height: '36px',
                                    fontSize: '0.875rem',
                                    '& .MuiChip-icon': {
                                        color: getStatusColor(order.status).color
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}