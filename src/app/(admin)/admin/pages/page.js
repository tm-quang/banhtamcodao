/**
 * Admin Pages Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/pages/page.js
 */
'use client';


import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText, PlusCircle, Edit, Trash2, Search, X, Eye, EyeOff,
    CheckCircle, XCircle, RefreshCw, ExternalLink, AlertCircle, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';

export default function PagesManagementPage() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [deletingId, setDeletingId] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: '', title: '', type: 'info' });

    const fetchPages = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/pages');
            const data = await res.json();
            if (data.success) setPages(data.pages || []);
        } catch (error) {
            console.error('Failed to fetch pages:', error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchPages(); }, []);

    const filteredPages = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return pages.filter(p => {
            const matchesSearch = !searchTerm ||
                p.title?.toLowerCase().includes(search) ||
                p.slug?.toLowerCase().includes(search);
            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [pages, searchTerm, statusFilter]);

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        const isEdit = Boolean(editingPage?.id);
        const url = isEdit ? `/api/admin/pages/${editingPage.id}` : '/api/admin/pages';
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
                fetchPages();
                setAlert({ open: true, title: 'Thành công', message: 'Lưu trang thành công!', type: 'success' });
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
            const res = await fetch(`/api/admin/pages/${deletingId}`, { method: 'DELETE' });
            if (res.ok) {
                setDeletingId(null);
                fetchPages();
                setAlert({ open: true, title: 'Thành công', message: 'Xóa trang thành công!', type: 'success' });
            }
        } catch (error) {
            setAlert({ open: true, title: 'Lỗi', message: 'Xóa thất bại', type: 'error' });
        }
    };

    const columns = [
        {
            accessorKey: 'title',
            header: 'Tiêu đề trang',
            cell: ({ getValue, row }) => (
                <div className="flex flex-col py-1">
                    <span className="text-base font-bold text-gray-900 leading-tight">{getValue()}</span>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-tighter mt-1 flex items-center gap-1">
                        <ExternalLink size={10} /> /{row.original.slug}
                    </span>
                </div>
            ),
            size: 300
        },
        {
            accessorKey: 'updated_at',
            header: 'Cập nhật cuối',
            cell: ({ getValue }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">{format(new Date(getValue()), 'dd/MM/yyyy')}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{format(new Date(getValue()), 'HH:mm')}</span>
                </div>
            ),
            size: 150
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ getValue }) => {
                const status = getValue();
                return (
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight text-white shadow-sm ${status === 'active' ? 'bg-green-600' : 'bg-gray-500'}`}>
                        {status === 'active' ? 'Hiển thị' : 'Đang ẩn'}
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
                            onClick={() => { setEditingPage(row.original); setIsModalOpen(true); }}
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
                    <h1 className="text-xl font-bold text-gray-900">Nội dung các trang</h1>
                    <span className="text-sm text-gray-500">({pages.length} trang)</span>
                </div>
                <Button
                    variant="outline"
                    startIcon={<RefreshCw size={16} />}
                    onClick={fetchPages}
                    className="!bg-gray-500 !hover:bg-gray-600 text-white"
                >
                    Làm mới
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {loading ? <><SkeletonStatsCard /><SkeletonStatsCard /><SkeletonStatsCard /></> : (
                    <>
                        <div 
                            onClick={() => setStatusFilter('all')}
                            className={`relative p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md overflow-hidden transition-all cursor-pointer hover:scale-105 ${statusFilter === 'all' ? 'ring-4 ring-indigo-300 ring-offset-2' : ''}`}>
                            <FileText size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <FileText size={32} className="mb-3 opacity-90" />
                                <p className="text-3xl font-bold">{pages.length}</p>
                                <p className="text-sm opacity-90">Tổng trang nội dung</p>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter('active')}
                            className={`relative p-5 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md overflow-hidden transition-all cursor-pointer hover:scale-105 ${statusFilter === 'active' ? 'ring-4 ring-green-300 ring-offset-2' : ''}`}>
                            <CheckCircle size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <CheckCircle size={32} className="mb-3 opacity-90" />
                                <p className="text-3xl font-bold">{pages.filter(p => p.status === 'active').length}</p>
                                <p className="text-sm opacity-90">Đang hiển thị</p>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter('inactive')}
                            className={`relative p-5 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-md overflow-hidden transition-all cursor-pointer hover:scale-105 ${statusFilter === 'inactive' ? 'ring-4 ring-gray-300 ring-offset-2' : ''}`}>
                            <Calendar size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <Calendar size={32} className="mb-3 opacity-90" />
                                <p className="text-lg font-bold">Tạm ẩn/Nháp</p>
                                <p className="text-sm opacity-90">Chính sách, Giới thiệu...</p>
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
                            placeholder="Tìm kiếm tiêu đề, slug..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            startIcon={<Search size={16} />}
                        />
                    </div>
                    {(searchTerm || statusFilter !== 'all') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            startIcon={<X size={14} />}
                            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                        >
                            Xóa lọc
                        </Button>
                    )}
                    <Button
                        variant="primary"
                        startIcon={<PlusCircle size={18} />}
                        onClick={() => { setEditingPage(null); setIsModalOpen(true); }}
                    >
                        Thêm trang mới
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 min-h-[500px]">
                <DataTable
                    data={filteredPages}
                    columns={columns}
                    loading={loading}
                    pageSize={20}
                    emptyStateTitle="Chưa có trang nội dung nào"
                />
            </div>

            {/* Editor Modal */}
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                size="xl"
                title={<div className="flex items-center gap-2"><FileText className="text-blue-600" /> {editingPage ? 'Chỉnh sửa trang' : 'Tạo trang mới'}</div>}
            >
                <form onSubmit={handleSave} className="space-y-4 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-2">Tiêu đề trang</label>
                            <Input name="title" defaultValue={editingPage?.title} required placeholder="VD: Chính sách bảo mật" />
                        </div>
                        <div>
                            <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-2">Slug (Đường dẫn)</label>
                            <Input name="slug" defaultValue={editingPage?.slug} placeholder="VD: chinh-sach-bao-mat" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-2">Trạng thái hiển thị</label>
                        <select
                            name="status"
                            defaultValue={editingPage?.status || 'active'}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700"
                        >
                            <option value="active">Hiển thị công khai</option>
                            <option value="inactive">Tạm ẩn</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-2">Nội dung trang (HTML)</label>
                        <textarea
                            name="content"
                            defaultValue={editingPage?.content}
                            className="w-full min-h-[400px] p-4 bg-gray-50 border border-gray-200 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Nhập nội dung HTML của trang tại đây..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button variant="primary" type="submit" className="px-8">Lưu trang</Button>
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
                        <Button variant="danger" onClick={confirmDelete}>Xóa trang</Button>
                    </div>
                }
            >
                <p className="text-gray-600">Bạn có chắc muốn xóa trang này? Hành động này không thể hoàn tác.</p>
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
