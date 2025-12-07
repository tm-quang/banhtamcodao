// src/components/admin/CustomerTable.js
'use client';
import React, { useState, useMemo } from 'react';
import {
    Box, Button, Paper, Typography, Chip, IconButton, TextField,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Tooltip, alpha, InputAdornment, Stack, Avatar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Trash2, Eye, Search, Users, UserCheck, UserX, Phone, X } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import CustomerModal from './CustomerModal';

// Compact Stats Badge
const StatBadge = ({ label, value, color }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color}`}>
        <span className="text-sm font-bold">{value}</span>
        <span className="text-xs opacity-80">{label}</span>
    </div>
);

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

// Confirmation Dialog
const ConfirmationDialog = ({ open, onClose, onConfirm, customerName }) => (
    <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
            sx: {
                borderRadius: 3,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }
        }}
    >
        <DialogTitle sx={{
            fontWeight: 700,
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
        }}>
            <Trash2 size={22} />
            Xác nhận xóa khách hàng
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                Bạn có chắc chắn muốn xóa khách hàng "{customerName}" không?
            </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
                Hủy
            </Button>
            <Button onClick={onConfirm} variant="contained" color="error" autoFocus sx={{ borderRadius: 2, fontWeight: 600 }}>
                Xóa
            </Button>
        </DialogActions>
    </Dialog>
);

export default function CustomerTable({ customers }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [deletingCustomer, setDeletingCustomer] = useState(null);

    // Stats
    const stats = useMemo(() => ({
        total: customers.length,
        active: customers.filter(c => c.status === 'active').length,
        inactive: customers.filter(c => c.status === 'inactive').length,
    }), [customers]);

    // Filtered customers
    const filteredCustomers = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return customers.filter(customer => {
            return !search ||
                customer.full_name?.toLowerCase().includes(search) ||
                customer.email?.toLowerCase().includes(search) ||
                customer.phone_number?.includes(search);
        });
    }, [customers, searchTerm]);

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
            setDeletingCustomer(null);
            router.refresh();
        } else {
            alert('Xóa thất bại!');
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 60,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <span className="text-xs font-semibold text-cyan-600">#{params.value}</span>
            )
        },
        {
            field: 'full_name',
            headerName: 'Khách hàng',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%' }}>
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: alpha('#06b6d4', 0.1),
                            color: '#0891b2',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            flexShrink: 0,
                        }}
                    >
                        {params.value?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', lineHeight: 1.3 }}>
                            {params.value}
                        </Typography>
                        {params.row.email && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.3 }}>
                                {params.row.email}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            )
        },
        {
            field: 'phone_number',
            headerName: 'SĐT',
            width: 120,
            renderCell: (params) => params.value ? (
                <Chip
                    icon={<Phone size={12} />}
                    label={params.value}
                    size="small"
                    variant="outlined"
                    component="a"
                    href={`tel:${params.value}`}
                    clickable
                    sx={{
                        fontSize: '0.75rem',
                        borderColor: alpha('#10b981', 0.3),
                        color: '#059669',
                    }}
                />
            ) : <span className="text-gray-400 text-xs">—</span>
        },
        {
            field: 'total_orders',
            headerName: 'Đơn hàng',
            width: 90,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <span className="text-sm font-semibold text-gray-700">{params.value || 0}</span>
            )
        },
        {
            field: 'total_spent',
            headerName: 'Tổng chi tiêu',
            width: 130,
            renderCell: (params) => (
                <span className="text-sm font-semibold text-amber-600">
                    {formatCurrency(params.value)}
                </span>
            )
        },
        {
            field: 'role',
            headerName: 'Vai trò',
            width: 90,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value === 'admin' ? 'Admin' : 'KH'}
                    size="small"
                    sx={{
                        bgcolor: params.value === 'admin' ? alpha('#8b5cf6', 0.1) : alpha('#6b7280', 0.1),
                        color: params.value === 'admin' ? '#7c3aed' : '#4b5563',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                    }}
                />
            )
        },
        {
            field: 'status',
            headerName: 'TT',
            width: 80,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value === 'active' ? '✓' : '✗'}
                    size="small"
                    sx={{
                        bgcolor: params.value === 'active' ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                        color: params.value === 'active' ? '#059669' : '#dc2626',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        minWidth: 28,
                    }}
                />
            )
        },
        {
            field: 'created_at',
            headerName: 'Tham gia',
            width: 100,
            renderCell: (params) => (
                <span className="text-xs text-gray-500">
                    {params.value ? format(new Date(params.value), 'dd/MM/yy') : '—'}
                </span>
            )
        },
        {
            field: 'actions',
            headerName: '',
            width: 100,
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Xem" arrow>
                        <IconButton
                            size="small"
                            onClick={() => router.push(`/dashboard/customers/${params.row.id}`)}
                            sx={{ color: '#06b6d4', '&:hover': { bgcolor: alpha('#06b6d4', 0.1) } }}
                        >
                            <Eye size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa" arrow>
                        <IconButton
                            size="small"
                            onClick={() => { setEditingCustomer(params.row); setIsModalOpen(true); }}
                            sx={{ color: '#3b82f6', '&:hover': { bgcolor: alpha('#3b82f6', 0.1) } }}
                        >
                            <Edit size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa" arrow>
                        <IconButton
                            size="small"
                            onClick={() => setDeletingCustomer(params.row)}
                            sx={{ color: '#ef4444', '&:hover': { bgcolor: alpha('#ef4444', 0.1) } }}
                        >
                            <Trash2 size={16} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        },
    ];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Thông tin khách hàng</h1>
                    <span className="text-sm text-gray-500">({stats.total} khách)</span>
                </div>
            </div>

            {/* Compact Filter & Stats Row */}
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
                    {/* Stats Badges */}
                    <div className="flex items-center gap-2 mr-2">
                        <StatBadge label="Tổng" value={stats.total} color="bg-cyan-100 text-cyan-700" />
                        <StatBadge label="Active" value={stats.active} color="bg-green-100 text-green-700" />
                        <StatBadge label="Inactive" value={stats.inactive} color="bg-gray-100 text-gray-700" />
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
                            width: 220,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.875rem',
                            }
                        }}
                    />

                    {searchTerm && (
                        <Button
                            size="small"
                            startIcon={<X size={14} />}
                            onClick={() => setSearchTerm('')}
                            sx={{
                                color: 'text.secondary',
                                textTransform: 'none',
                                fontSize: '0.8rem',
                            }}
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
                    '& .MuiDataGrid-root': {
                        border: 'none',
                    },
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
                        '&:hover': {
                            bgcolor: alpha('#06b6d4', 0.04),
                        }
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
                    rows={filteredCustomers}
                    columns={columns}
                    rowHeight={68}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                        sorting: { sortModel: [{ field: 'id', sort: 'desc' }] },
                    }}
                    localeText={{
                        noRowsLabel: 'Không có khách hàng nào',
                        MuiTablePagination: {
                            labelRowsPerPage: 'Hiển thị:',
                            labelDisplayedRows: ({ from, to, count }) => `${from}-${to} / ${count}`,
                        }
                    }}
                    sx={{
                        '& .MuiDataGrid-virtualScroller': {
                            '&::-webkit-scrollbar': {
                                width: 6,
                                height: 6,
                            },
                            '&::-webkit-scrollbar-thumb': {
                                bgcolor: alpha('#000', 0.15),
                                borderRadius: 3,
                            }
                        }
                    }}
                />
            </Paper>

            {/* Customer Modal */}
            <CustomerModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                customerToEdit={editingCustomer}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={Boolean(deletingCustomer)}
                onClose={() => setDeletingCustomer(null)}
                onConfirm={handleDelete}
                customerName={deletingCustomer?.full_name}
            />
        </Box>
    );
}