/**
 * Admin customers management page - Tailwind CSS Version
 * @file src/app/(admin)/admin/customers/page.js
 */
'use client';


import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircle, Edit, Trash2, Users, UserCheck, UserX, Search,
  Phone, X, Award, DollarSign, TrendingUp, RefreshCw, Eye, AlertCircle, XCircle, Info,
  Crown, Star, Sparkles
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Chip } from '@/components/tailwindcss/ui/Chip';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';
import CustomerModal from '@/components/tailwindcss/CustomerModal';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

// --- INTERNAL UI COMPONENTS (HTML + TAILWIND) ---

/**
 * Hiển thị Badge Nhóm khách hàng (Membership)
 */
const MembershipBadge = ({ level }) => {
  if (!level) return <span className="text-gray-400">—</span>;

  const levelLower = level.toLowerCase();
  let style = "bg-gray-500 text-white";
  let icon = null;
  let label = level;

  if (levelLower.includes('mới') || levelLower.includes('new')) {
    style = "bg-slate-600 text-white";
    icon = <UserCheck size={14} className="mr-1.5" />;
    label = "Khách hàng mới";
  } else if (levelLower.includes('thân thiết') || levelLower.includes('loyal') || levelLower.includes('regular')) {
    style = "bg-emerald-600 text-white";
    icon = <Star size={14} className="mr-1.5" />;
    label = "Thân thiết";
  } else if (levelLower.includes('vip') || levelLower.includes('premium')) {
    style = "bg-red-600 text-white";
    icon = <Crown size={14} className="mr-1.5" />;
    label = "Khách hàng VIP";
  } else if (levelLower.includes('diamond') || levelLower.includes('kim cương')) {
    style = "bg-purple-600 text-white";
    icon = <Sparkles size={14} className="mr-1.5 animate-pulse" />;
    label = "Kim cương";
  }

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight shadow-sm ${style}`}>
      {icon}
      {label}
    </div>
  );
};

/**
 * Hiển thị Badge Trạng thái khách hàng
 */
const CustomerStatusBadge = ({ status }) => {
  const isActive = status === 'active';
  return (
    <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight shadow-sm ${isActive ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'
      }`}>
      {isActive ? 'Hoạt động' : 'Tắt'}
    </span>
  );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ open, onClose, onConfirm, title, description, type = 'warning' }) => {
  const footer = (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="outline"
        onClick={onClose}
        className="!bg-gray-300 !hover:bg-gray-500 text-gray-700"
      >
        Hủy
      </Button>
      <Button
        variant={type === 'danger' ? 'danger' : 'primary'}
        onClick={onConfirm}
        className="!hover:bg-opacity-90"
      >
        Xác nhận
      </Button>
    </div>
  );

  const icons = {
    warning: AlertCircle,
    danger: XCircle,
    info: Info
  };

  const Icon = icons[type] || AlertCircle;
  const iconColors = {
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={
        <div className={`flex items-center gap-2 ${iconColors[type]}`}>
          <Icon size={22} />
          <span className="font-bold">{title}</span>
        </div>
      }
      footer={footer}
    >
      <p className="text-gray-700">{description}</p>
    </Dialog>
  );
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Calculate stats
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const inactive = customers.filter(c => c.status === 'inactive').length;
    const totalOrders = customers.reduce((sum, c) => sum + (c.total_orders || 0), 0);
    const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);

    return { total, active, inactive, totalOrders, totalSpent };
  }, [customers]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return customers.filter(customer => {
      const searchMatch = !search ||
        customer.full_name?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.phone_number?.includes(search);
      const statusMatch = !statusFilter || customer.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [customers, searchTerm, statusFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      } else {
        setError('Không thể tải danh sách khách hàng');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Lỗi khi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSave = async (customerData) => {
    const isEditMode = Boolean(customerData.id);
    const url = isEditMode ? `/api/admin/customers/${customerData.id}` : '/api/admin/customers';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchCustomers();
        router.refresh();
      } else {
        const err = await res.json();
        setAlertModal({ open: true, title: 'Lỗi', message: `Có lỗi xảy ra: ${err.message || 'Lỗi không xác định'}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      setAlertModal({ open: true, title: 'Lỗi', message: 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deletingCustomer) return;

    try {
      const res = await fetch(`/api/admin/customers/${deletingCustomer.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingCustomer(null);
        fetchCustomers();
        router.refresh();
      } else {
        setAlertModal({ open: true, title: 'Lỗi', message: 'Xóa thất bại!', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      setAlertModal({ open: true, title: 'Lỗi', message: 'Xóa thất bại!', type: 'error' });
    }
  };


  // Table columns definition
  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ getValue }) => (
        <span className="text-sm font-bold text-blue-600 font-mono">#{getValue()}</span>
      ),
      size: 70,
    },
    {
      accessorKey: 'full_name',
      header: 'Khách hàng',
      cell: ({ row, getValue }) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-base shadow-sm">
            {getValue()?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-semibold text-gray-900 truncate leading-tight">
              {getValue() || '—'}
            </span>
            {row.original.phone_number && (
              <span className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                <Phone size={10} /> {row.original.phone_number}
              </span>
            )}
          </div>
        </div>
      ),
      size: 280,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-gray-600">{getValue() || '—'}</span>
      ),
      size: 200,
    },
    {
      accessorKey: 'membership_level',
      header: 'Nhóm khách hàng',
      cell: ({ getValue }) => <MembershipBadge level={getValue()} />,
      size: 180,
    },
    {
      accessorKey: 'reward_points',
      header: 'Điểm tích lũy',
      cell: ({ getValue }) => (
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-tight shadow-sm">
          <Award size={14} className="mr-1.5" />
          {(getValue() || 0).toLocaleString('vi-VN')}
        </div>
      ),
      size: 150,
    },
    {
      accessorKey: 'total_orders',
      header: 'Tổng đơn',
      cell: ({ getValue }) => (
        <div className="text-blue-700 px-2 py-0.5 text-lg font-bold w-fit">
          {getValue() || 0}
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: 'total_spent',
      header: 'Tổng chi tiêu',
      cell: ({ getValue }) => (
        <span className="text-md font-black text-red-600">
          {formatCurrency(getValue() || 0)}
        </span>
      ),
      size: 130,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ getValue }) => <CustomerStatusBadge status={getValue()} />,
      size: 120,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip content="Sửa">
            <button
              onClick={() => { setEditingCustomer(row.original); setIsModalOpen(true); }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              <Edit size={18} />
            </button></Tooltip>
          <Tooltip content="Xóa">
            <button
              onClick={() => setDeletingCustomer(row.original)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button></Tooltip>
        </div>
      ),
      size: 100,
    },
  ], []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Quản lý khách hàng</h1>
          <span className="text-sm text-gray-500">({stats.total} khách hàng)</span>
        </div>
        <Button
          variant="outline"
          startIcon={<RefreshCw size={16} />}
          onClick={fetchCustomers}
          className="!bg-gray-500 !hover:bg-gray-600 text-white"
        >
          Làm mới
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        {loading ? (
          <>
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </>
        ) : (
          <>
            {/* Tổng khách hàng */}
            <div 
              onClick={() => setStatusFilter('')}
              className={`relative p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${!statusFilter ? 'ring-4 ring-blue-300 ring-offset-2' : ''}`}>
              <Users size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <Users size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">{stats.total}</p>
                <p className="text-sm opacity-90">Tổng khách hàng</p>
              </div>
            </div>

            {/* Đang hoạt động */}
            <div 
              onClick={() => setStatusFilter('active')}
              className={`relative p-4 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${statusFilter === 'active' ? 'ring-4 ring-green-300 ring-offset-2' : ''}`}>
              <UserCheck size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <UserCheck size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">{stats.active}</p>
                <p className="text-sm opacity-90">Đang hoạt động</p>
              </div>
            </div>

            {/* Đã tắt */}
            <div 
              onClick={() => setStatusFilter('inactive')}
              className={`relative p-4 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${statusFilter === 'inactive' ? 'ring-4 ring-gray-300 ring-offset-2' : ''}`}>
              <UserX size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <UserX size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">{stats.inactive}</p>
                <p className="text-sm opacity-90">Đã tắt</p>
              </div>
            </div>

            {/* Tổng đơn */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1">
              <TrendingUp size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <TrendingUp size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">{stats.totalOrders}</p>
                <p className="text-sm opacity-90">Tổng đơn</p>
              </div>
            </div>

            {/* Tổng chi tiêu */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1">
              <DollarSign size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <DollarSign size={32} className="opacity-90 mb-3" />
                <p className="text-2xl font-bold mb-1">{formatCurrency(stats.totalSpent)}</p>
                <p className="text-sm opacity-90">Tổng chi tiêu</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter & Actions Row */}
      <div className="p-4 mb-4 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm..."
              startIcon={<Search size={16} />}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tắt</option>
          </select>

          {(searchTerm || statusFilter) && (
            <Button
              size="sm"
              variant="ghost"
              startIcon={<X size={14} />}
              onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
            >
              Xóa lọc
            </Button>
          )}

          {/* Add Button */}
          <Button
            variant="primary"
            startIcon={<PlusCircle size={18} />}
            onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
          >
            Thêm khách hàng
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 min-h-[600px]">
        <DataTable
          data={filteredCustomers}
          columns={columns}
          loading={loading}
          searchable={false}
          pageSize={25}
          emptyStateIcon={<Users size={48} className="text-gray-400" />}
          emptyStateTitle="Không có khách hàng"
          emptyStateDescription="Chưa có khách hàng nào để hiển thị"
        />
      </div>

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
        onConfirm={confirmDelete}
        title="Xác nhận xóa khách hàng"
        description={`Bạn có chắc chắn muốn xóa khách hàng "${deletingCustomer?.full_name}" không?`}
      />

      {/* Alert Modal */}
      <AlertModal
        open={alertModal.open}
        onClose={() => setAlertModal(prev => ({ ...prev, open: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
