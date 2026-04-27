/**
 * Admin Promotions Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/promotions/page.js
 */
'use client';


import React, { useState, useEffect, useMemo } from 'react';
import {
    PlusCircle, Edit, Trash2, Search, Ticket, X, Calendar, Percent,
    DollarSign, CheckCircle, XCircle, RefreshCw, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Chip } from '@/components/tailwindcss/ui/Chip';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';
import PromotionModal from '@/components/tailwindcss/PromotionModal';

const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

export default function PromotionsPageTailwind() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [deletingId, setDeletingId] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: '', title: '', type: 'info' });

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/promotions');
            const data = await res.json();
            if (data.success) setPromotions(data.promotions || []);
        } catch (error) {
            console.error('Failed to fetch promotions:', error);
            showAlert('Không thể tải danh sách khuyến mãi', 'Lỗi', 'error');
        }
        setLoading(false);
    };

    useEffect(() => { fetchPromotions(); }, []);

    const showAlert = (message, title = 'Thông báo', type = 'info') => {
        setAlert({ open: true, message, title, type });
    };

    // Stats
    const stats = useMemo(() => ({
        total: promotions.length,
        active: promotions.filter(p => p.status === 'active').length,
        inactive: promotions.filter(p => p.status !== 'active').length,
    }), [promotions]);

    // Filtered promotions
    const filteredPromotions = useMemo(() => {
        return promotions.filter(p => {
            const search = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                p.promo_code?.toLowerCase().includes(search) ||
                p.title?.toLowerCase().includes(search);
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' ? p.status === 'active' : p.status !== 'active');
            return matchesSearch && matchesStatus;
        });
    }, [promotions, searchTerm, statusFilter]);

    const handleSave = async (data) => {
        const isEditMode = Boolean(data.id);
        const url = isEditMode ? `/api/admin/promotions/${data.id}` : '/api/admin/promotions';
        const method = isEditMode ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const result = await res.json();
            if (res.ok) {
                setIsModalOpen(false);
                setEditingPromotion(null);
                fetchPromotions();
                showAlert(isEditMode ? 'Cập nhật thành công!' : 'Thêm mã khuyến mãi thành công!', 'Thành công', 'success');
            } else {
                showAlert(result.message || 'Có lỗi xảy ra!', 'Lỗi', 'error');
            }
        } catch (error) {
            showAlert('Có lỗi xảy ra!', 'Lỗi', 'error');
        }
    };

    const handleDelete = (id) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            const res = await fetch(`/api/admin/promotions/${deletingId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchPromotions();
                showAlert('Xóa mã khuyến mãi thành công!', 'Thành công', 'success');
            } else {
                showAlert('Xóa thất bại!', 'Lỗi', 'error');
            }
        } catch (error) {
            showAlert('Xóa thất bại!', 'Lỗi', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'promo_code',
            header: 'Mã Ưu đãi',
            cell: ({ getValue }) => (
                <div className="flex items-center py-1">
                    <span className="text-[12px] font-black uppercase tracking-[0.1em] text-blue-600 bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100 shadow-sm font-mono transition-transform hover:scale-105 cursor-default">
                        {getValue()}
                    </span>
                </div>
            ),
            size: 160
        },
        {
            accessorKey: 'title',
            header: 'Tên chương trình',
            cell: ({ getValue, row }) => (
                <div className="flex flex-col py-1">
                    <span className="text-[15px] font-black text-gray-900 leading-tight tracking-tight">
                        {getValue()}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1 h-1 rounded-full bg-blue-400" />
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">
                            {row.original.discount_type === 'percent' ? 'GIẢM THEO PHẦN TRĂM (%)' : row.original.discount_type === 'fixed' ? 'GIẢM TRỰC TIẾP (VNĐ)' : 'MIỄN PHÍ VẬN CHUYỂN'}
                        </span>
                    </div>
                </div>
            ),
            size: 250
        },
        {
            accessorKey: 'discount_value',
            header: 'Mức giảm',
            cell: ({ getValue, row }) => {
                const value = getValue();
                const type = row.original.discount_type;
                return (
                    <div className="flex flex-col py-1">
                        <span className="text-lg font-black text-red-600 leading-none">
                            {type === 'percent' ? `${value}%` : formatCurrency(value)}
                        </span>
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">GIÁ TRỊ ƯU ĐÃI</span>
                    </div>
                );
            },
            size: 130
        },
        {
            accessorKey: 'min_order_value',
            header: 'Đơn tối thiểu',
            cell: ({ getValue }) => (
                <div className="flex flex-col py-1">
                    <span className="text-sm font-black text-gray-700 leading-none">
                        {formatCurrency(getValue())}
                    </span>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1.5">ÁP DỤNG TỪ</span>
                </div>
            ),
            size: 130
        },
        {
            accessorKey: 'end_date',
            header: 'Ngày hết hạn',
            cell: ({ getValue }) => {
                const date = getValue();
                const isExpired = new Date(date) < new Date();
                return (
                    <div className="flex flex-col py-1">
                        <span className={`text-sm font-black ${isExpired ? 'text-red-500' : 'text-gray-800'}`}>
                            {format(new Date(date), 'dd/MM')}
                        </span>
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter mt-1">
                            NĂM {format(new Date(date), 'yyyy')}
                        </span>
                    </div>
                );
            },
            size: 120
        },
        {
            accessorKey: 'status',
            header: 'Tình trạng',
            cell: ({ getValue }) => {
                const status = getValue();
                return (
                    <div className="flex justify-center">
                        <span className={`inline-block px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-md border border-white/20 ${status === 'active' ? 'bg-emerald-600' : 'bg-gray-500'}`}>
                            {status === 'active' ? 'Hoạt động' : 'Đã tắt'}
                        </span>
                    </div>
                );
            },
            size: 140
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Tooltip content="Chỉnh sửa">
                        <button
                            onClick={() => {
                                setEditingPromotion(row.original);
                                setIsModalOpen(true);
                            }}
                            className="w-10 h-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-50"
                        >
                            <Edit size={18} />
                        </button>
                    </Tooltip>
                    <Tooltip content="Xóa vĩnh viễn">
                        <button
                            onClick={() => handleDelete(row.original.id)}
                            className="w-10 h-10 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-red-50"
                        >
                            <Trash2 size={18} />
                        </button>
                    </Tooltip>
                </div>
            ),
            size: 120
        }
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
                            <Ticket size={18} fill="currentColor" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Mã khuyến mãi</h1>
                    </div>
                    <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.15em] ml-0.5">Quản lý Coupon & Voucher ({stats.total} mã)</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
                        onClick={fetchPromotions}
                        className="flex items-center justify-center gap-2 h-10 !rounded-2xl text-gray-600 bg-gray-500 hover:bg-gray-600 font-black uppercase text-xs tracking-widest px-3 shadow-sm transition-all"
                    >
                        Làm mới
                    </Button>
                    <Button
                        startIcon={<PlusCircle size={20} />}
                        onClick={() => { setEditingPromotion(null); setIsModalOpen(true); }}
                        className="flex items-center justify-center gap-2 h-10 !rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs tracking-widest px-6 shadow-md shadow-orange-100 transition-all"
                    >
                        Tạo mã mới
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4 mb-5 px-0.5">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
                ) : (
                    <>
                        <div
                            onClick={() => setStatusFilter('all')}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'all' ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-blue-600' : 'z-10 bg-blue-500'}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <Ticket size={70} className="md:w-[110px] md:h-[110px]" fill="currentColor" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <Ticket size={14} className="md:w-[18px] md:h-[18px]" fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.total}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Tổng số mã</p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('active')}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'active' ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-emerald-600' : 'z-10 bg-emerald-500'}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <CheckCircle size={70} className="md:w-[110px] md:h-[110px]" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <CheckCircle size={14} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.active}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Đang hoạt động</p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('inactive')}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'inactive' ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-gray-600' : 'z-10 bg-gray-500'}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <XCircle size={70} className="md:w-[110px] md:h-[110px]" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <XCircle size={14} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.inactive}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Đã tạm tắt</p>
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
                            placeholder="TÌM KIẾM MÃ KHUYẾN MÃI, TÊN CHIẾN DỊCH..."
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
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredPromotions.length} kết quả</span>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 min-h-[600px]">
                <DataTable
                    data={filteredPromotions}
                    columns={columns}
                    loading={loading}
                    searchable={false}
                    pageSize={25}
                    emptyStateIcon={<Ticket size={48} className="text-gray-600" />}
                    emptyStateTitle="Không có mã khuyến mãi"
                    emptyStateDescription="Chưa có mã khuyến mãi nào được tạo."
                />
            </div>

            {/* Modals */}
            <PromotionModal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPromotion(null);
                }}
                onSave={handleSave}
                promotionToEdit={editingPromotion}
            />

            {/* Delete Confirmation Dialog */}
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
                            <span className="font-bold text-red-600 block uppercase tracking-tight">Xác nhận xóa mã</span>
                        </div>
                    </div>
                }
                footer={
                    <div className="flex items-center justify-end gap-2 w-full px-1">
                        <Button
                            onClick={() => setDeletingId(null)}
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
                        Bạn có chắc chắn muốn xóa mã khuyến mãi này không? Hành động này không thể hoàn tác.
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
