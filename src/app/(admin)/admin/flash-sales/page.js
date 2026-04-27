/**
 * Admin Flash Sales Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/flash-sales/page.js
 */
'use client';


import React, { useState, useEffect, useMemo } from 'react';
import {
    PlusCircle, Edit, Trash2, Search, Zap, X, Calendar, Percent,
    Eye, EyeOff, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle
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
import FlashSaleModal from '@/components/tailwindcss/FlashSaleModal';

const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

export default function FlashSalesPageTailwind() {
    const [flashSales, setFlashSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFlashSale, setEditingFlashSale] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive', 'running'
    const [deletingId, setDeletingId] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: '', title: '', type: 'info' });

    const fetchFlashSales = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/flash-sales');
            const data = await res.json();
            if (data.success) setFlashSales(data.flashSales || []);
        } catch (error) {
            console.error('Failed to fetch flash sales:', error);
            showAlert('Không thể tải danh sách Flash Sale', 'Lỗi', 'error');
        }
        setLoading(false);
    };

    useEffect(() => { fetchFlashSales(); }, []);

    const showAlert = (message, title = 'Thông báo', type = 'info') => {
        setAlert({ open: true, message, title, type });
    };

    // Stats
    const stats = useMemo(() => {
        const now = new Date();
        return {
            total: flashSales.length,
            active: flashSales.filter(f => f.status === 'active').length,
            inactive: flashSales.filter(f => f.status !== 'active').length,
            running: flashSales.filter(f => {
                const start = new Date(f.start_date);
                const end = new Date(f.end_date);
                return f.status === 'active' && start <= now && end >= now;
            }).length
        };
    }, [flashSales]);

    // Filtered flash sales
    const filteredFlashSales = useMemo(() => {
        const now = new Date();
        return flashSales.filter(f => {
            const search = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                f.name?.toLowerCase().includes(search) ||
                f.description?.toLowerCase().includes(search) ||
                f.badge_text?.toLowerCase().includes(search);

            let matchesStatus = true;
            if (statusFilter === 'active') matchesStatus = f.status === 'active';
            else if (statusFilter === 'inactive') matchesStatus = f.status !== 'active';
            else if (statusFilter === 'running') {
                const start = new Date(f.start_date);
                const end = new Date(f.end_date);
                matchesStatus = f.status === 'active' && start <= now && end >= now;
            }

            return matchesSearch && matchesStatus;
        });
    }, [flashSales, searchTerm, statusFilter]);

    const handleSave = async (data) => {
        const isEditMode = Boolean(data.id);
        const url = isEditMode ? `/api/admin/flash-sales/${data.id}` : '/api/admin/flash-sales';
        const method = isEditMode ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (res.ok && result.success) {
                setIsModalOpen(false);
                setEditingFlashSale(null);
                fetchFlashSales();
                showAlert(result.message || 'Thành công!', 'Thành công', 'success');
            } else {
                showAlert(result.message || 'Có lỗi xảy ra! Vui lòng thử lại.', 'Lỗi', 'error');
            }
        } catch (error) {
            console.error('Error saving flash sale:', error);
            showAlert('Có lỗi xảy ra! Vui lòng kiểm tra kết nối và thử lại.', 'Lỗi', 'error');
        }
    };

    const handleDelete = (id) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            const res = await fetch(`/api/admin/flash-sales/${deletingId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchFlashSales();
                showAlert('Xóa Flash Sale thành công!', 'Thành công', 'success');
            } else {
                showAlert('Xóa thất bại!', 'Lỗi', 'error');
            }
        } catch (error) {
            showAlert('Xóa thất bại!', 'Lỗi', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleStatus = async (flashSale) => {
        const newStatus = flashSale.status === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch(`/api/admin/flash-sales/${flashSale.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchFlashSales();
                showAlert(`Đã ${newStatus === 'active' ? 'bật' : 'tắt'} Flash Sale`, 'Thành công', 'success');
            }
        } catch (error) {
            console.error('Toggle status failed:', error);
            showAlert('Không thể thay đổi trạng thái', 'Lỗi', 'error');
        }
    };

    const getStatusInfo = (flashSale) => {
        const now = new Date();
        const start = new Date(flashSale.start_date);
        const end = new Date(flashSale.end_date);
        const isRunning = flashSale.status === 'active' && start <= now && end >= now;
        const isExpired = end < now;

        if (isExpired) {
            return { label: 'Hết hạn', className: 'bg-red-600' };
        } else if (isRunning) {
            return { label: 'Đang chạy', className: 'bg-green-600' };
        } else if (flashSale.status === 'active') {
            return { label: 'Chờ chạy', className: 'bg-amber-500' };
        } else {
            return { label: 'Đã tắt', className: 'bg-gray-500' };
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'badge_text',
            header: 'Nhãn hiển thị',
            cell: ({ getValue, row }) => {
                const badgeColor = row.original.badge_color || '#FFD93D';
                const isLightColor = ['#FFD93D', '#4ECDC4', '#1ABC9C'].includes(badgeColor);
                return (
                    <div className="flex items-center justify-center py-1">
                        <span
                            className="text-[10px] font-black uppercase tracking-[0.1em] px-4 py-1.5 rounded-2xl shadow-sm border border-white/20 transition-transform hover:scale-110 cursor-default"
                            style={{
                                backgroundColor: badgeColor,
                                color: isLightColor ? '#222' : '#fff'
                            }}
                        >
                            {getValue()}
                        </span>
                    </div>
                );
            },
            size: 130
        },
        {
            accessorKey: 'name',
            header: 'Tên chiến dịch',
            cell: ({ getValue, row }) => (
                <div className="flex flex-col py-1">
                    <span className="text-[15px] font-black text-gray-900 leading-tight tracking-tight">
                        {getValue()}
                    </span>
                    {row.original.description && (
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-1 h-1 rounded-full bg-blue-400" />
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter line-clamp-1">
                                {row.original.description}
                            </span>
                        </div>
                    )}
                </div>
            ),
            size: 280
        },
        {
            accessorKey: 'discount_value',
            header: 'Mức ưu đãi',
            cell: ({ getValue, row }) => {
                const value = getValue();
                const type = row.original.discount_type;
                return (
                    <div className="flex flex-col items-center py-1">
                        <span className="text-lg font-black text-orange-600 leading-none">
                            {type === 'percent' ? `${value}%` : formatCurrency(value)}
                        </span>
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">
                            GIẢM TRỰC TIẾP
                        </span>
                    </div>
                );
            },
            size: 130
        },
        {
            accessorKey: 'start_date',
            header: 'Bắt đầu',
            cell: ({ getValue }) => (
                <div className="flex flex-col py-1">
                    <span className="text-sm font-black text-gray-800">
                        {format(new Date(getValue()), 'dd/MM')}
                    </span>
                    <span className="text-[12px] text-gray-400 font-bold uppercase tracking-tighter">
                        {format(new Date(getValue()), 'HH:mm')}
                    </span>
                </div>
            ),
            size: 110
        },
        {
            accessorKey: 'end_date',
            header: 'Kết thúc',
            cell: ({ getValue }) => {
                const date = getValue();
                const isExpired = new Date(date) < new Date();
                return (
                    <div className="flex flex-col py-1">
                        <span className={`text-sm font-black ${isExpired ? 'text-red-500' : 'text-gray-800'}`}>
                            {format(new Date(date), 'dd/MM')}
                        </span>
                        <span className="text-[12px] text-gray-400 font-bold uppercase tracking-tighter">
                            {format(new Date(date), 'HH:mm')}
                        </span>
                    </div>
                );
            },
            size: 110
        },
        {
            accessorKey: 'status',
            header: 'Trình trạng',
            cell: ({ row }) => {
                const statusInfo = getStatusInfo(row.original);
                return (
                    <div className="flex justify-center">
                        <span className={`inline-block px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-md border border-white/20 ${statusInfo.className}`}>
                            {statusInfo.label}
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
                    <Tooltip content={row.original.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}>
                        <button
                            onClick={() => handleToggleStatus(row.original)}
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${row.original.status === 'active'
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-emerald-50'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-600 hover:text-white shadow-gray-50'
                                } shadow-lg`}
                        >
                            {row.original.status === 'active' ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </Tooltip>
                    <Tooltip content="Chỉnh sửa">
                        <button
                            onClick={() => {
                                setEditingFlashSale(row.original);
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
            size: 150
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
                        <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-100/50">
                            <Zap size={18} fill="currentColor" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Chiến dịch Giờ vàng</h1>
                    </div>
                    <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.15em] ml-0.5">Quản lý Flash Sale & Ưu đãi chớp nhoáng ({stats.total} chương trình)</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
                        onClick={fetchFlashSales}
                        className="flex items-center justify-center gap-2 h-10 !rounded-2xl text-gray-600 bg-gray-500 hover:bg-gray-600 font-black uppercase text-xs tracking-widest px-3 shadow-sm transition-all"
                    >
                        Làm mới
                    </Button>
                    <Button
                        startIcon={<PlusCircle size={20} />}
                        onClick={() => { setEditingFlashSale(null); setIsModalOpen(true); }}
                        className="flex items-center justify-center gap-2 h-10 !rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs tracking-widest px-6 shadow-md shadow-orange-100 transition-all"
                    >
                        Tạo Flash Sale
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5 px-0.5">
                {loading ? (
                    Array(4).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
                ) : (
                    <>
                        <div
                            onClick={() => setStatusFilter('all')}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'all' ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-blue-600' : 'z-10 bg-blue-500'}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <Zap size={70} className="md:w-[90px] md:h-[90px]" fill="currentColor" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <Zap size={14} className="md:w-[18px] md:h-[18px]" fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.total}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Tổng cộng</p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('running')}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'running' ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-emerald-600' : 'z-10 bg-emerald-500'}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <Clock size={70} className="md:w-[90px] md:h-[90px]" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <Clock size={14} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.running}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Đang chạy</p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('active')}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'active' ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-indigo-600' : 'z-10 bg-indigo-500'}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <CheckCircle size={70} className="md:w-[90px] md:h-[90px]" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <CheckCircle size={14} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.active}</p>
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Kích hoạt</p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('inactive')}
                            className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${statusFilter === 'inactive' ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-gray-600' : 'z-10 bg-gray-500'}`}>
                            <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                                <XCircle size={70} className="md:w-[90px] md:h-[90px]" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <XCircle size={14} className="md:w-[18px] md:h-[18px]" />
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
                <div className="flex-1 min-w-[300px]">
                    <div className="relative group">
                        <Input
                            placeholder="TÌM KIẾM CHIẾN DỊCH, NHÃN HOẶC MÔ TẢ..."
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
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredFlashSales.length} kết quả</span>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 min-h-[600px]">
                <DataTable
                    data={filteredFlashSales}
                    columns={columns}
                    loading={loading}
                    searchable={false}
                    pageSize={25}
                    emptyStateIcon={<Zap size={48} className="text-gray-600" />}
                    emptyStateTitle="Không có Flash Sale"
                    emptyStateDescription="Chưa có chương trình Flash Sale nào được tạo."
                />
            </div>

            {/* Modals */}
            <FlashSaleModal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingFlashSale(null);
                }}
                onSave={handleSave}
                flashSaleToEdit={editingFlashSale}
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
                            <span className="font-bold text-red-600 block uppercase tracking-tight">Xác nhận xóa chiến dịch</span>
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
                        Bạn có chắc chắn muốn xóa Flash Sale này không? Hành động này không thể hoàn tác.
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
