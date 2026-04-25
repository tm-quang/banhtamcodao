/**
 * Admin Customer Groups Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/customer-groups/page.js
 */
'use client';


import React, { useState, useEffect, useMemo } from 'react';
import {
    PlusCircle, Edit, Trash2, Search, Users, Award, Settings, X,
    CheckCircle, XCircle, RefreshCw, AlertCircle, Info, Zap
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Chip } from '@/components/tailwindcss/ui/Chip';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';
import CustomerGroupModal from '@/components/tailwindcss/CustomerGroupModal';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
};

export default function CustomerGroupsPageTailwind() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [deletingGroup, setDeletingGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [isUpdatingMembership, setIsUpdatingMembership] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', title: '', type: 'info' });

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
            showAlert('Không thể tải danh sách nhóm khách hàng', 'Lỗi', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const showAlert = (message, title = 'Thông báo', type = 'info') => {
        setAlert({ open: true, message, title, type });
    };

    // Calculate stats
    const stats = useMemo(() => ({
        total: groups.length,
        active: groups.filter(g => g.is_active).length,
        inactive: groups.filter(g => !g.is_active).length,
    }), [groups]);

    // Filter groups
    const filteredGroups = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return groups.filter(g => {
            const matchesSearch = g.name?.toLowerCase().includes(search) ||
                g.description?.toLowerCase().includes(search);
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' ? g.is_active : !g.is_active);
            return matchesSearch && matchesStatus;
        });
    }, [groups, searchTerm, statusFilter]);

    const handleSave = async (groupData) => {
        const isEditMode = Boolean(groupData.id);
        const url = '/api/admin/customer-groups';
        const method = isEditMode ? 'PUT' : 'POST';

        try {
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
                showAlert(isEditMode ? 'Cập nhật nhóm thành công!' : 'Thêm nhóm thành công!', 'Thành công', 'success');
            } else {
                showAlert('Lỗi: ' + (data.message || 'Không thể lưu nhóm khách hàng'), 'Lỗi', 'error');
            }
        } catch (error) {
            showAlert('Lỗi: Không thể lưu nhóm khách hàng', 'Lỗi', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deletingGroup) return;
        try {
            const res = await fetch(`/api/admin/customer-groups?id=${deletingGroup.id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setDeletingGroup(null);
                await fetchGroups();
                // Tự động cập nhật membership_level cho tất cả khách hàng
                handleUpdateAllMembershipLevels();
                showAlert('Vô hiệu hóa nhóm thành công!', 'Thành công', 'success');
            } else {
                showAlert('Lỗi: ' + (data.message || 'Không thể xóa nhóm'), 'Lỗi', 'error');
            }
        } catch (error) {
            showAlert('Lỗi: Không thể xóa nhóm', 'Lỗi', 'error');
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

    const columns = useMemo(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ getValue }) => (
                <span className="text-xs font-black text-blue-600 font-mono">#{getValue()}</span>
            ),
            size: 70
        },
        {
            accessorKey: 'name',
            header: 'Nhóm khách hàng',
            cell: ({ getValue, row }) => (
                <div className="flex flex-col py-0.5">
                    <span className="text-base font-bold text-gray-900 leading-tight">
                        {getValue()}
                    </span>
                    {row.original.description && (
                        <span className="text-xs text-blue-600 font-medium line-clamp-1 mt-0.5">
                            {row.original.description}
                        </span>
                    )}
                </div>
            ),
            size: 250
        },
        {
            accessorKey: 'min_points',
            header: 'Điểm tối thiểu',
            cell: ({ getValue }) => (
                <div className="flex items-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black uppercase tracking-tight border border-amber-100 shadow-sm">
                        <Award size={12} className="shrink-0" />
                        {formatCurrency(getValue() || 0)} ĐIỂM
                    </span>
                </div>
            ),
            size: 160
        },
        {
            accessorKey: 'points_per_amount',
            header: 'Tỷ lệ tích điểm',
            cell: ({ getValue }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                        1 điểm / {formatCurrency(getValue() || 1000)}đ
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium italic">Tiêu dùng thực tế</span>
                </div>
            ),
            size: 180
        },
        {
            accessorKey: 'display_order',
            header: 'Thứ tự',
            cell: ({ getValue }) => (
                <span className="text-sm font-black text-gray-400">#{getValue() || 0}</span>
            ),
            size: 100
        },
        {
            accessorKey: 'is_active',
            header: 'Trạng thái',
            cell: ({ getValue }) => (
                <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight text-white shadow-sm ${getValue() ? 'bg-green-600' : 'bg-gray-500'}`}>
                    {getValue() ? 'Hoạt động' : 'Tạm khóa'}
                </span>
            ),
            size: 130
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1">
                    <Tooltip content="Chỉnh sửa">
                        <button
                            onClick={() => {
                                setEditingGroup(row.original);
                                setIsModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                            <Edit size={18} />
                        </button>
                    </Tooltip>
                    <Tooltip content="Vô hiệu hóa">
                        <button
                            onClick={() => setDeletingGroup(row.original)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </Tooltip>
                </div>
            ),
            size: 150
        }
    ], []);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Quản lý nhóm khách hàng</h1>
                    <span className="text-sm text-gray-500">({stats.total} nhóm)</span>
                </div>
                <div className="flex items-center gap-3">
                    {isUpdatingMembership && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold animate-pulse">
                            <RefreshCw size={12} className="animate-spin" />
                            Đang đồng bộ thứ hạng...
                        </div>
                    )}
                    <Button
                        variant="outline"
                        startIcon={<RefreshCw size={16} />}
                        onClick={fetchGroups}
                        className="!bg-gray-500 !hover:bg-gray-600 text-white"
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {loading ? (
                    <><SkeletonStatsCard /><SkeletonStatsCard /><SkeletonStatsCard /></>
                ) : (
                    <>
                        {/* Tổng nhóm */}
                        <div 
                            onClick={() => setStatusFilter('all')}
                            className={`relative p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${statusFilter === 'all' ? 'ring-4 ring-indigo-300 ring-offset-2' : ''}`}>
                            <Users size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <Users size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{stats.total}</p>
                                <p className="text-sm opacity-90">Tổng nhóm khách</p>
                            </div>
                        </div>
                        {/* Hoạt động */}
                        <div 
                            onClick={() => setStatusFilter('active')}
                            className={`relative p-4 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${statusFilter === 'active' ? 'ring-4 ring-green-300 ring-offset-2' : ''}`}>
                            <CheckCircle size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <CheckCircle size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{stats.active}</p>
                                <p className="text-sm opacity-90">Đang kích hoạt</p>
                            </div>
                        </div>
                        {/* Tạm khóa */}
                        <div 
                            onClick={() => setStatusFilter('inactive')}
                            className={`relative p-4 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${statusFilter === 'inactive' ? 'ring-4 ring-gray-300 ring-offset-2' : ''}`}>
                            <XCircle size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <XCircle size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{stats.inactive}</p>
                                <p className="text-sm opacity-90">Nhóm tạm khóa</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Filter & Actions Row */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Tìm kiếm tên nhóm, mô tả..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            startIcon={<Search size={16} />}
                        />
                    </div>

                    {(searchTerm || statusFilter !== 'all') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            startIcon={<X size={14} />}
                            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                        >
                            Xóa lọc
                        </Button>
                    )}

                    {/* Add Button */}
                    <Button
                        variant="primary"
                        startIcon={<PlusCircle size={18} />}
                        onClick={() => { setEditingGroup(null); setIsModalOpen(true); }}
                        className="!bg-indigo-600 !hover:bg-indigo-700"
                    >
                        Thêm nhóm khách
                    </Button>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 min-h-[500px]">
                <DataTable
                    data={filteredGroups}
                    columns={columns}
                    loading={loading}
                    searchable={false}
                    pageSize={25}
                    emptyStateIcon={<Users size={48} className="text-gray-400" />}
                    emptyStateTitle="Không có nhóm khách hàng"
                    emptyStateDescription="Hãy tạo nhóm khách hàng để thiết lập chính sách tích điểm và ưu đãi."
                />
            </div>

            {/* Modals */}
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
            <Dialog
                open={deletingGroup !== null}
                onClose={() => setDeletingGroup(null)}
                size="sm"
                title={
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle size={22} />
                        <span className="font-bold">Vô hiệu hóa nhóm</span>
                    </div>
                }
                footer={
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeletingGroup(null)}
                            className="!bg-gray-300 !hover:bg-gray-500 text-gray-700"
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                        >
                            Vô hiệu hóa
                        </Button>
                    </div>
                }
            >
                <p className="text-gray-700">
                    Bạn có chắc chắn muốn vô hiệu hóa nhóm "{deletingGroup?.name}"? Các khách hàng trong nhóm này có thể bị ảnh hưởng về quyền lợi tích điểm.
                </p>
            </Dialog>

            {/* Alert Modal */}
            <AlertModal
                open={alert.open}
                onClose={() => setAlert({ ...alert, open: false })}
                title={alert.title}
                message={alert.message}
                type={alert.type}
            />
        </div>
    );
}
