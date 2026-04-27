/**
 * Admin Help/FAQs Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/help/page.js
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    HelpCircle, PlusCircle, Edit, Trash2, Search, X, MessageCircle,
    CheckCircle, XCircle, RefreshCw, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';

export default function HelpManagementPage() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: '', title: '', type: 'info' });

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/faqs');
            const data = await res.json();
            if (data.success) setFaqs(data.faqs || []);
        } catch (error) {
            console.error('Failed to fetch faqs:', error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchFaqs(); }, []);

    const filteredFaqs = useMemo(() => {
        if (!searchTerm) return faqs;
        const search = searchTerm.toLowerCase();
        return faqs.filter(f =>
            f.question?.toLowerCase().includes(search) ||
            f.answer?.toLowerCase().includes(search)
        );
    }, [faqs, searchTerm]);

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        const isEdit = Boolean(editingFaq?.id);
        const url = isEdit ? `/api/admin/faqs/${editingFaq.id}` : '/api/admin/faqs';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setIsModalOpen(false);
                fetchFaqs();
                setAlert({ open: true, title: 'Thành công', message: 'Lưu câu hỏi thành công!', type: 'success' });
            }
        } catch (error) {
            setAlert({ open: true, title: 'Lỗi', message: 'Lỗi kết nối server', type: 'error' });
        }
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            const res = await fetch(`/api/admin/faqs/${deletingId}`, { method: 'DELETE' });
            if (res.ok) {
                setDeletingId(null);
                fetchFaqs();
                setAlert({ open: true, title: 'Thành công', message: 'Xóa câu hỏi thành công!', type: 'success' });
            }
        } catch (error) {
            setAlert({ open: true, title: 'Lỗi', message: 'Xóa thất bại', type: 'error' });
        }
    };

    const columns = [
        {
            accessorKey: 'question',
            header: 'Câu hỏi / Thắc mắc',
            cell: ({ getValue, row }) => (
                <div className="flex flex-col py-2 max-w-md">
                    <span className="text-base font-bold text-gray-900 mb-1 leading-snug">{getValue()}</span>
                    <span className="text-xs text-gray-500 line-clamp-2 italic">{row.original.answer}</span>
                </div>
            ),
            size: 400
        },
        {
            accessorKey: 'sort_order',
            header: 'Thứ tự',
            cell: ({ getValue }) => <span className="text-sm font-black text-gray-400">#{getValue()}</span>,
            size: 100
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ getValue }) => {
                const status = getValue();
                return (
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight text-white shadow-sm ${status === 'active' ? 'bg-green-600' : 'bg-gray-500'}`}>
                        {status === 'active' ? 'Đang bật' : 'Đã tắt'}
                    </span>
                );
            },
            size: 130
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Tooltip content="Chỉnh sửa">
                        <button
                            onClick={() => { setEditingFaq(row.original); setIsModalOpen(true); }}
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
            size: 120
        }
    ];

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
              <HelpCircle size={18} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Trợ giúp & FAQs</h1>
          </div>
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.15em] ml-0.5">Quản lý câu hỏi thường gặp & Hỗ trợ khách hàng ({faqs.length} nội dung)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
            onClick={fetchFaqs}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl text-gray-600 bg-gray-500 hover:bg-gray-600 font-black uppercase text-xs tracking-widest px-3 shadow-sm transition-all"
          >
            Làm mới
          </Button>
          <Button
            startIcon={<PlusCircle size={20} />}
            onClick={() => { setEditingFaq(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs tracking-widest px-6 shadow-md shadow-orange-100 transition-all"
          >
            Thêm câu hỏi mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-5 px-0.5">
        {loading ? (
          Array(3).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
        ) : (
          <>
            <div
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 z-10 bg-blue-500`}>
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <HelpCircle size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <HelpCircle size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{faqs.length}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Tổng số</p>
                </div>
              </div>
            </div>

            <div
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 z-10 bg-emerald-500`}>
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <CheckCircle size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <CheckCircle size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{faqs.filter(f => f.status === 'active').length}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Hiển thị</p>
                </div>
              </div>
            </div>

            <div
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 z-10 bg-amber-500`}>
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <MessageCircle size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <MessageCircle size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-black mb-0.5 tracking-tight">Hỗ trợ</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Khách hàng</p>
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
              placeholder="TÌM KIẾM CÂU HỎI, CÂU TRẢ LỜI..."
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
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredFaqs.length} nội dung</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-[500px]">
        <DataTable
          data={filteredFaqs}
          columns={columns}
          loading={loading}
          pageSize={20}
          emptyStateIcon={<HelpCircle size={48} className="text-gray-600" />}
          emptyStateTitle="Chưa có câu hỏi nào"
        />
      </div>

      {/* FAQ Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        title={<div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-tight"><HelpCircle /> {editingFaq ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi mới'}</div>}
      >
        <form onSubmit={handleSave} className="space-y-5 py-2">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Câu hỏi khách hàng</label>
            <Input name="question" defaultValue={editingFaq?.question} required placeholder="VD: Làm sao để đặt hàng?" className="!rounded-2xl" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Câu trả lời chi tiết</label>
            <textarea
              name="answer"
              defaultValue={editingFaq?.answer}
              className="w-full min-h-[150px] p-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              placeholder="Nhập nội dung giải đáp tại đây..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Thứ tự hiển thị</label>
              <Input name="sort_order" type="number" defaultValue={editingFaq?.sort_order || 0} className="!rounded-2xl" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Trạng thái</label>
              <select
                name="status"
                defaultValue={editingFaq?.status || 'active'}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[11px] uppercase tracking-widest text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              >
                <option value="active">Hiển thị</option>
                <option value="inactive">Tạm ẩn</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="!rounded-2xl font-black uppercase text-[11px] tracking-widest px-6 h-10">Hủy</Button>
            <Button variant="primary" type="submit" className="!rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[11px] tracking-widest px-10 h-10 shadow-lg shadow-orange-100 transition-all">Lưu câu hỏi</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        size="sm"
        noPadding={true}
        title={
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertCircle size={22} className="text-red-600" />
              </div>
              <div>
                  <span className="font-bold text-red-600 block uppercase tracking-tight">Xác nhận xóa câu hỏi</span>
              </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-2 w-full px-1">
            <Button
              onClick={() => setDeletingId(null)}
              className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 bg-gray-500 text-white hover:bg-gray-600 font-black uppercase text-[11px] tracking-widest px-6 transition-all"
            >
              Hủy
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
          <p className="text-gray-700 text-sm leading-relaxed">Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.</p>
        </div>
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
