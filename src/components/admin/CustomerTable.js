// src/components/admin/CustomerTable.js
'use client';
import React, { useState, useMemo } from 'react';
import { Box, Button, Paper, Typography, Chip, IconButton, TextField, MenuItem, Link as MuiLink, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import CustomerModal from './CustomerModal';

function FilterBar({ onFilterChange }) {
    return (
        <Paper sx={{ p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, bgcolor: 'background.default' }}>
            <TextField variant="outlined" size="small" placeholder="Tìm theo tên, email, SĐT..." onChange={(e) => onFilterChange('search', e.target.value)} sx={{ flexGrow: 1, minWidth: 250, bgcolor: 'white' }} />
            <TextField select variant="outlined" size="small" defaultValue="" onChange={(e) => onFilterChange('role', e.target.value)} sx={{ minWidth: 180, bgcolor: 'white' }} SelectProps={{ displayEmpty: true }}>
                <MenuItem value=""><em>Vai trò</em></MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
            </TextField>
            <TextField select variant="outlined" size="small" defaultValue="" onChange={(e) => onFilterChange('status', e.target.value)} sx={{ minWidth: 180, bgcolor: 'white' }} SelectProps={{ displayEmpty: true }}>
                <MenuItem value=""><em>Trạng thái</em></MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
        </Paper>
    );
}

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function CustomerTable({ customers }) {
    const router = useRouter();
    const [filters, setFilters] = useState({ search: '', role: '', status: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [deletingCustomer, setDeletingCustomer] = useState(null);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const search = filters.search.toLowerCase();
            const searchMatch = !search ||
                customer.full_name.toLowerCase().includes(search) ||
                (customer.email && customer.email.toLowerCase().includes(search)) ||
                (customer.phone_number && customer.phone_number.includes(search));

            const roleMatch = !filters.role || customer.role === filters.role;
            const statusMatch = !filters.status || customer.status === filters.status;

            return searchMatch && roleMatch && statusMatch;
        });
    }, [customers, filters]);

    const handleSave = async (customerData) => {
        const isEditMode = Boolean(customerData.id);
        const url = isEditMode ? `/api/admin/customers/${customerData.id}` : '/api/admin/customers';
        const method = isEditMode ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData),
        });

        if (res.ok) {
            alert(`Thao tác thành công!`);
            setIsModalOpen(false);
            router.refresh();
        } else {
            const err = await res.json();
            alert(`Có lỗi xảy ra: ${err.message}`);
        }
    };

    const handleDelete = async () => {
        if (!deletingCustomer) return;
        const res = await fetch(`/api/admin/customers/${deletingCustomer.id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Xóa thành công!');
            setDeletingCustomer(null);
            router.refresh();
        } else {
            alert('Xóa thất bại!');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'full_name', headerName: 'Tên Khách Hàng', flex: 1, minWidth: 180 },
        {
            field: 'phone_number',
            headerName: 'Số Điện Thoại',
            width: 130,
            renderCell: (params) => params.value ? <MuiLink href={`tel:${params.value}`} underline="hover">{params.value}</MuiLink> : ''
        },
        {
            field: 'total_orders',
            headerName: 'Tổng Đơn',
            type: 'number',
            width: 100,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'total_spent',
            headerName: 'Tổng Chi Tiêu',
            type: 'number',
            width: 150,
            valueFormatter: (value) => formatCurrency(value),
        },
        {
            field: 'role', headerName: 'Vai trò', width: 100,
            renderCell: (params) => <Chip label={params.value} color={params.value === 'admin' ? 'secondary' : 'default'} size="small" />
        },
        {
            field: 'status', headerName: 'Trạng thái', width: 100,
            renderCell: (params) => <Chip label={params.value} color={params.value === 'active' ? 'success' : 'default'} size="small" />
        },
        {
            field: 'created_at',
            headerName: 'Ngày tham gia',
            width: 120,
            valueFormatter: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : ''
        },
        {
            field: 'actions', headerName: 'Hành động', width: 120, align: 'center', sortable: false,
            renderCell: (params) => (
                <Box>
                    {/* --- CẬP NHẬT NÚT BẤM TẠI ĐÂY --- */}
                    <IconButton size="small" onClick={() => router.push(`/dashboard/customers/${params.row.id}`)} title="Xem chi tiết">
                        <Eye size={18} />
                    </IconButton>
                    <IconButton size="small" color="info" onClick={() => { setEditingCustomer(params.row); setIsModalOpen(true); }}><Edit size={18} /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeletingCustomer(params.row)}><Trash2 size={18} /></IconButton>
                </Box>
            )
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Quản lý Khách hàng
                </Typography>
                <Button variant="contained" startIcon={<PlusCircle />} onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}>
                    Thêm khách hàng
                </Button>
            </Box>

            <FilterBar onFilterChange={handleFilterChange} />

            <Paper sx={{ height: '70vh', width: '100%' }}>
                <DataGrid
                    rows={filteredCustomers}
                    columns={columns}
                    // Dòng loading={loading} đã được xóa ở đây
                    checkboxSelection
                    disableRowSelectionOnClick
                    sx={{
                        fontSize: '15px',
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8fafc' },
                    }}
                />
            </Paper>
            <CustomerModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} customerToEdit={editingCustomer} />
            <Dialog open={Boolean(deletingCustomer)} onClose={() => setDeletingCustomer(null)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent><DialogContentText>Bạn có chắc muốn xóa khách hàng &quot;{deletingCustomer?.full_name}&quot; không?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeletingCustomer(null)}>Hủy</Button>
                    <Button onClick={handleDelete} color="error">Xóa</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}