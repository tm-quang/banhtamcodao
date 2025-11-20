// src/components/admin/OrderTable.js
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Box, Paper, Typography, Chip, IconButton, TextField, Menu, MenuItem, Link as MuiLink, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';
import OrderDetailModal from './OrderDetailModal';
import OrderEditModal from './OrderEditModal';
import { useToast } from '@/context/ToastContext';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const ConfirmationDialog = ({ open, onClose, onConfirm, title, message, customActions }) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="span" sx={{ width: 40, height: 40, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>?</Box>
            {title}
        </DialogTitle>
        <DialogContent><DialogContentText>{message}</DialogContentText></DialogContent>
        <DialogActions sx={{ p: 2 }}>
            {customActions ? customActions : (
                <>
                    <Button onClick={onClose} variant="outlined">Hủy</Button>
                    <Button onClick={onConfirm} variant="contained" sx={{ backgroundColor: '#f97316', '&:hover': { backgroundColor: '#ea580c' }}}>Đồng ý</Button>
                </>
            )}
        </DialogActions>
    </Dialog>
);

function CustomToolbar({ onFilterChange }) {
    return (
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <TextField variant="outlined" size="small" placeholder="Tìm theo mã đơn, tên, SĐT..." onChange={(e) => onFilterChange('searchTerm', e.target.value)} sx={{ flexGrow: 1, minWidth: 250, bgcolor: 'white' }} />
            <TextField select variant="outlined" size="small" defaultValue="" onChange={(e) => onFilterChange('orderStatus', e.target.value)} SelectProps={{ displayEmpty: true }} sx={{ minWidth: 180, bgcolor: 'white' }}>
                <MenuItem value=""><em>Trạng thái đơn hàng</em></MenuItem>
                <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
                <MenuItem value="Đã xác nhận">Đã xác nhận</MenuItem>
                <MenuItem value="Đang vận chuyển">Đang vận chuyển</MenuItem>
                <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                <MenuItem value="Đã hủy">Đã hủy</MenuItem>
            </TextField>
            <TextField select variant="outlined" size="small" defaultValue="" onChange={(e) => onFilterChange('paymentStatus', e.target.value)} SelectProps={{ displayEmpty: true }} sx={{ minWidth: 180, bgcolor: 'white' }}>
                <MenuItem value=""><em>Trạng thái thanh toán</em></MenuItem>
                <MenuItem value="paid">Đã thanh toán</MenuItem>
                <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
            </TextField>
        </Box>
    );
}

export default function OrderTable({ orders: initialOrders }) {
    const [orders, setOrders] = useState(initialOrders);
    const { showToast } = useToast();
    const [filters, setFilters] = useState({ searchTerm: '', orderStatus: '', paymentStatus: '' });
    const [viewingOrderId, setViewingOrderId] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, customActions: null });
    const [statusMenu, setStatusMenu] = useState({ anchorEl: null, row: null, field: null, options: [] });

    useEffect(() => { setOrders(initialOrders); }, [initialOrders]);
    
    // --- HÀM BỊ THIẾU ĐÃ ĐƯỢC BỔ SUNG LẠI TẠI ĐÂY ---
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleUpdate = async (orderId, data, successMessage) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Cập nhật thất bại');
            
            setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, ...data } : o)));
            showToast(successMessage, 'success');
            return true;
        } catch (error) {
            showToast(error.message, 'error');
            return false;
        }
    };

    const handleStatusClick = (row, field) => {
        if (field === 'payment_status' && row.payment_status === 'unpaid') {
            setConfirm({
                isOpen: true,
                title: 'Xác nhận hành động',
                message: `Bạn có chắc chắn muốn chuyển đơn hàng #${row.order_code} sang "Đã thanh toán"?`,
                onConfirm: () => {
                    handleUpdate(row.id, { payment_status: 'paid' }, 'Đã cập nhật thanh toán!');
                    setConfirm({ isOpen: false });
                },
                customActions: null
            });
        } else if (field === 'status') {
            const options = getNextStatusOptions(row.status);
            setStatusMenu({ anchorEl: row.__eventTarget || null, row, field, options });
        }
    };

    const getNextStatusOptions = (current) => {
        switch (current) {
            case 'Chờ xác nhận':
                return ['Đã xác nhận', 'Đã hủy'];
            case 'Đã xác nhận':
                return ['Đang vận chuyển', 'Đã hủy'];
            case 'Đang vận chuyển':
                return ['Hoàn thành', 'Đã hủy'];
            default:
                return [];
        }
    };

    const openStatusMenu = (event, row) => {
        row.__eventTarget = event.currentTarget;
        handleStatusClick(row, 'status');
    };

    const handleSelectNextStatus = async (nextStatus) => {
        const row = statusMenu.row;
        if (!row) return;
        if (nextStatus === 'Đã hủy') {
            setConfirm({
                isOpen: true,
                title: 'Xác nhận hủy đơn',
                message: `Bạn chắc chắn muốn hủy đơn #${row.order_code}?`,
                onConfirm: async () => { await handleUpdate(row.id, { status: nextStatus }, 'Đã hủy đơn hàng.'); setConfirm({ isOpen: false }); },
                customActions: null,
            });
        } else {
            await handleUpdate(row.id, { status: nextStatus }, 'Đã cập nhật trạng thái đơn.');
        }
        setStatusMenu({ anchorEl: null, row: null, field: null, options: [] });
    };

    const handleSaveEditModal = async (data) => {
        const success = await handleUpdate(data.id, data, 'Đã cập nhật thông tin đơn hàng!');
        if (success) {
            setEditingOrder(null);
        }
    };

    const getStatusChip = (row, field) => {
        const status = row[field];
        const isClickable = (field === 'payment_status' && status === 'unpaid') || (field === 'status' && getNextStatusOptions(status).length > 0);
        const colorMap = {
            status: { 'Chờ xác nhận': 'warning', 'Đã xác nhận': 'primary', 'Đang vận chuyển': 'info', 'Hoàn thành': 'success', 'Đã hủy': 'error' },
            payment_status: { 'paid': 'success', 'unpaid': 'warning' }
        };
        const labelMap = { 'paid': 'Đã thanh toán', 'unpaid': 'Chưa thanh toán' };
        
        return <Chip 
            label={labelMap[status] || status} 
            color={colorMap[field][status] || 'default'} 
            size="small" 
            onClick={isClickable ? (e) => { if (field === 'status') { openStatusMenu(e, row); } else { handleStatusClick(row, field); } } : null}
            sx={{ cursor: isClickable ? 'pointer' : 'default', fontWeight: 'medium' }}
        />;
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchTerm = filters.searchTerm.toLowerCase();
            const searchMatch = !searchTerm ||
                order.order_code.toLowerCase().includes(searchTerm) ||
                order.recipient_name.toLowerCase().includes(searchTerm) ||
                order.phone_number.includes(searchTerm);
            const statusMatch = !filters.orderStatus || order.status === filters.orderStatus;
            const paymentStatusMatch = !filters.paymentStatus || order.payment_status === filters.paymentStatus;
            return searchMatch && statusMatch && paymentStatusMatch;
        });
    }, [orders, filters]);

    const columns = [
        { field: 'order_code', headerName: 'Mã Đơn', width: 150, renderCell: (params) => (<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{params.value}</Typography>) },
        { field: 'order_time', headerName: 'Ngày đặt', width: 130, valueFormatter: (value) => format(new Date(value), 'HH:mm dd/MM/yy')},
        { field: 'recipient_name', headerName: 'Khách Hàng', width: 150 },
        { field: 'phone_number', headerName: 'Số điện thoại', width: 120, renderCell: (params) => (<MuiLink href={`tel:${params.value}`} underline="hover">{params.value}</MuiLink>) },
        { field: 'delivery_address', headerName: 'Địa chỉ', flex: 1, minWidth: 200 },
        { field: 'delivery_method', headerName: 'Hình thức giao', width: 120, renderCell: (params) => <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{params.value === 'delivery' ? 'Giao hàng' : 'Tự đến lấy'}</Typography> },
        { field: 'payment_status', headerName: 'Thanh toán', width: 140, renderCell: (params) => getStatusChip(params.row, 'payment_status') },
        { field: 'status', headerName: 'Trạng thái', width: 140, renderCell: (params) => getStatusChip(params.row, 'status') },
        { field: 'total_amount', headerName: 'Tổng Tiền', width: 120, align: 'right', headerAlign: 'right', valueFormatter: (value) => formatCurrency(value) },
        { 
            field: 'actions', headerName: 'Hành động', width: 120, align: 'center', headerAlign: 'center',
            renderCell: (params) => ( 
                <Box>
                    <IconButton onClick={() => setViewingOrderId(params.row.id)} color="primary" title="Xem chi tiết"><Eye size={22} /></IconButton>
                    <IconButton onClick={() => setEditingOrder(params.row)} color="error" title="Chỉnh sửa"><Edit size={22} /></IconButton>
                </Box>
            ) 
        }
    ];

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quản lý Đơn hàng
            </Typography>
            <Paper sx={{ height: '75vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <CustomToolbar onFilterChange={handleFilterChange} />
                <Box sx={{ flexGrow: 1 }}>
                    <DataGrid
                        rows={filteredOrders}
                        columns={columns}
                        checkboxSelection
                        disableRowSelectionOnClick
                        rowHeight={60}
                        sx={{
                            border: 0,
                            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
                            '& .MuiDataGrid-cell': { borderBottom: '1px solid #e2e8f0', alignItems: 'center', display: 'flex' },
                            '& .MuiDataGrid-row:hover': { backgroundColor: '#e0f2fe' },
                        }}
                    />
                </Box>
            </Paper>
             <OrderDetailModal orderId={viewingOrderId} open={Boolean(viewingOrderId)} onClose={() => setViewingOrderId(null)} />
             <OrderEditModal open={Boolean(editingOrder)} onClose={() => setEditingOrder(null)} onSave={handleSaveEditModal} order={editingOrder} />
             <ConfirmationDialog
                open={confirm.isOpen}
                onClose={() => setConfirm({ isOpen: false })}
                onConfirm={confirm.onConfirm}
                title={confirm.title}
                message={confirm.message}
                customActions={confirm.customActions}
            />
            <Menu
                anchorEl={statusMenu.anchorEl}
                open={Boolean(statusMenu.anchorEl)}
                onClose={() => setStatusMenu({ anchorEl: null, row: null, field: null, options: [] })}
            >
                {statusMenu.options.length === 0 ? (
                    <MenuItem disabled>Không có bước tiếp</MenuItem>
                ) : (
                    statusMenu.options.map((opt) => (
                        <MenuItem key={opt} onClick={() => handleSelectNextStatus(opt)}>{opt}</MenuItem>
                    ))
                )}
            </Menu>
        </Box>
    );
}