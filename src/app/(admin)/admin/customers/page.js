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
    <div className="flex items-center justify-end gap-3 w-full">
      <Button
        onClick={onClose}
        className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 bg-gray-500 text-white hover:text-white hover:bg-gray-600 font-black uppercase text-[11px] tracking-widest px-6 transition-all"
      >
        Hủy bỏ
      </Button>
      <Button
        onClick={onConfirm}
        className={`flex items-center justify-center h-10 !rounded-2xl text-white shadow-xl font-black uppercase text-[11px] tracking-widest px-8 transition-all ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-100'}`}
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
      noPadding={true}
      title={
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center ${iconColors[type]}`}>
            <Icon size={22} />
          </div>
          <div>
            <span className={`font-bold block ${iconColors[type]}`}>{title}</span>
          </div>
        </div>
      }
      footer={footer}
    >
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-300">
        <p className="text-gray-700 text-sm">{description}</p>
      </div>
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
              className="w-10 h-10 bg-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-md shadow-blue-50"
            >
              <Edit size={18} />
            </button>
          </Tooltip>
          <Tooltip content="Xóa">
            <button
              onClick={() => setDeletingCustomer(row.original)}
              className="w-10 h-10 bg-gray-200 text-gray-600 hover:bg-red-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-md shadow-gray-50"
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
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100/50">
              <Users size={18} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Quản lý Khách hàng</h1>
          </div>
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.15em] ml-0.5">Danh sách khách hàng ({stats.total} khách hàng)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
            onClick={fetchCustomers}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl text-gray-600 bg-gray-500 hover:bg-gray-600 font-black uppercase text-xs tracking-widest px-3 shadow-sm transition-all"
          >
            Làm mới
          </Button>
          <Button
            startIcon={<PlusCircle size={16} />}
            onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px] tracking-widest px-6 shadow-md shadow-orange-100 transition-all"
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
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-5 px-0.5">
        {loading ? (
          Array(5).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
        ) : (
          <>
            {/* Tổng khách hàng */}
            <div
              onClick={() => setStatusFilter('')}
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${!statusFilter ? 'z-20 scale-[1.02] shadow-xl ring-2 ring-white ring-offset-2 ring-offset-blue-600 bg-blue-600' : 'z-10 bg-blue-500'}`}>
              <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <Users size={70} className="md:w-[90px] md:h-[90px]" fill="currentColor" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 md:mb-3 shadow-inner">
                  <Users size={14} className="md:w-[18px] md:h-[18px]" fill="currentColor" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.total}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight">Tổng khách</p>
                </div>
              </div>
            </div>

            {/* Đang hoạt động */}
            <div
              onClick={() => setStatusFilter('active')}
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'active' ? 'z-20 scale-[1.02] shadow-xl ring-2 ring-white ring-offset-2 ring-offset-emerald-600 bg-emerald-600' : 'z-10 bg-emerald-500'}`}>
              <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <UserCheck size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 md:mb-3 shadow-inner">
                  <UserCheck size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.active}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Hoạt động</p>
                </div>
              </div>
            </div>

            {/* Đã tắt */}
            <div
              onClick={() => setStatusFilter('inactive')}
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'inactive' ? 'z-20 scale-[1.02] shadow-xl ring-2 ring-white ring-offset-2 ring-offset-gray-600 bg-gray-600' : 'z-10 bg-gray-500'}`}>
              <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <UserX size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 md:mb-3 shadow-inner">
                  <UserX size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.inactive}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Đã tắt</p>
                </div>
              </div>
            </div>

            {/* Tổng đơn */}
            <div className="group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 z-10 bg-indigo-600">
              <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <TrendingUp size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 md:mb-3 shadow-inner">
                  <TrendingUp size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.totalOrders}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Tổng đơn</p>
                </div>
              </div>
            </div>

            {/* Tổng chi tiêu */}
            <div className="group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 z-10 bg-amber-500 border-2 border-orange-400">
              <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <DollarSign size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 md:mb-3 shadow-inner">
                  <DollarSign size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{formatCurrency(stats.totalSpent).replace('đ', '')}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Doanh số (VNĐ)</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[300px]">
          <div className="relative group">
            <Input
              placeholder="TÌM THEO TÊN, EMAIL, SỐ ĐIỆN THOẠI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search size={18} className="text-gray-600 group-focus-within:text-orange-500 transition-colors" />}
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
              className="flex items-center gap-2 px-3 py-3 text-[11px] font-black text-red-500 hover:text-red-600 bg-red-50 rounded-xl transition-all active:scale-95 uppercase tracking-widest"
            >
              <X size={14} />
              Xóa
            </button>
          )}
          <div className="h-8 w-px bg-gray-200" />
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredCustomers.length} khách</span>
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
          emptyStateIcon={<Users size={48} className="text-gray-600" />}
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
        noPadding={true}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle size={22} className="text-red-600" />
            </div>
            <div>
              <span className="font-bold text-red-600 block">Xác nhận xóa khách</span>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-2 w-full px-1">
            <Button
              onClick={() => setDeletingCustomer(null)}
              className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 bg-gray-500 text-white hover:bg-gray-600 font-black uppercase text-[11px] tracking-widest px-6 transition-all"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={confirmDelete}
              className="flex items-center justify-center h-10 !rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-100 font-black uppercase text-[11px] tracking-widest px-8 transition-all"
            >
              Xác nhận
            </Button>
          </div>
        }
      >
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-300">
          <p className="text-gray-700 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa khách hàng <span className="font-black text-red-600">"{deletingCustomer?.full_name}"</span> không? Hành động này không thể hoàn tác.
          </p>
        </div>
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
