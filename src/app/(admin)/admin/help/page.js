/**
 * Admin Help/FAQs Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/help/page.js
 */
'use client';


import React, { useState, useEffect, useMemo } from 'react';
import {
    HelpCircle, PlusCircle, Edit, Trash2, Search, X, MessageCircle,
    CheckCircle, XCircle, RefreshCw, AlertCircle, ChevronDown, ChevronUp
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
                <div className="flex items-center justify-center gap-1">
                    <Tooltip content="Chỉnh sửa">
                        <button
                            onClick={() => { setEditingFaq(row.original); setIsModalOpen(true); }}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                            <Edit size={18} />
                        </button>
                    </Tooltip>
                    <Tooltip content="Xóa">
                        <button
                            onClick={() => setDeletingId(row.original.id)}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
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
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Trợ giúp & FAQs</h1>
                    <span className="text-sm text-gray-500">({faqs.length} câu hỏi)</span>
                </div>
                <Button
                    variant="outline"
                    startIcon={<RefreshCw size={16} />}
                    onClick={fetchFaqs}
                    className="!bg-gray-500 !hover:bg-gray-600 text-white"
                >
                    Làm mới
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {loading ? <><SkeletonStatsCard /><SkeletonStatsCard /><SkeletonStatsCard /></> : (
                    <>
                        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md overflow-hidden hover:scale-105 transition-all">
                            <HelpCircle size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <HelpCircle size={32} className="mb-3 opacity-90" />
                                <p className="text-3xl font-bold">{faqs.length}</p>
                                <p className="text-sm opacity-90">Tổng số câu hỏi</p>
                            </div>
                        </div>
                        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md overflow-hidden hover:scale-105 transition-all">
                            <CheckCircle size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <CheckCircle size={32} className="mb-3 opacity-90" />
                                <p className="text-3xl font-bold">{faqs.filter(f => f.status === 'active').length}</p>
                                <p className="text-sm opacity-90">Đang hiển thị</p>
                            </div>
                        </div>
                        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md overflow-hidden hover:scale-105 transition-all">
                            <MessageCircle size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <MessageCircle size={32} className="mb-3 opacity-90" />
                                <p className="text-lg font-bold">Hỗ trợ khách hàng</p>
                                <p className="text-sm opacity-90">Giải đáp thắc mắc mua hàng</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Filter Row */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Tìm kiếm câu hỏi, câu trả lời..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            startIcon={<Search size={16} />}
                        />
                    </div>
                    <Button
                        variant="primary"
                        startIcon={<PlusCircle size={18} />}
                        onClick={() => { setEditingFaq(null); setIsModalOpen(true); }}
                        className="!bg-blue-600 !hover:bg-blue-700"
                    >
                        Thêm câu hỏi
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 min-h-[500px]">
                <DataTable
                    data={filteredFaqs}
                    columns={columns}
                    loading={loading}
                    pageSize={20}
                    emptyStateTitle="Chưa có câu hỏi nào"
                />
            </div>

            {/* FAQ Modal */}
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                size="lg"
                title={<div className="flex items-center gap-2"><HelpCircle className="text-blue-600" /> {editingFaq ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</div>}
            >
                <form onSubmit={handleSave} className="space-y-5 py-2">
                    <div>
                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-2">Câu hỏi khách hàng</label>
                        <Input name="question" defaultValue={editingFaq?.question} required placeholder="VD: Làm sao để đặt hàng?" />
                    </div>
                    <div>
                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-2">Câu trả lời</label>
                        <textarea
                            name="answer"
                            defaultValue={editingFaq?.answer}
                            className="w-full min-h-[150px] p-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Nhập nội dung giải đáp tại đây..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-2">Thứ tự hiển thị</label>
                            <Input name="sort_order" type="number" defaultValue={editingFaq?.sort_order || 0} />
                        </div>
                        <div>
                            <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-2">Trạng thái</label>
                            <select
                                name="status"
                                defaultValue={editingFaq?.status || 'active'}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700"
                            >
                                <option value="active">Hiển thị</option>
                                <option value="inactive">Tạm ẩn</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button variant="primary" type="submit" className="px-8">Lưu câu hỏi</Button>
                    </div>
                </form>
            </Dialog>

            <Dialog
                open={deletingId !== null}
                onClose={() => setDeletingId(null)}
                size="sm"
                title={<div className="flex items-center gap-2 text-red-600 font-bold"><AlertCircle /> Xác nhận xóa</div>}
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeletingId(null)}>Hủy</Button>
                        <Button variant="danger" onClick={confirmDelete}>Xóa vĩnh viễn</Button>
                    </div>
                }
            >
                <p className="text-gray-600">Bạn có chắc muốn xóa câu hỏi này?</p>
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
