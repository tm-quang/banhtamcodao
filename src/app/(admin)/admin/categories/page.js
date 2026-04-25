/**
 * Admin categories management page - Tailwind CSS Version
 * @file src/app/(admin)/admin/categories/page.js
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle, Edit, Trash2, FolderTree, Layers, Search, Tag, Link2, X, RefreshCw, AlertCircle, XCircle, Info, Star
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Chip } from '@/components/tailwindcss/ui/Chip';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';
import CategoryModal from '@/components/tailwindcss/CategoryModal';

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'parent', 'child'
  const [error, setError] = useState(null);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Calculate stats
  const stats = useMemo(() => ({
    total: categories.length,
    parent: categories.filter(c => !c.parent_id).length,
    child: categories.filter(c => c.parent_id).length,
  }), [categories]);

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const searchMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = typeFilter === 'all' ? true :
        typeFilter === 'parent' ? !c.parent_id : !!c.parent_id;
      return searchMatch && typeMatch;
    });
  }, [categories, searchTerm, typeFilter]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
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
      } else {
        setAlertModal({ open: true, title: 'Lỗi', message: 'Có lỗi xảy ra!', type: 'error' });
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
      } else {
        setAlertModal({ open: true, title: 'Lỗi', message: 'Xóa thất bại!', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setAlertModal({ open: true, title: 'Lỗi', message: 'Xóa thất bại!', type: 'error' });
    }
  };

  // Get parent category name
  const getParentName = (parentId) => {
    if (!parentId) return null;
    const parent = categories.find(c => c.id === parentId);
    return parent?.name || `ID: ${parentId}`;
  };

  // Table columns definition
  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ getValue }) => (
        <span className="text-sm font-bold text-blue-600 font-mono">#{getValue()}</span>
      ),
      size: 60,
    },
    {
      accessorKey: 'name',
      header: 'Tên Danh mục',
      cell: ({ row, getValue }) => (
        <div className="flex flex-col justify-center py-0.5">
          <span className="text-base font-semibold text-gray-900 leading-tight">
            {getValue()}
          </span>
          {row.original.parent_id && (
            <span className="text-xs text-gray-500 mt-0.5 font-medium">
              ↳ {getParentName(row.original.parent_id)}
            </span>
          )}
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ getValue }) => (
        <Chip
          variant="outline"
          size="sm"
          icon={<Link2 size={12} />}
          className="font-mono border-blue-200 text-blue-600 bg-blue-50/50"
        >
          {getValue()}
        </Chip>
      ),
      size: 180,
    },
    {
      accessorKey: 'parent_id',
      header: 'Loại',
      cell: ({ getValue }) => (
        getValue() ? (
          <span className="inline-block px-3 py-1.5 rounded-full text-md font-black tracking-tight bg-amber-500 text-white shadow-sm">
            Con
          </span>
        ) : (
          <span className="inline-block px-3 py-1.5 rounded-full text-md font-black tracking-tight bg-emerald-600 text-white shadow-sm">
            Gốc
          </span>
        )
      ),
      size: 120,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip content="Sửa">
            <button
              onClick={() => { setEditingCategory(row.original); setIsModalOpen(true); }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              <Edit size={18} />
            </button>
          </Tooltip>
          <Tooltip content="Xóa">
            <button
              onClick={() => setDeletingCategory(row.original)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </Tooltip>
        </div>
      ),
      size: 120,
    },
  ], [categories]);


  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Quản lý danh mục</h1>
          <span className="text-sm text-gray-500">({stats.total} danh mục)</span>
        </div>
        <Button
          variant="outline"
          startIcon={<RefreshCw size={16} />}
          onClick={fetchCategories}
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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
        {loading ? (
          <>
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </>
        ) : (
          <>
            {/* Tổng danh mục */}
            <div 
              onClick={() => setTypeFilter('all')}
              className={`relative p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${typeFilter === 'all' ? 'ring-4 ring-blue-300 ring-offset-2' : ''}`}>
              <FolderTree
                size={80}
                className="absolute bottom-0 right-0 opacity-10"
              />
              <div className="relative z-10">
                <FolderTree size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">{stats.total}</p>
                <p className="text-sm opacity-90">Tổng danh mục</p>
              </div>
            </div>

            {/* Danh mục gốc */}
            <div 
              onClick={() => setTypeFilter('parent')}
              className={`relative p-4 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${typeFilter === 'parent' ? 'ring-4 ring-green-300 ring-offset-2' : ''}`}>
              <Layers
                size={80}
                className="absolute bottom-0 right-0 opacity-10"
              />
              <div className="relative z-10">
                <Layers size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">{stats.parent}</p>
                <p className="text-sm opacity-90">Danh mục gốc</p>
              </div>
            </div>

            {/* Danh mục con */}
            <div 
              onClick={() => setTypeFilter('child')}
              className={`relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${typeFilter === 'child' ? 'ring-4 ring-amber-300 ring-offset-2' : ''}`}>
              <Tag
                size={80}
                className="absolute bottom-0 right-0 opacity-10"
              />
              <div className="relative z-10">
                <Tag size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">{stats.child}</p>
                <p className="text-sm opacity-90">Danh mục con</p>
              </div>
            </div>

            {/* Coming Soon Slots to match Products Page layout */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1">
              <Star size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <Star size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">0</p>
                <p className="text-sm opacity-90">COMING SOON</p>
              </div>
            </div>
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1">
              <Star size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <Star size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">0</p>
                <p className="text-sm opacity-90">COMING SOON</p>
              </div>
            </div>
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1">
              <Star size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <Star size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">0</p>
                <p className="text-sm opacity-90">COMING SOON</p>
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

          {(searchTerm || typeFilter !== 'all') && (
            <Button
              size="sm"
              variant="ghost"
              startIcon={<X size={14} />}
              onClick={() => { setSearchTerm(''); setTypeFilter('all'); }}
            >
              Xóa lọc
            </Button>
          )}

          {/* Add Button */}
          <Button
            variant="primary"
            startIcon={<PlusCircle size={18} />}
            onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
          >
            + Thêm danh mục
          </Button>
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
          emptyStateIcon={<FolderTree size={48} className="text-gray-400" />}
          emptyStateTitle="Không có danh mục"
          emptyStateDescription="Chưa có danh mục nào để hiển thị"
        />
      </div>

      {/* Category Modal */}
      <CategoryModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        categoryToEdit={editingCategory}
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa danh mục"
        description={`Bạn có chắc chắn muốn xóa danh mục "${deletingCategory?.name}" không?`}
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
