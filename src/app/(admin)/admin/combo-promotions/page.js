/**
 * Admin Combo Promotions Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/combo-promotions/page.js
 */
'use client';


import React, { useState, useEffect, useMemo } from 'react';
import {
    PlusCircle, Edit, Trash2, Search, Gift, X, Calendar, Eye, EyeOff,
    CheckCircle, XCircle, Clock, RefreshCw, AlertCircle
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
import ComboPromotionModal from '@/components/tailwindcss/ComboPromotionModal';

const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

export default function ComboPromotionsPageTailwind() {
    const [comboPromotions, setComboPromotions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive', 'running'
    const [deletingId, setDeletingId] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: '', title: '', type: 'info' });

    const fetchComboPromotions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/combo-promotions');
            const data = await res.json();
            if (data.success) setComboPromotions(data.comboPromotions || []);
        } catch (error) {
            console.error('Failed to fetch combo promotions:', error);
            showAlert('Không thể tải danh sách Combo Promotions', 'Lỗi', 'error');
        }
        setLoading(false);
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            if (data.success) setCategories(data.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products');
            const data = await res.json();
            if (data.success) setProducts(data.products || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    useEffect(() => {
        fetchComboPromotions();
        fetchCategories();
        fetchProducts();
    }, []);

    const showAlert = (message, title = 'Thông báo', type = 'info') => {
        setAlert({ open: true, message, title, type });
    };

    // Stats
    const stats = useMemo(() => {
        const now = new Date();
        return {
            total: comboPromotions.length,
            active: comboPromotions.filter(c => c.status === 'active').length,
            inactive: comboPromotions.filter(c => c.status !== 'active').length,
            running: comboPromotions.filter(c => {
                if (c.status !== 'active') return false;
                if (!c.start_date || !c.end_date) return false;
                const start = new Date(c.start_date);
                const end = new Date(c.end_date);
                return start <= now && end >= now;
            }).length
        };
    }, [comboPromotions]);

    // Filtered combo promotions
    const filteredComboPromotions = useMemo(() => {
        const now = new Date();
        return comboPromotions.filter(c => {
            const search = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                c.name?.toLowerCase().includes(search) ||
                c.description?.toLowerCase().includes(search);

            let matchesStatus = true;
            if (statusFilter === 'active') matchesStatus = c.status === 'active';
            else if (statusFilter === 'inactive') matchesStatus = c.status !== 'active';
            else if (statusFilter === 'running') {
                const start = c.start_date ? new Date(c.start_date) : null;
                const end = c.end_date ? new Date(c.end_date) : null;
                matchesStatus = c.status === 'active' && (!start || start <= now) && (!end || end >= now);
            }

            return matchesSearch && matchesStatus;
        });
    }, [comboPromotions, searchTerm, statusFilter]);

    const handleSave = async (data) => {
        const isEditMode = Boolean(data.id);
        const url = isEditMode ? `/api/admin/combo-promotions/${data.id}` : '/api/admin/combo-promotions';
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
                setEditingCombo(null);
                fetchComboPromotions();
                showAlert(result.message || 'Thành công!', 'Thành công', 'success');
            } else {
                showAlert(result.message || 'Có lỗi xảy ra! Vui lòng thử lại.', 'Lỗi', 'error');
            }
        } catch (error) {
            console.error('Error saving combo promotion:', error);
            showAlert('Có lỗi xảy ra! Vui lòng kiểm tra kết nối và thử lại.', 'Lỗi', 'error');
        }
    };

    const handleDelete = (id) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            const res = await fetch(`/api/admin/combo-promotions/${deletingId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchComboPromotions();
                showAlert('Xóa Combo Promotion thành công!', 'Thành công', 'success');
            } else {
                showAlert('Xóa thất bại!', 'Lỗi', 'error');
            }
        } catch (error) {
            showAlert('Xóa thất bại!', 'Lỗi', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleStatus = async (combo) => {
        const newStatus = combo.status === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch(`/api/admin/combo-promotions/${combo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchComboPromotions();
                showAlert(`Đã ${newStatus === 'active' ? 'bật' : 'tắt'} Combo Promotion`, 'Thành công', 'success');
            }
        } catch (error) {
            console.error('Toggle status failed:', error);
            showAlert('Không thể thay đổi trạng thái', 'Lỗi', 'error');
        }
    };

    const getConditionSummary = (conditions) => {
        if (!conditions || !conditions.rules) return 'N/A';
        const rules = conditions.rules;
        if (rules.length === 0) return 'N/A';
        const firstRule = rules[0];
        return `Mua ${firstRule.min_quantity || 'X'} món`;
    };

    const getRewardSummary = (rewards) => {
        if (!rewards || !rewards.products) return 'N/A';
        const products = rewards.products;
        if (products.length === 0) return 'N/A';
        const firstProduct = products[0];
        return `Tặng ${firstProduct.quantity_per_combo || 'X'} món`;
    };

    const getStatusInfo = (combo) => {
        const now = new Date();
        const start = combo.start_date ? new Date(combo.start_date) : null;
        const end = combo.end_date ? new Date(combo.end_date) : null;
        const isRunning = combo.status === 'active' && (!start || start <= now) && (!end || end >= now);
        const isExpired = end && end < now;

        if (isExpired) {
            return { label: 'Hết hạn', className: 'bg-red-600' };
        } else if (isRunning) {
            return { label: 'Đang chạy', className: 'bg-green-600' };
        } else if (combo.status === 'active') {
            return { label: 'Chờ chạy', className: 'bg-amber-500' };
        } else {
            return { label: 'Đã tắt', className: 'bg-gray-500' };
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Chiến dịch Combo',
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
            accessorKey: 'conditions',
            header: 'Điều kiện áp dụng',
            cell: ({ getValue }) => (
                <div className="py-1">
                    <span className="inline-block text-[10px] font-black text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-2xl uppercase tracking-wider shadow-sm">
                        {getConditionSummary(getValue())}
                    </span>
                </div>
            ),
            size: 160
        },
        {
            accessorKey: 'rewards',
            header: 'Ưu đãi nhận được',
            cell: ({ getValue }) => (
                <div className="py-1">
                    <span className="inline-block text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-2xl uppercase tracking-wider shadow-sm">
                        {getRewardSummary(getValue())}
                    </span>
                </div>
            ),
            size: 160
        },
        {
            accessorKey: 'min_order_value',
            header: 'Đơn tối thiểu',
            cell: ({ getValue }) => (
                <div className="flex flex-col py-1">
                    <span className="text-[15px] font-black text-red-600 leading-none">
                        {getValue() ? formatCurrency(getValue()) : '0đ'}
                    </span>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1.5">
                        GIÁ TRỊ GIỎ HÀNG
                    </span>
                </div>
            ),
            size: 140
        },
        {
            accessorKey: 'end_date',
            header: 'Hạn dùng',
            cell: ({ getValue }) => {
                if (!getValue()) return (
                    <div className="flex flex-col py-1">
                        <span className="text-sm font-black text-blue-600">Vô thời hạn</span>
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter mt-1">KHÔNG HẾT HẠN</span>
                    </div>
                );
                const isExpired = new Date(getValue()) < new Date();
                return (
                    <div className="flex flex-col py-1">
                        <span className={`text-sm font-black ${isExpired ? 'text-red-500' : 'text-gray-800'}`}>
                            {format(new Date(getValue()), 'dd/MM')}
                        </span>
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter mt-1">
                            NĂM {format(new Date(getValue()), 'yyyy')}
                        </span>
                    </div>
                );
            },
            size: 120
        },
        {
            accessorKey: 'status',
            header: 'Tình trạng',
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
                                setEditingCombo(row.original);
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
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100/50">
                            <Gift size={18} fill="currentColor" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Chiến dịch Combo</h1>
                    </div>
                    <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.15em] ml-0.5">Quản lý các chương trình ưu đãi Combo ({stats.total} chiến dịch)</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
                        onClick={fetchComboPromotions}
                        className="flex items-center justify-center gap-2 h-10 !rounded-2xl text-gray-600 bg-gray-500 hover:bg-gray-600 font-black uppercase text-xs tracking-widest px-3 shadow-sm transition-all"
                    >
                        Làm mới
                    </Button>
                    <Button
                        startIcon={<PlusCircle size={20} />}
                        onClick={() => { setEditingCombo(null); setIsModalOpen(true); }}
                        className="flex items-center justify-center gap-2 h-10 !rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs tracking-widest px-6 shadow-md shadow-orange-100 transition-all"
                    >
                        Thiết lập Combo
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
                                <Gift size={70} className="md:w-[90px] md:h-[90px]" fill="currentColor" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                                    <Gift size={14} className="md:w-[18px] md:h-[18px]" fill="currentColor" />
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
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Hoạt động</p>
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
                                    <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Tạm dừng</p>
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
                            placeholder="TÌM KIẾM CHIẾN DỊCH, MÔ TẢ COMBO..."
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
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredComboPromotions.length} kết quả</span>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 min-h-[600px]">
                <DataTable
                    data={filteredComboPromotions}
                    columns={columns}
                    loading={loading}
                    searchable={false}
                    pageSize={25}
                    emptyStateIcon={<Gift size={48} className="text-gray-600" />}
                    emptyStateTitle="Không có Combo"
                    emptyStateDescription="Chưa có chương trình Combo nào được tạo."
                />
            </div>

            {/* Modals */}
            <ComboPromotionModal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCombo(null);
                }}
                onSave={handleSave}
                comboToEdit={editingCombo}
                categories={categories}
                products={products}
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
                        Bạn có chắc chắn muốn xóa Combo Promotion này không? Hành động này không thể hoàn tác.
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
