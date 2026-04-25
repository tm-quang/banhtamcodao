/**
 * Admin customer groups management page
 * @file src/app/(admin)/dashboard/customer-groups/page.js
 */
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Button, Paper, Typography, IconButton, Chip, TextField,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Tooltip, alpha, Switch, FormControlLabel, Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2, Users, Award, TrendingUp, Settings, Search, X, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CustomerGroupModal from '@/components/admin/CustomerGroupModal';

// Confirmation Dialog
const ConfirmationDialog = ({ open, onClose, onConfirm, groupName }) => (
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
            Xác nhận vô hiệu hóa nhóm
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                Bạn có chắc chắn muốn vô hiệu hóa nhóm "{groupName}" không?
            </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
                Hủy
            </Button>
            <Button onClick={onConfirm} variant="contained" color="error" autoFocus sx={{ borderRadius: 2, fontWeight: 600 }}>
                Vô hiệu hóa
            </Button>
        </DialogActions>
    </Dialog>
);

export default function CustomerGroupsPage() {
    const router = useRouter();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [deletingGroup, setDeletingGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdatingMembership, setIsUpdatingMembership] = useState(false);

    // Calculate stats
    const stats = useMemo(() => ({
        total: groups.length,
        active: groups.filter(g => g.is_active).length,
        inactive: groups.filter(g => !g.is_active).length,
    }), [groups]);

    // Filter groups
    const filteredGroups = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return groups.filter(g =>
            g.name?.toLowerCase().includes(search) ||
            g.description?.toLowerCase().includes(search)
        );
    }, [groups, searchTerm]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/customer-groups');
            const data = await res.json();
            if (data.success) {
                setGroups(data.groups || []);
            }
        } catch (error) {
            console.error('Error fetching customer groups:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleSave = async (groupData) => {
        const isEditMode = Boolean(groupData.id);
        const url = '/api/admin/customer-groups';
        const method = isEditMode ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(groupData),
        });

        const data = await res.json();
        if (data.success) {
            setIsModalOpen(false);
            setEditingGroup(null);
            await fetchGroups();
            // Tự động cập nhật membership_level cho tất cả khách hàng
            handleUpdateAllMembershipLevels();
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể lưu nhóm khách hàng'));
        }
    };

    const handleDelete = async () => {
        if (!deletingGroup) return;
        const res = await fetch(`/api/admin/customer-groups?id=${deletingGroup.id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            setDeletingGroup(null);
            await fetchGroups();
            // Tự động cập nhật membership_level cho tất cả khách hàng
            handleUpdateAllMembershipLevels();
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể xóa nhóm'));
        }
    };

    const handleUpdateAllMembershipLevels = async () => {
        setIsUpdatingMembership(true);
        try {
            const res = await fetch('/api/admin/customers/update-membership-levels', {
                method: 'POST',
            });
            const data = await res.json();
            if (res.ok && data.success) {
                console.log(`Đã cập nhật nhóm khách hàng cho ${data.updated_count || 0} khách hàng`);
            }
        } catch (error) {
            console.error('Error updating membership levels:', error);
        } finally {
            setIsUpdatingMembership(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 70,
            minWidth: 70,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <span className="text-sm font-bold text-blue-600">#{params.value}</span>
                </Box>
            )
        },
        {
            field: 'name',
            headerName: 'Tên nhóm',
            width: 200,
            minWidth: 180,
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
                        {params.value}
                    </Typography>
                    {params.row.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {params.row.description}
                        </Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'min_points',
            headerName: 'Điểm tối thiểu',
            width: 150,
            minWidth: 130,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Chip
                        icon={<Award size={14} style={{ color: '#d97706' }} />}
                        label={formatCurrency(params.value || 0)}
                        size="small"
                        sx={{
                            bgcolor: alpha('#f59e0b', 0.1),
                            color: '#d97706',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            height: '28px',
                            px: 1.5,
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: alpha('#f59e0b', 0.3),
                        }}
                    />
                </Box>
            )
        },
        {
            field: 'points_per_amount',
            headerName: 'Tỷ lệ tích điểm',
            width: 180,
            minWidth: 160,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                        1 điểm / {formatCurrency(params.value || 1000)}đ
                    </Typography>
                </Box>
            )
        },
        {
            field: 'display_order',
            headerName: 'Thứ tự',
            width: 100,
            minWidth: 90,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <span className="text-sm font-semibold text-gray-700">{params.value || 0}</span>
                </Box>
            )
        },
        {
            field: 'is_active',
            headerName: 'Trạng thái',
            width: 130,
            minWidth: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Chip
                        label={params.value ? 'Hoạt động' : 'Tạm khóa'}
                        size="small"
                        sx={{
                            bgcolor: params.value ? '#16a34a' : '#6b7280',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            height: '32px',
                            px: 1.5,
                            borderRadius: '10px',
                        }}
                    />
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: 'Thao tác',
            width: 150,
            minWidth: 140,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Sửa" arrow>
                            <IconButton
                                size="medium"
                                onClick={() => { setEditingGroup(params.row); setIsModalOpen(true); }}
                                sx={{
                                    color: '#f97316',
                                    '&:hover': { bgcolor: alpha('#f97316', 0.1) },
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <Edit size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Vô hiệu hóa" arrow>
                            <IconButton
                                size="medium"
                                onClick={() => setDeletingGroup(params.row)}
                                sx={{
                                    color: '#EF4444',
                                    '&:hover': { bgcolor: alpha('#EF4444', 0.1) },
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <Trash2 size={20} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
            )
        },
    ];

    return (
        <Box
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            suppressHydrationWarning={true}
        >
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Quản lý nhóm khách hàng</h1>
                    <span className="text-sm text-gray-500">({stats.total} nhóm)</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {/* Tổng nhóm */}
                <Box sx={{
                    p: 2,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <Users
                        size={80}
                        className="opacity-10"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0
                        }}
                    />
                    <div className="relative z-10">
                        <Users size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.total}</p>
                        <p className="text-sm opacity-90">Tổng nhóm</p>
                    </div>
                </Box>
                {/* Hoạt động */}
                <Box sx={{
                    p: 2,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <CheckCircle
                        size={80}
                        className="opacity-10"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0
                        }}
                    />
                    <div className="relative z-10">
                        <CheckCircle size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.active}</p>
                        <p className="text-sm opacity-90">Đang hoạt động</p>
                    </div>
                </Box>
                {/* Tạm khóa */}
                <Box sx={{
                    p: 2,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <XCircle
                        size={80}
                        className="opacity-10"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0
                        }}
                    />
                    <div className="relative z-10">
                        <XCircle size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.inactive}</p>
                        <p className="text-sm opacity-90">Tạm khóa</p>
                    </div>
                </Box>
            </div>

            {/* Filter & Actions Row */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Tìm kiếm nhóm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                    <Search size={16} className="text-gray-400" />
                                </Box>
                            ),
                        }}
                        sx={{
                            width: 250,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.875rem',
                            }
                        }}
                    />
                    <div className="flex items-center gap-3">
                        {searchTerm && (
                            <Button
                                size="small"
                                startIcon={<X size={14} />}
                                onClick={() => setSearchTerm('')}
                                sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.8rem' }}
                            >
                                Xóa lọc
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<PlusCircle size={18} />}
                            onClick={() => setIsModalOpen(true)}
                            sx={{
                                bgcolor: '#2563eb',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 2.5,
                                py: 1,
                                textTransform: 'none',
                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                                '&:hover': {
                                    bgcolor: '#1d4ed8',
                                    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
                                    transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        >
                            + Thêm nhóm
                        </Button>
                    </div>
                </div>
            </Paper>

            {/* Data Table */}
            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: '600px',
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
                            bgcolor: alpha('#2563eb', 0.04),
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
                    rows={filteredGroups}
                    columns={columns}
                    rowHeight={68}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                        sorting: { sortModel: [{ field: 'display_order', sort: 'asc' }] },
                    }}
                    loading={loading}
                    localeText={{
                        noRowsLabel: 'Không có nhóm khách hàng nào',
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

            {/* Customer Group Modal */}
            <CustomerGroupModal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingGroup(null);
                }}
                onSave={handleSave}
                groupToEdit={editingGroup}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={Boolean(deletingGroup)}
                onClose={() => setDeletingGroup(null)}
                onConfirm={handleDelete}
                groupName={deletingGroup?.name}
            />
        </Box>
    );
}

