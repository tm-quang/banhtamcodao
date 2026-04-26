/**
 * Admin Reviews Management Page - Premium UI
 * @file src/app/(admin)/admin/reviews/page.js
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Star, MessageSquare, Search, Trash2, CheckCircle, XCircle,
  RefreshCw, AlertCircle, Clock, X
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';
import { useRouter } from 'next/navigation';

// Badge Components
const ReviewStatusBadge = ({ status }) => {
  const configs = {
    pending: { label: 'Chờ duyệt', classes: 'bg-amber-500 text-white shadow-amber-100' },
    approved: { label: 'Đã duyệt', classes: 'bg-emerald-500 text-white shadow-emerald-100' },
    rejected: { label: 'Từ chối', classes: 'bg-gray-500 text-white shadow-gray-100' },
  };

  const config = configs[status] || configs.pending;

  return (
    <span className={`inline-block px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm ${config.classes}`}>
      {config.label}
    </span>
  );
};

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingReview, setDeletingReview] = useState(null);
  const [filters, setFilters] = useState({ rating: '', status: '', search: '' });
  const [error, setError] = useState(null);

  // Calculate stats
  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [reviews]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const searchMatch = !filters.search ||
        review.user_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        review.product_name?.toLowerCase().includes(filters.search.toLowerCase());
      const ratingMatch = !filters.rating || review.rating === parseInt(filters.rating);
      const statusMatch = !filters.status || review.status === filters.status;
      return searchMatch && ratingMatch && statusMatch;
    });
  }, [reviews, filters]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        setError('Không thể tải danh sách đánh giá');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Lỗi khi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (reviewId, status) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchReviews();
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const confirmDelete = async () => {
    if (!deletingReview) return;

    try {
      const res = await fetch(`/api/admin/reviews/${deletingReview.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingReview(null);
        fetchReviews();
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
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
      accessorKey: 'user_name',
      header: 'Khách hàng',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-xs text-gray-500 border border-gray-200">
            {getValue()?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="text-sm font-semibold text-gray-900">{getValue()}</span>
        </div>
      ),
      size: 180,
    },
    {
      accessorKey: 'product_name',
      header: 'Sản phẩm',
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-gray-700">{getValue()}</span>
      ),
      size: 180,
    },
    {
      accessorKey: 'rating',
      header: 'Đánh giá',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < getValue() ? "text-amber-400 fill-amber-400" : "text-gray-300"}
            />
          ))}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: 'comment',
      header: 'Nội dung',
      cell: ({ getValue }) => (
        <div className="max-w-[300px] truncate text-sm text-gray-500 italic">
          "{getValue()}"
        </div>
      ),
      size: 300,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ getValue, row }) => (
        <div className="flex flex-col gap-2">
          <ReviewStatusBadge status={getValue()} />
          {getValue() === 'pending' && (
            <div className="flex items-center gap-1.5 mt-1">
              <button
                onClick={() => handleUpdateStatus(row.original.id, 'approved')}
                className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-green-600 hover:text-white transition-all border border-green-200 shadow-sm"
              >
                Duyệt
              </button>
              <button
                onClick={() => handleUpdateStatus(row.original.id, 'rejected')}
                className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-red-600 hover:text-white transition-all border border-red-200 shadow-sm"
              >
                Từ chối
              </button>
            </div>
          )}
        </div>
      ),
      size: 160,
    },
    {
      accessorKey: 'created_at',
      header: 'Ngày tạo',
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-gray-400">
          {getValue() ? new Date(getValue()).toLocaleDateString('vi-VN') : '—'}
        </span>
      ),
      size: 120,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <Tooltip content="Xóa">
            <button
              onClick={() => setDeletingReview(row.original)}
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
              <MessageSquare size={18} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Đánh giá từ khách</h1>
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-0.5">Phản hồi và đánh giá chất lượng sản phẩm ({stats.total} đánh giá)</p>
        </div>
        <Button
          startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
          onClick={fetchReviews}
          className="flex items-center justify-center gap-2 h-10 !rounded-2xl border border-gray-200 text-gray-500 bg-gray-500 hover:bg-gray-600 font-black uppercase text-[11px] tracking-widest px-6 shadow-sm transition-all active:scale-95"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
        ) : (
          <>
            {/* Tổng đánh giá */}
            <div
              onClick={() => setFilters({ rating: '', status: '', search: '' })}
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${(!filters.status && !filters.rating) ? 'ring-4 ring-blue-300 ring-offset-2' : 'shadow-blue-100'}`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <MessageSquare size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.total}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Tổng đánh giá</p>
                </div>
              </div>
            </div>

            {/* Chờ duyệt */}
            <div
              onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${filters.status === 'pending' ? 'ring-4 ring-amber-300 ring-offset-2' : 'shadow-amber-100'}`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <Clock size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.pending}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Chờ duyệt</p>
                </div>
              </div>
            </div>

            {/* Đã duyệt */}
            <div
              onClick={() => setFilters(prev => ({ ...prev, status: 'approved' }))}
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${filters.status === 'approved' ? 'ring-4 ring-emerald-300 ring-offset-2' : 'shadow-emerald-100'}`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <CheckCircle size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.approved}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Đã duyệt</p>
                </div>
              </div>
            </div>

            {/* Đã từ chối */}
            <div
              onClick={() => setFilters(prev => ({ ...prev, status: 'rejected' }))}
              className={`group relative p-5 rounded-[28px] bg-gradient-to-br from-gray-500 to-gray-700 text-white shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${filters.status === 'rejected' ? 'ring-4 ring-gray-300 ring-offset-2' : 'shadow-gray-100'}`}>
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <XCircle size={110} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
                  <XCircle size={20} />
                </div>
                <div>
                  <p className="text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.rejected}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Từ chối</p>
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
              placeholder="TÌM THEO TÊN KHÁCH, TÊN SẢN PHẨM..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              startIcon={<Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />}
              className="!rounded-2xl border-gray-200 bg-gray-50/50 font-bold uppercase tracking-tight focus:bg-white transition-all pl-12"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filters.rating}
            onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[11px] uppercase tracking-widest text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
          >
            <option value="">Tất cả đánh giá</option>
            {[5, 4, 3, 2, 1].map(r => (
              <option key={r} value={r}>{r} Sao</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[11px] uppercase tracking-widest text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>

          {(filters.search || filters.rating || filters.status) && (
            <button
              onClick={() => setFilters({ rating: '', status: '', search: '' })}
              className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-red-500 hover:text-red-600 bg-red-50 rounded-xl transition-all active:scale-95 uppercase tracking-widest"
            >
              <X size={14} />
              Xóa bộ lọc
            </button>
          )}
          <div className="h-8 w-px bg-gray-200" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredReviews.length} đánh giá</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 min-h-[600px]">
        <DataTable
          data={filteredReviews}
          columns={columns}
          loading={loading}
          searchable={false}
          pageSize={25}
          emptyStateIcon={<MessageSquare size={48} className="text-gray-400" />}
          emptyStateTitle="Không có đánh giá"
          emptyStateDescription="Chưa có đánh giá nào để hiển thị"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingReview)}
        onClose={() => setDeletingReview(null)}
        size="sm"
        title={
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={22} />
            <span className="font-bold uppercase tracking-tight">Xác nhận xóa đánh giá</span>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setDeletingReview(null)}
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
          Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
        </p>
      </Dialog>
    </div>
  );
}
