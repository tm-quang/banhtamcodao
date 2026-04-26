/**
 * Admin Banners Management Page - Premium UI
 * @file src/app/(admin)/admin/banners/page.js
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon, PlusCircle, Edit, Trash2, Search, X,
  CheckCircle, RefreshCw, AlertCircle, Monitor, Smartphone, Laptop
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';
import BannerModal from '@/components/tailwindcss/BannerModal';
import { useRouter } from 'next/navigation';

export default function BannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deletingBanner, setDeletingBanner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Calculate stats
  const stats = useMemo(() => {
    const total = banners.length;
    const active = banners.filter(b => b.is_active).length;
    const desktop = banners.filter(b => b.device === 'desktop' || b.device === 'all').length;
    const mobile = banners.filter(b => b.device === 'mobile' || b.device === 'all').length;
    return { total, active, desktop, mobile };
  }, [banners]);

  // Filter banners
  const filteredBanners = useMemo(() => {
    return banners.filter(banner =>
      banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.link?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [banners, searchTerm]);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners || []);
      } else {
        setError('Không thể tải danh sách banner');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      setError('Lỗi khi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSave = async (bannerData) => {
    const isEditMode = Boolean(bannerData.id);
    const url = isEditMode ? `/api/admin/banners/${bannerData.id}` : '/api/admin/banners';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchBanners();
        router.refresh();
      } else {
        const err = await res.json();
        setAlertModal({ open: true, title: 'Lỗi', message: `Có lỗi xảy ra: ${err.message || 'Lỗi không xác định'}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      setAlertModal({ open: true, title: 'Lỗi', message: 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deletingBanner) return;

    try {
      const res = await fetch(`/api/admin/banners/${deletingBanner.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingBanner(null);
        fetchBanners();
        router.refresh();
      } else {
        setAlertModal({ open: true, title: 'Lỗi', message: 'Xóa thất bại!', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
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
      accessorKey: 'image_url',
      header: 'Hình ảnh',
      cell: ({ getValue, row }) => (
        <div className="relative w-24 h-12 rounded-xl overflow-hidden shadow-inner border border-gray-100 bg-gray-50 group">
          {getValue() ? (
            <img
              src={getValue()}
              alt={row.original.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={20} />
            </div>
          )}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: 'title',
      header: 'Tiêu đề Banner',
      cell: ({ getValue }) => (
        <span className="text-base font-semibold text-gray-900 leading-tight">
          {getValue() || 'Không có tiêu đề'}
        </span>
      ),
      size: 250,
    },
    {
      accessorKey: 'device',
      header: 'Thiết bị',
      cell: ({ getValue }) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border shadow-sm ${getValue() === 'desktop' ? 'bg-blue-50 text-blue-600 border-blue-100' :
          getValue() === 'mobile' ? 'bg-amber-50 text-amber-600 border-amber-100' :
            'bg-purple-50 text-purple-600 border-purple-100'
          }`}>
          {getValue() === 'desktop' ? 'Máy tính' : getValue() === 'mobile' ? 'Điện thoại' : 'Tất cả'}
        </span>
      ),
      size: 130,
    },
    {
      accessorKey: 'display_order',
      header: 'Thứ tự',
      cell: ({ getValue }) => (
        <span className="text-sm font-black text-gray-400">#{getValue() || 0}</span>
      ),
      size: 100,
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
      size: 130,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <Tooltip content="Sửa">
            <button
              onClick={() => { setEditingBanner(row.original); setIsModalOpen(true); }}
              className="w-10 h-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-50"
            >
              <Edit size={18} />
            </button>
          </Tooltip>
          <Tooltip content="Xóa">
            <button
              onClick={() => setDeletingBanner(row.original)}
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
              <Monitor size={18} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý Banner</h1>
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-0.5">Quản lý hình ảnh quảng cáo hiển thị trên trang chủ ({stats.total} banner)</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
            onClick={fetchBanners}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl border border-gray-200 text-gray-500 bg-gray-500 hover:bg-gray-600 font-black uppercase text-[11px] tracking-widest px-6 shadow-sm transition-all active:scale-95"
          >
            Làm mới
          </Button>
          <Button
            startIcon={<PlusCircle size={20} />}
            onClick={() => { setEditingBanner(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest px-8 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            Thêm Banner mới
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
        ) : (
          <>
            {/* Tổng banner */}
            <div
              onClick={() => setSearchTerm('')}
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-blue-100`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <Monitor size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <Monitor size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.total}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Tổng Banner</p>
                </div>
              </div>
            </div>

            {/* Đang hoạt động */}
            <div
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-emerald-100`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <CheckCircle size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.active}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Đang hoạt động</p>
                </div>
              </div>
            </div>

            {/* Desktop */}
            <div
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-purple-500 to-indigo-800 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-purple-100`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <Laptop size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <Laptop size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.desktop}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Trên Máy tính</p>
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-amber-100`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <Smartphone size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.mobile}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Trên Điện thoại</p>
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
              placeholder="TÌM KIẾM THEO TIÊU ĐỀ, ĐƯỜNG DẪN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />}
              className="!rounded-2xl border-gray-200 bg-gray-50/50 font-bold uppercase tracking-tight focus:bg-white transition-all pl-12"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-red-500 hover:text-red-600 bg-red-50 rounded-xl transition-all active:scale-95 uppercase tracking-widest"
            >
              <X size={14} />
              Xóa bộ lọc
            </button>
          )}
          <div className="h-8 w-px bg-gray-200" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredBanners.length} Banner</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 min-h-[600px]">
        <DataTable
          data={filteredBanners}
          columns={columns}
          loading={loading}
          searchable={false}
          pageSize={25}
          emptyStateIcon={<Monitor size={48} className="text-gray-400" />}
          emptyStateTitle="Không có banner"
          emptyStateDescription="Chưa có banner nào để hiển thị"
        />
      </div>

      {/* Banner Modal */}
      <BannerModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        bannerToEdit={editingBanner}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingBanner)}
        onClose={() => setDeletingBanner(null)}
        size="sm"
        title={
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={22} />
            <span className="font-bold uppercase tracking-tight">Xác nhận xóa Banner</span>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setDeletingBanner(null)}
              className="flex items-center justify-center h-10 !rounded-2xl font-black uppercase text-[11px] tracking-widest px-6 transition-all"
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
          Bạn có chắc chắn muốn xóa Banner <span className="font-black">"{deletingBanner?.title || deletingBanner?.id}"</span> không? Hành động này không thể hoàn tác.
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
