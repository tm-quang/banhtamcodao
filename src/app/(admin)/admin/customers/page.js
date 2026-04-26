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
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-base shadow-lg shadow-blue-100">
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
      header: 'Hạng',
      cell: ({ getValue }) => <MembershipBadge level={getValue()} />,
      size: 160,
    },
    {
      accessorKey: 'reward_points',
      header: 'Điểm',
      cell: ({ getValue }) => (
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-black uppercase tracking-tight border border-amber-100 shadow-sm">
          <Award size={14} className="mr-1.5" />
          {(getValue() || 0).toLocaleString('vi-VN')}
        </div>
      ),
      size: 130,
    },
    {
      accessorKey: 'total_orders',
      header: 'Đơn',
      cell: ({ getValue }) => (
        <div className="text-blue-700 px-2 py-0.5 text-lg font-bold w-fit">
          {getValue() || 0}
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: 'total_spent',
      header: 'Chi tiêu',
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
        <div className="flex items-center justify-center gap-1.5">
          <Tooltip content="Sửa">
            <button
              onClick={() => { setEditingCustomer(row.original); setIsModalOpen(true); }}
              className="w-10 h-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-50"
            >
              <Edit size={18} />
            </button>
          </Tooltip>
          <Tooltip content="Xóa">
            <button
              onClick={() => setDeletingCustomer(row.original)}
              className="w-10 h-10 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-red-50"
            >
              <Trash2 size={18} />
            </button>
          </Tooltip>
        </div>
      ),
      size: 100,
    },
  ], []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-lg shadow-blue-100/50">
              <Users size={18} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý khách hàng</h1>
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-0.5">Danh sách khách hàng và lịch sử mua sắm ({stats.total} khách hàng)</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
            onClick={fetchCustomers}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl border border-gray-200 text-gray-500 bg-gray-500 hover:bg-gray-600 font-black uppercase text-[11px] tracking-widest px-6 shadow-sm transition-all active:scale-95"
          >
            Làm mới
          </Button>
          <Button
            startIcon={<PlusCircle size={20} />}
            onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest px-8 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            Thêm khách hàng
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        {loading ? (
          Array(5).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
        ) : (
          <>
            {/* Tổng khách hàng */}
            <div
              onClick={() => setStatusFilter('')}
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${!statusFilter ? 'ring-4 ring-blue-300 ring-offset-2' : 'shadow-blue-100'}`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <Users size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.total}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Tổng khách hàng</p>
                </div>
              </div>
            </div>

            {/* Đang hoạt động */}
            <div
              onClick={() => setStatusFilter('active')}
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'active' ? 'ring-4 ring-emerald-300 ring-offset-2' : 'shadow-emerald-100'}`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <UserCheck size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.active}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Đang hoạt động</p>
                </div>
              </div>
            </div>

            {/* Đã tắt */}
            <div
              onClick={() => setStatusFilter('inactive')}
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-gray-500 to-gray-700 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'inactive' ? 'ring-4 ring-gray-300 ring-offset-2' : 'shadow-gray-100'}`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <UserX size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <UserX size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.inactive}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Đã tắt</p>
                </div>
              </div>
            </div>

            {/* Tổng đơn */}
            <div className="group relative p-5 rounded-[28px] bg-gradient-to-br from-purple-600 to-indigo-800 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-purple-100">
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <TrendingUp size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.totalOrders}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Tổng đơn hàng</p>
                </div>
              </div>
            </div>

            {/* Tổng chi tiêu */}
            <div className="group relative p-5 rounded-[28px] bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-amber-100">
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <DollarSign size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-2xl font-black mb-0.5 tabular-nums tracking-tighter">{formatCurrency(stats.totalSpent)}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Tổng chi tiêu</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[250px]">
          <div className="relative group">
            <Input
              placeholder="TÌM THEO TÊN, EMAIL, SỐ ĐIỆN THOẠI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />}
              className="!rounded-2xl border-gray-200 bg-gray-50/50 font-bold uppercase tracking-tight focus:bg-white transition-all pl-12"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[11px] uppercase tracking-widest text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm tắt</option>
          </select>

          {(searchTerm || statusFilter) && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
              className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-red-500 hover:text-red-600 bg-red-50 rounded-xl transition-all active:scale-95 uppercase tracking-widest"
            >
              <X size={14} />
              Xóa bộ lọc
            </button>
          )}
          <div className="h-8 w-px bg-gray-200" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredCustomers.length} khách</span>
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
      <Dialog
        open={Boolean(deletingCustomer)}
        onClose={() => setDeletingCustomer(null)}
        size="sm"
        title={
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={22} />
            <span className="font-bold uppercase tracking-tight">Xác nhận xóa khách</span>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              onClick={() => setDeletingCustomer(null)}
              className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 bg-white text-gray-400 hover:text-gray-600 font-black uppercase text-[11px] tracking-widest px-6 transition-all"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={confirmDelete}
              className="flex items-center justify-center h-10 !rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-100 font-black uppercase text-[11px] tracking-widest px-8 transition-all"
            >
              Xác nhận xóa
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Bạn có chắc chắn muốn xóa khách hàng <span className="font-black">"{deletingCustomer?.full_name}"</span> không? Hành động này không thể hoàn tác.
        </p>
      </Dialog>

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
