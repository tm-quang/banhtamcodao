/**
 * Admin Customer Groups Management Page - Premium UI
 * @file src/app/(admin)/admin/customer-groups/page.js
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle, Edit, Trash2, Search, Users, Award, X,
  CheckCircle, RefreshCw, AlertCircle, Zap, Shield
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';
import CustomerGroupModal from '@/components/tailwindcss/CustomerGroupModal';
import { useRouter } from 'next/navigation';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

export default function CustomerGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
        router.refresh();
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
        router.refresh();
        showAlert('Vô hiệu hóa nhóm thành công!', 'Thành công', 'success');
      } else {
        showAlert('Lỗi: ' + (data.message || 'Không thể xóa nhóm'), 'Lỗi', 'error');
      }
    } catch (error) {
      showAlert('Lỗi: Không thể xóa nhóm', 'Lỗi', 'error');
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
          <span className="text-sm font-bold text-gray-900">10k = {getValue() || 0} điểm</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Điểm / 10.000 VNĐ</span>
        </div>
      ),
      size: 150
    },
    {
      accessorKey: 'is_active',
      header: 'Trạng thái',
      cell: ({ getValue }) => (
        <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight shadow-sm ${getValue() ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'
          }`}>
          {getValue() ? 'Hoạt động' : 'Tắt'}
        </span>
      ),
      size: 130
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <Tooltip content="Sửa">
            <button
              onClick={() => { setEditingGroup(row.original); setIsModalOpen(true); }}
              className="w-10 h-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-50"
            >
              <Edit size={18} />
            </button>
          </Tooltip>
          <Tooltip content="Xóa">
            <button
              onClick={() => setDeletingGroup(row.original)}
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
      <style jsx global>{`
          button:focus {
              outline: none !important;
              box-shadow: none !important;
              ring: 0 !important;
          }
      `}</style>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100/50">
              <Users size={18} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Nhóm khách hàng</h1>
          </div>
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.15em] ml-0.5">Quản lý cấp bậc và quyền lợi thành viên ({stats.total} nhóm)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
            onClick={fetchGroups}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl text-gray-600 bg-gray-500 hover:bg-gray-600 font-black uppercase text-xs tracking-widest px-3 shadow-sm transition-all"
          >
            Làm mới
          </Button>
          <Button
            startIcon={<PlusCircle size={20} />}
            onClick={() => { setEditingGroup(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs tracking-widest px-6 shadow-md shadow-orange-100 transition-all"
          >
            Thêm nhóm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4 mb-5 px-0.5">
        {loading ? (
          Array(3).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
        ) : (
          <>
            {/* Tổng nhóm */}
            <div
              onClick={() => { setStatusFilter('all'); setSearchTerm(''); }}
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'all' ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-blue-600' : 'z-10 bg-blue-500'}`}>
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <Users size={70} className="md:w-[110px] md:h-[110px]" fill="currentColor" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <Users size={14} className="md:w-[18px] md:h-[18px]" fill="currentColor" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.total}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Tổng số nhóm</p>
                </div>
              </div>
            </div>

            {/* Nhóm hoạt động */}
            <div
              onClick={() => setStatusFilter('active')}
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'active' ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-emerald-600' : 'z-10 bg-emerald-500'}`}>
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <Shield size={70} className="md:w-[110px] md:h-[110px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <Shield size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.active}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Hoạt động</p>
                </div>
              </div>
            </div>

            {/* Nhóm tạm tắt */}
            <div
              onClick={() => setStatusFilter('inactive')}
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'inactive' ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-gray-600' : 'z-10 bg-gray-500'}`}>
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <Zap size={70} className="md:w-[110px] md:h-[110px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <Zap size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.inactive}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Tạm tắt</p>
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
              placeholder="TÌM KIẾM TÊN NHÓM, MÔ TẢ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search size={18} className="text-gray-600 group-focus-within:text-orange-500 transition-colors" />}
              className="!rounded-2xl border-gray-200 bg-gray-50/50 font-bold uppercase tracking-tight focus:bg-white transition-all pl-12"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="flex items-center gap-2 px-3 py-3 text-[11px] font-black text-red-500 hover:text-red-600 bg-red-50 rounded-xl transition-all active:scale-95 uppercase tracking-widest"
            >
              <X size={14} />
              Xóa lọc
            </button>
          )}
          <div className="h-8 w-px bg-gray-200" />
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredGroups.length} nhóm</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 min-h-[600px]">
        <DataTable
          data={filteredGroups}
          columns={columns}
          loading={loading}
          searchable={false}
          pageSize={25}
          emptyStateIcon={<Users size={48} className="text-gray-600" />}
          emptyStateTitle="Không có nhóm khách hàng"
          emptyStateDescription="Chưa có nhóm nào để hiển thị"
        />
      </div>

      {/* Modal */}
      <CustomerGroupModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        groupToEdit={editingGroup}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={Boolean(deletingGroup)}
        onClose={() => setDeletingGroup(null)}
        size="sm"
        noPadding={true}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle size={22} className="text-red-600" />
            </div>
            <div>
              <span className="font-bold text-red-600 block uppercase tracking-tight">Xác nhận vô hiệu hóa</span>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-2 w-full px-1">
            <Button
              onClick={() => setDeletingGroup(null)}
              className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 bg-gray-500 text-white hover:bg-gray-600 font-black uppercase text-[11px] tracking-widest px-6 transition-all"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleDelete}
              className="flex items-center justify-center h-10 !rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-100 font-black uppercase text-[11px] tracking-widest px-8 transition-all"
            >
              Vô hiệu hóa
            </Button>
          </div>
        }
      >
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-300">
          <p className="text-gray-700 text-sm leading-relaxed">
            Bạn có chắc chắn muốn vô hiệu hóa nhóm <span className="font-black text-red-600">"{deletingGroup?.name}"</span>? Các khách hàng trong nhóm này có thể bị ảnh hưởng về quyền lợi tích điểm.
          </p>
        </div>
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
