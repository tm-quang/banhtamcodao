/**
 * Admin Content Management Page - Testimonials Premium UI
 * @file src/app/(admin)/admin/content/page.js
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare, PlusCircle, Edit, Trash2, Search, X, Star,
  CheckCircle, XCircle, RefreshCw, AlertCircle, FileText
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';
import TestimonialModal from '@/components/tailwindcss/TestimonialModal';
import { useRouter } from 'next/navigation';

export default function ContentManagementPage() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', title: '', type: 'info' });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const filteredData = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return testimonials.filter(t => {
      const matchesSearch = !searchTerm ||
        t.customer_name?.toLowerCase().includes(search) ||
        t.content?.toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [testimonials, searchTerm, statusFilter]);

  const handleSave = async (formData) => {
    const isEdit = Boolean(editingItem?.id);
    const url = isEdit ? `/api/admin/content/${editingItem.id}` : '/api/admin/content';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setIsModalOpen(false);
        fetchTestimonials();
        router.refresh();
        setAlert({ open: true, title: 'Thành công', message: isEdit ? 'Cập nhật thành công!' : 'Thêm mới thành công!', type: 'success' });
      } else {
        setAlert({ open: true, title: 'Lỗi', message: result.message || 'Có lỗi xảy ra', type: 'error' });
      }
    } catch (error) {
      setAlert({ open: true, title: 'Lỗi', message: 'Lỗi kết nối server', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/content/${deletingId}`, { method: 'DELETE' });
      const result = await res.json();
      if (res.ok && result.success) {
        setDeletingId(null);
        fetchTestimonials();
        router.refresh();
        setAlert({ open: true, title: 'Thành công', message: 'Xóa thành công!', type: 'success' });
      }
    } catch (error) {
      setAlert({ open: true, title: 'Lỗi', message: 'Xóa thất bại', type: 'error' });
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'customer_name',
      header: 'Khách hàng',
      cell: ({ getValue, row }) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-black text-xs shadow-inner">
            {getValue()?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-tight">{getValue()}</span>
            <div className="flex gap-0.5 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} className={i < row.original.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
              ))}
            </div>
          </div>
        </div>
      ),
      size: 200
    },
    {
      accessorKey: 'content',
      header: 'Nội dung hiển thị',
      cell: ({ getValue }) => (
        <div className="max-w-[400px]">
          <p className="text-sm text-gray-600 line-clamp-2 italic leading-relaxed">"{getValue()}"</p>
        </div>
      ),
      size: 400
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ getValue }) => (
        <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight shadow-sm ${getValue() === 'active' ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'}`}>
          {getValue() === 'active' ? 'Hiện' : 'Ẩn'}
        </span>
      ),
      size: 100
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <Tooltip content="Sửa">
            <button
              onClick={() => { setEditingItem(row.original); setIsModalOpen(true); }}
              className="w-10 h-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-50"
            >
              <Edit size={18} />
            </button>
          </Tooltip>
          <Tooltip content="Xóa">
            <button
              onClick={() => setDeletingId(row.original.id)}
              className="w-10 h-10 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-red-50"
            >
              <Trash2 size={18} />
            </button>
          </Tooltip>
        </div>
      ),
      size: 100
    }
  ], []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-lg shadow-blue-100/50">
              <FileText size={18} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý nội dung</h1>
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-0.5">Quản lý đánh giá khách hàng (Testimonials) trang chủ ({testimonials.length} nội dung)</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
            onClick={fetchTestimonials}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl border border-gray-200 text-gray-500 bg-gray-500 hover:bg-gray-600 font-black uppercase text-[11px] tracking-widest px-6 shadow-sm transition-all active:scale-95"
          >
            Làm mới
          </Button>
          <Button
            startIcon={<PlusCircle size={20} />}
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest px-8 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            Thêm đánh giá mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
        ) : (
          <>
            <div
              onClick={() => { setStatusFilter('all'); setSearchTerm(''); }}
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'all' ? 'ring-4 ring-blue-300 ring-offset-2' : 'shadow-blue-100'}`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <MessageSquare size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{testimonials.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Tổng số đánh giá</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setStatusFilter('active')}
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'active' ? 'ring-4 ring-emerald-300 ring-offset-2' : 'shadow-emerald-100'}`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <CheckCircle size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{testimonials.filter(t => t.status === 'active').length}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Đang hiển thị</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setStatusFilter('inactive')}
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'inactive' ? 'ring-4 ring-amber-300 ring-offset-2' : 'shadow-amber-100'}`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <XCircle size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <XCircle size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{testimonials.filter(t => t.status === 'inactive').length}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Đang tạm ẩn</p>
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
              placeholder="TÌM KIẾM THEO TÊN KHÁCH, NỘI DUNG..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />}
              className="!rounded-2xl border-gray-200 bg-gray-50/50 font-bold uppercase tracking-tight focus:bg-white transition-all pl-12"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-red-500 hover:text-red-600 bg-red-50 rounded-xl transition-all active:scale-95 uppercase tracking-widest"
            >
              <X size={14} />
              Xóa lọc
            </button>
          )}
          <div className="h-8 w-px bg-gray-200" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredData.length} nội dung</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 min-h-[600px]">
        <DataTable
          data={filteredData}
          columns={columns}
          loading={loading}
          searchable={false}
          pageSize={25}
          emptyStateIcon={<FileText size={48} className="text-gray-400" />}
          emptyStateTitle="Không có nội dung"
          emptyStateDescription="Chưa có đánh giá testimonial nào để hiển thị"
        />
      </div>

      {/* Premium Testimonial Modal */}
      <TestimonialModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        testimonialToEdit={editingItem}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        size="sm"
        title={
          <div className="flex items-center gap-2 text-red-600 font-black uppercase tracking-tight">
            <AlertCircle size={22} />
            <span>Xác nhận xóa</span>
          </div>
        }
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setDeletingId(null)}
              className="!rounded-2xl px-6 h-10 font-black uppercase text-[11px] tracking-widest"
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDelete}
              className="!rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-100 px-8 h-10 font-black uppercase text-[11px] tracking-widest"
            >
              Xóa vĩnh viễn
            </Button>
          </div>
        }
      >
        <p className="text-gray-600 text-sm font-medium">Bạn có chắc muốn xóa đánh giá này khỏi trang chủ? Hành động này không thể hoàn tác.</p>
      </Dialog>

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
