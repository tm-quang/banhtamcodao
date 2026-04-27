/**
 * Admin categories management page - Premium UI
 * @file src/app/(admin)/admin/categories/page.js
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle, Edit, Trash2, FolderTree, Search, X, RefreshCw, AlertCircle, CheckCircle, XCircle, Star
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';
import CategoryModal from '@/components/tailwindcss/CategoryModal';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
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
    const safeCategories = Array.isArray(categories) ? categories : [];
    const total = safeCategories.length;
    const active = safeCategories.filter(c => c.active || c.status === 'active').length;
    const inactive = safeCategories.filter(c => !c.active && c.status !== 'active').length;
    return { total, active, inactive };
  }, [categories]);

  // Filter categories
  const filteredCategories = useMemo(() => {
    const safeCategories = Array.isArray(categories) ? categories : [];
    return safeCategories.filter(category =>
      (category.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      } else {
        setError('Không thể tải danh sách danh mục');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Lỗi khi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (categoryData) => {
    const isEditMode = Boolean(categoryData.id);
    const url = isEditMode ? `/api/admin/categories/${categoryData.id}` : '/api/admin/categories';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchCategories();
        router.refresh();
      } else {
        const err = await res.json();
        setAlertModal({ open: true, title: 'Lỗi', message: `Có lỗi xảy ra: ${err.message || 'Lỗi không xác định'}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setAlertModal({ open: true, title: 'Lỗi', message: 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingCategory(null);
        fetchCategories();
        router.refresh();
      } else {
        setAlertModal({ open: true, title: 'Lỗi', message: 'Xóa thất bại!', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
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
      header: 'Ảnh',
      cell: ({ getValue, row }) => (
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-inner border border-gray-100">
          {getValue() ? (
            <img
              src={getValue()}
              alt={row.original.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
              <FolderTree size={20} />
            </div>
          )}
        </div>
      ),
      size: 70,
    },
    {
      accessorKey: 'name',
      header: 'Tên danh mục',
      cell: ({ getValue }) => (
        <span className="text-base font-semibold text-gray-900">{getValue()}</span>
      ),
      size: 300,
    },
    {
      accessorKey: 'active',
      header: 'Trạng thái',
      cell: ({ getValue }) => (
        <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight shadow-sm ${getValue() ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'
          }`}>
          {getValue() ? 'Hoạt động' : 'Tắt'}
        </span>
      ),
      size: 150,
    },
    {
      accessorKey: 'sort_order',
      header: 'Thứ tự',
      cell: ({ getValue }) => (
        <span className="text-sm font-black text-gray-400">#{getValue() || 0}</span>
      ),
      size: 100,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <Tooltip content="Sửa">
            <button
              onClick={() => { setEditingCategory(row.original); setIsModalOpen(true); }}
              className="w-10 h-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-50"
            >
              <Edit size={18} />
            </button>
          </Tooltip>
          <Tooltip content="Xóa">
            <button
              onClick={() => setDeletingCategory(row.original)}
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
              <FolderTree size={18} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Danh mục sản phẩm</h1>
          </div>
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.15em] ml-0.5">Quản lý phân loại thực đơn ({stats.total} danh mục)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
            onClick={fetchCategories}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl text-gray-600 bg-gray-500 hover:bg-gray-600 font-black uppercase text-xs tracking-widest px-3 shadow-sm transition-all"
          >
            Làm mới
          </Button>
          <Button
            startIcon={<PlusCircle size={20} />}
            onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs tracking-widest px-6 shadow-md shadow-orange-100 transition-all"
          >
            Thêm danh mục
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
          <p className="text-red-700 font-bold text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-5 px-0.5">
        {loading ? (
          Array(6).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
        ) : (
          <>
            {/* Tổng danh mục */}
            <div
              onClick={() => setSearchTerm('')}
              className="group relative p-3 md:p-4 rounded-2xl bg-blue-600 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 z-10 border-2 border-blue-600">
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <FolderTree size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <FolderTree size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.total}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Tổng danh mục</p>
                </div>
              </div>
            </div>

            {/* Hoạt động */}
            <div
              className="group relative p-3 md:p-4 rounded-2xl bg-emerald-500 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 z-10">
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <CheckCircle size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <CheckCircle size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.active}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Hoạt động</p>
                </div>
              </div>
            </div>

            {/* Đã tắt */}
            <div
              className="group relative p-3 md:p-4 rounded-2xl bg-gray-500 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 z-10">
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <XCircle size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <XCircle size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.inactive}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Đã tắt</p>
                </div>
              </div>
            </div>

            {/* Placeholders */}
            {[1, 2, 3].map(i => (
              <div key={i} className="group relative p-3 md:p-4 rounded-2xl bg-blue-500 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 z-10 opacity-40">
                <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                  <Star size={70} className="md:w-[90px] md:h-[90px]" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                    <Star size={14} className="md:w-[18px] md:h-[18px]" />
                  </div>
                  <div>
                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">0</p>
                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">DỰ PHÒNG</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[250px]">
          <div className="relative group">
            <Input
              placeholder="TÌM KIẾM TÊN DANH MỤC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search size={18} className="text-gray-600 group-focus-within:text-orange-500 transition-colors" />}
              className="!rounded-2xl border-gray-200 bg-gray-50/50 font-bold uppercase tracking-tight focus:bg-white transition-all pl-12"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="flex items-center gap-2 px-3 py-3 text-[11px] font-black text-red-500 hover:text-red-600 bg-red-50 rounded-xl transition-all active:scale-95 uppercase tracking-widest"
            >
              <X size={14} />
              Xóa lọc
            </button>
          )}
          <div className="h-8 w-px bg-gray-200" />
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredCategories.length} kết quả</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 min-h-[600px]">
        <DataTable
          data={filteredCategories}
          columns={columns}
          loading={loading}
          searchable={false}
          pageSize={25}
          emptyStateIcon={<FolderTree size={48} className="text-gray-600" />}
          emptyStateTitle="Không có danh mục"
          emptyStateDescription="Chưa có danh mục nào để hiển thị"
        />
      </div>

      {/* Category Modal */}
      <CategoryModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        categories={categories || []}
        categoryToEdit={editingCategory}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        size="sm"
        noPadding={true}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle size={22} className="text-red-600" />
            </div>
            <div>
              <span className="font-bold text-red-600 block uppercase tracking-tight">Xác nhận xóa danh mục</span>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-2 w-full px-1">
            <Button
              onClick={() => setDeletingCategory(null)}
              className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 bg-gray-500 text-white hover:bg-gray-600 font-black uppercase text-[11px] tracking-widest px-6 transition-all"
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
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-300">
          <p className="text-gray-700 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa danh mục <span className="font-black text-red-600">"{deletingCategory?.name}"</span> không? Hành động này không thể hoàn tác.
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
