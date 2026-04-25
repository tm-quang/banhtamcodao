// src/components/admin/CustomerDetailModal.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem,
    IconButton, CircularProgress, alpha, Box, Typography, Chip, Grid, Paper, Tabs, Tab
} from '@mui/material';
import { X, User, Mail, Phone, ShoppingCart, DollarSign, Edit, CheckCircle, Clock, Truck, XCircle, Package, MapPin, Calendar, Award, Shield, UserCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import CustomerModal from './CustomerModal';
import { useToast } from '@/context/ToastContext';

const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            border: `1px solid ${alpha(color, 0.2)}`,
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            >
                <Icon size={20} />
            </Box>
            <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    {label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    </Paper>
);

export default function CustomerDetailModal({ open, onClose, customerId, onCustomerUpdated }) {
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const { showToast } = useToast();

    // Fetch customer details and orders
    useEffect(() => {
        if (open && customerId) {
            fetchCustomerDetails();
        } else {
            setCustomer(null);
            setOrders([]);
        }
    }, [open, customerId]);

    const fetchCustomerDetails = async () => {
        setLoading(true);
        try {
            const [customerRes, ordersRes] = await Promise.all([
                fetch(`/api/admin/customers/${customerId}`),
                fetch(`/api/admin/customers/${customerId}/orders`)
            ]);

            if (customerRes.ok) {
                const customerData = await customerRes.json();
                if (customerData.success && customerData.customer) {
                    setCustomer(customerData.customer);
                } else {
                    showToast(customerData.message || 'Không tìm thấy thông tin khách hàng', 'error');
                }
            } else {
                const errorData = await customerRes.json().catch(() => ({}));
                showToast(errorData.message || `Lỗi ${customerRes.status}: Không thể tải thông tin khách hàng`, 'error');
            }

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                if (ordersData.success) {
                    setOrders(ordersData.orders || []);
                }
            } else {
                // Không hiển thị lỗi nếu không lấy được orders, chỉ set mảng rỗng
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching customer details:', error);
            showToast('Lỗi khi tải thông tin khách hàng: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats from orders
    const stats = useMemo(() => {
        if (!orders.length) {
            return {
                total: 0,
                completed: 0,
                pending: 0,
                shipping: 0,
                cancelled: 0,
                totalValue: 0,
            };
        }

        return {
            total: orders.length,
            completed: orders.filter(o => o.status === 'Hoàn thành').length,
            pending: orders.filter(o => o.status === 'Chờ xác nhận').length,
            shipping: orders.filter(o => o.status === 'Đang vận chuyển').length,
            cancelled: orders.filter(o => o.status === 'Đã hủy').length,
            totalValue: orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0),
        };
    }, [orders]);

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (customerData) => {
        try {
            // Chỉ gửi các trường cần thiết, loại bỏ id, username, password
            const { id, username, password, ...dataToUpdate } = customerData;
            
            const res = await fetch(`/api/admin/customers/${customerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToUpdate),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                showToast(result.message || 'Cập nhật thông tin khách hàng thành công!', 'success');
                setIsEditModalOpen(false);
                await fetchCustomerDetails(); // Refresh data
                if (onCustomerUpdated) onCustomerUpdated();
            } else {
                showToast(result.message || 'Cập nhật thất bại!', 'error');
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            showToast('Lỗi khi cập nhật khách hàng: ' + error.message, 'error');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Chờ xác nhận': '#f59e0b',
            'Đã xác nhận': '#3B82F6',
            'Đang vận chuyển': '#0ea5e9',
            'Hoàn thành': '#16a34a',
            'Đã hủy': '#EF4444',
        };
        return colors[status] || '#6B7280';
    };

    if (!open) return null;

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxHeight: '90vh',
                    }
                }}
            >
                {/* Header */}
                <DialogTitle sx={{
                    p: 0,
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#06b6d4',
                                }}
                            >
                                <User size={24} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                    Chi tiết khách hàng
                                </Typography>
                                {customer && (
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        {customer.full_name || 'N/A'}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <IconButton onClick={onClose} sx={{ color: 'white' }}>
                            <X size={20} />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : !customer ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="error">Không tìm thấy thông tin khách hàng</Typography>
                        </Box>
                    ) : (
                        <Box>
                            {/* Tabs */}
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                                <Tabs 
                                    value={activeTab} 
                                    onChange={(e, v) => setActiveTab(v)}
                                    sx={{
                                        '& .MuiTab-root': {
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            fontSize: '0.875rem',
                                            minHeight: 48,
                                            '&.Mui-selected': {
                                                color: '#06b6d4',
                                                fontWeight: 600,
                                            },
                                        },
                                        '& .MuiTabs-indicator': {
                                            backgroundColor: '#06b6d4',
                                            height: 3,
                                            borderRadius: '3px 3px 0 0',
                                        },
                                    }}
                                >
                                    <Tab label="Thông tin" />
                                    <Tab 
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>Đơn hàng</span>
                                                {orders.length > 0 && (
                                                    <Chip 
                                                        label={orders.length} 
                                                        size="small" 
                                                        sx={{ 
                                                            height: 20, 
                                                            fontSize: '0.7rem',
                                                            bgcolor: '#06b6d4',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                        }} 
                                                    />
                                                )}
                                            </Box>
                                        } 
                                    />
                                    <Tab label="Thống kê" />
                                </Tabs>
                            </Box>

                            {/* Tab Content */}
                            <Box sx={{ p: 3 }}>
                                {/* Tab 0: Thông tin */}
                                {activeTab === 0 && (
                                    <Box>
                                        {/* Avatar và tên khách hàng */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 2, 
                                            mb: 3,
                                            pb: 3,
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}>
                                            <Box
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    borderRadius: '50%',
                                                    bgcolor: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '24px',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {customer.full_name ? customer.full_name.charAt(0).toUpperCase() : 'U'}
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                    {customer.full_name || 'N/A'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                                    <Chip
                                                        icon={<Shield size={14} />}
                                                        label={customer.role === 'admin' ? 'Admin' : 'Khách hàng'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: customer.role === 'admin' ? '#2563eb' : '#6B7280',
                                                            color: 'white',
                                                            fontWeight: 500,
                                                            height: 24,
                                                        }}
                                                    />
                                                    <Chip
                                                        icon={<CheckCircle size={14} />}
                                                        label="Hoạt động"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#16a34a',
                                                            color: 'white',
                                                            fontWeight: 500,
                                                            height: 24,
                                                        }}
                                                    />
                                                    {customer.membership_level && (
                                                        <Chip
                                                            icon={<Award size={14} />}
                                                            label={customer.membership_level}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#f59e0b',
                                                                color: 'white',
                                                                fontWeight: 500,
                                                                height: 24,
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Grid container spacing={3}>
                                            {/* Thông tin cá nhân */}
                                            <Grid item xs={12} md={6}>
                                                <Paper 
                                                    elevation={0} 
                                                    sx={{ 
                                                        p: 3, 
                                                        borderRadius: 2, 
                                                        bgcolor: '#F9FAFB',
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        height: '100%'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                                        <UserCircle size={20} style={{ color: '#06b6d4' }} />
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
                                                            Thông tin cá nhân
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'flex-start', 
                                                            gap: 2,
                                                            p: 1.5,
                                                            borderRadius: 1.5,
                                                            bgcolor: 'white',
                                                            '&:hover': { bgcolor: '#F3F4F6' }
                                                        }}>
                                                            <Box sx={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 1.5,
                                                                bgcolor: alpha('#06b6d4', 0.1),
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0
                                                            }}>
                                                                <User size={18} style={{ color: '#06b6d4' }} />
                                                            </Box>
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                                                                    Họ và tên
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827' }}>
                                                                    {customer.full_name || 'N/A'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'flex-start', 
                                                            gap: 2,
                                                            p: 1.5,
                                                            borderRadius: 1.5,
                                                            bgcolor: 'white',
                                                            '&:hover': { bgcolor: '#F3F4F6' }
                                                        }}>
                                                            <Box sx={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 1.5,
                                                                bgcolor: alpha('#10b981', 0.1),
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0
                                                            }}>
                                                                <Mail size={18} style={{ color: '#10b981' }} />
                                                            </Box>
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                                                                    Email
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827', wordBreak: 'break-word' }}>
                                                                    {customer.email || 'N/A'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'flex-start', 
                                                            gap: 2,
                                                            p: 1.5,
                                                            borderRadius: 1.5,
                                                            bgcolor: 'white',
                                                            '&:hover': { bgcolor: '#F3F4F6' }
                                                        }}>
                                                            <Box sx={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 1.5,
                                                                bgcolor: alpha('#3B82F6', 0.1),
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0
                                                            }}>
                                                                <Phone size={18} style={{ color: '#3B82F6' }} />
                                                            </Box>
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                                                                    Số điện thoại
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827' }}>
                                                                    {customer.phone_number || 'N/A'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        {customer.gender && (
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                alignItems: 'flex-start', 
                                                                gap: 2,
                                                                p: 1.5,
                                                                borderRadius: 1.5,
                                                                bgcolor: 'white',
                                                                '&:hover': { bgcolor: '#F3F4F6' }
                                                            }}>
                                                                <Box sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    borderRadius: 1.5,
                                                                    bgcolor: alpha('#ec4899', 0.1),
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0
                                                                }}>
                                                                    <Users size={18} style={{ color: '#ec4899' }} />
                                                                </Box>
                                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                    <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                                                                        Giới tính
                                                                    </Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827' }}>
                                                                        {customer.gender}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        )}
                                                        {(customer.shipping_address || customer.city || customer.district) && (
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                alignItems: 'flex-start', 
                                                                gap: 2,
                                                                p: 1.5,
                                                                borderRadius: 1.5,
                                                                bgcolor: 'white',
                                                                '&:hover': { bgcolor: '#F3F4F6' }
                                                            }}>
                                                                <Box sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    borderRadius: 1.5,
                                                                    bgcolor: alpha('#2563eb', 0.1),
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0
                                                                }}>
                                                                    <MapPin size={18} style={{ color: '#2563eb' }} />
                                                                </Box>
                                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                    <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                                                                        Địa chỉ
                                                                    </Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827', wordBreak: 'break-word' }}>
                                                                        {[
                                                                            customer.shipping_address,
                                                                            customer.district,
                                                                            customer.city
                                                                        ].filter(Boolean).join(', ') || 'N/A'}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                            
                                            {/* Thông tin tài khoản */}
                                            <Grid item xs={12} md={6}>
                                                <Paper 
                                                    elevation={0} 
                                                    sx={{ 
                                                        p: 3, 
                                                        borderRadius: 2, 
                                                        bgcolor: '#F9FAFB',
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        height: '100%'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                                        <Shield size={20} style={{ color: '#2563eb' }} />
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
                                                            Thông tin tài khoản
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                                        {customer.created_at && (
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                alignItems: 'flex-start', 
                                                                gap: 2,
                                                                p: 1.5,
                                                                borderRadius: 1.5,
                                                                bgcolor: 'white',
                                                                '&:hover': { bgcolor: '#F3F4F6' }
                                                            }}>
                                                                <Box sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    borderRadius: 1.5,
                                                                    bgcolor: alpha('#f59e0b', 0.1),
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0
                                                                }}>
                                                                    <Calendar size={18} style={{ color: '#f59e0b' }} />
                                                                </Box>
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                                                                        Ngày tham gia
                                                                    </Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827' }}>
                                                                        {format(new Date(customer.created_at), 'dd/MM/yyyy')}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        )}
                                                        {customer.reward_points !== undefined && (
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                alignItems: 'flex-start', 
                                                                gap: 2,
                                                                p: 1.5,
                                                                borderRadius: 1.5,
                                                                bgcolor: 'white',
                                                                '&:hover': { bgcolor: '#F3F4F6' }
                                                            }}>
                                                                <Box sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    borderRadius: 1.5,
                                                                    bgcolor: alpha('#2563eb', 0.1),
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0
                                                                }}>
                                                                    <Award size={18} style={{ color: '#2563eb' }} />
                                                                </Box>
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                                                                        Điểm tích lũy
                                                                    </Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#2563eb', fontSize: '1.1rem' }}>
                                                                        {customer.reward_points || 0} điểm
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        )}
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'flex-start', 
                                                            gap: 2,
                                                            p: 1.5,
                                                            borderRadius: 1.5,
                                                            bgcolor: 'white',
                                                            '&:hover': { bgcolor: '#F3F4F6' }
                                                        }}>
                                                            <Box sx={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 1.5,
                                                                bgcolor: alpha('#16a34a', 0.1),
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0
                                                            }}>
                                                                <DollarSign size={18} style={{ color: '#16a34a' }} />
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                                                                    Tổng chi tiêu
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#16a34a', fontSize: '1.1rem' }}>
                                                                    {formatCurrency(stats.totalValue)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'flex-start', 
                                                            gap: 2,
                                                            p: 1.5,
                                                            borderRadius: 1.5,
                                                            bgcolor: 'white',
                                                            '&:hover': { bgcolor: '#F3F4F6' }
                                                        }}>
                                                            <Box sx={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 1.5,
                                                                bgcolor: alpha('#3B82F6', 0.1),
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0
                                                            }}>
                                                                <ShoppingCart size={18} style={{ color: '#3B82F6' }} />
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                                                                    Tổng đơn hàng
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#3B82F6', fontSize: '1.1rem' }}>
                                                                    {stats.total} đơn
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}

                                {/* Tab 1: Đơn hàng */}
                                {activeTab === 1 && (
                                    <Box>
                                        {orders.length === 0 ? (
                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                                <ShoppingCart size={48} style={{ color: '#9CA3AF', margin: '0 auto 16px' }} />
                                                <Typography color="text.secondary">
                                                    Khách hàng chưa có đơn hàng nào
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {orders.map((order) => (
                                                    <Paper
                                                        key={order.id}
                                                        elevation={0}
                                                        sx={{
                                                            p: 2.5,
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            '&:hover': {
                                                                bgcolor: '#F9FAFB',
                                                            },
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                                        {order.order_code}
                                                                    </Typography>
                                                                    <Chip
                                                                        label={order.status}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: getStatusColor(order.status),
                                                                            color: 'white',
                                                                            fontWeight: 500,
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                        Ngày đặt: {format(new Date(order.order_time), 'dd/MM/yyyy HH:mm')}
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                        Tổng tiền: <span style={{ fontWeight: 600, color: '#EF4444' }}>{formatCurrency(order.total_amount)}</span>
                                                                    </Typography>
                                                                    {order.delivery_address && (
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                            Địa chỉ: {order.delivery_address}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                )}

                                {/* Tab 2: Thống kê */}
                                {activeTab === 2 && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <StatCard
                                                icon={ShoppingCart}
                                                label="Tổng đơn hàng"
                                                value={stats.total}
                                                color="#3B82F6"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <StatCard
                                                icon={CheckCircle}
                                                label="Đã hoàn thành"
                                                value={stats.completed}
                                                color="#16a34a"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <StatCard
                                                icon={Clock}
                                                label="Chờ xác nhận"
                                                value={stats.pending}
                                                color="#f59e0b"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <StatCard
                                                icon={Truck}
                                                label="Đang vận chuyển"
                                                value={stats.shipping}
                                                color="#0ea5e9"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <StatCard
                                                icon={XCircle}
                                                label="Đã hủy"
                                                value={stats.cancelled}
                                                color="#EF4444"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                            <StatCard
                                                icon={DollarSign}
                                                label="Tổng chi tiêu"
                                                value={formatCurrency(stats.totalValue)}
                                                color="#2563eb"
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                {/* Footer */}
                <DialogActions sx={{
                    p: 2.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#fafafa',
                    gap: 1.5
                }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            textTransform: 'none',
                        }}
                    >
                        Đóng
                    </Button>
                    {customer && (
                        <Button
                            onClick={handleEdit}
                            variant="contained"
                            startIcon={<Edit size={16} />}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                textTransform: 'none',
                                fontWeight: 600,
                                bgcolor: '#06b6d4',
                                '&:hover': {
                                    bgcolor: '#0891b2',
                                }
                            }}
                        >
                            Chỉnh sửa
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Edit Modal */}
            {customer && (
                <CustomerModal
                    open={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveEdit}
                    customerToEdit={customer}
                />
            )}
        </>
    );
}

