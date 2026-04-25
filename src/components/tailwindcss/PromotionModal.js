/**
 * PromotionModal component với Tailwind CSS - Premium Edition
 */
'use client';
import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Ticket, X, Percent, DollarSign, Calendar, CheckCircle, Loader2, Sparkles, ShieldCheck, Tag, Zap, Clock, TrendingDown, Truck } from 'lucide-react';
import { format } from 'date-fns';

const formatDateForInput = (date) => {
    if (!date) return '';
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
};

const SectionHeader = ({ icon: Icon, title, color = '#2563eb', subtitle }) => (
    <div className="flex flex-col gap-1 mb-5 mt-8 first:mt-2">
        <div className="flex items-center gap-3">
            <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm transition-transform hover:scale-110 duration-300"
                style={{
                    backgroundColor: `${color}15`,
                    border: `1px solid ${color}30`,
                    boxShadow: `0 4px 12px ${color}10`
                }}
            >
                <Icon size={20} style={{ color }} />
            </div>
            <div>
                <span className="text-[13px] font-black text-gray-800 uppercase tracking-wider block">{title}</span>
                {subtitle && <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">{subtitle}</p>}
            </div>
        </div>
    </div>
);

export default function PromotionModal({ open, onClose, onSave, promotionToEdit }) {
    const [data, setData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = Boolean(promotionToEdit);

    useEffect(() => {
        if (open) {
            const initialState = {
                promo_code: '',
                title: '',
                discount_type: 'percent',
                discount_value: '',
                min_order_value: '',
                start_date: '',
                end_date: '',
                status: 'active'
            };
            const editState = promotionToEdit ? {
                ...promotionToEdit,
                start_date: formatDateForInput(promotionToEdit.start_date),
                end_date: formatDateForInput(promotionToEdit.end_date),
            } : {};
            setData(isEditMode ? editState : initialState);
        }
    }, [open, promotionToEdit, isEditMode]);

    const handleChange = (e) => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        setIsSubmitting(true);
        await onSave(data);
        setIsSubmitting(false);
    };

    const footer = (
        <div className="flex items-center justify-end gap-3 w-full">
            <Button
                onClick={onClose}
                className="flex items-center justify-center h-10 !rounded-2xl border border-gray-300 text-gray-400 hover:text-gray-600 bg-white font-black uppercase text-[11px] tracking-widest px-6 transition-all"
            >
                Hủy bỏ
            </Button>
            <Button
                onClick={handleSave}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                className={`flex items-center justify-center h-10 !rounded-2xl shadow-xl transition-all font-black uppercase text-[11px] tracking-widest px-8 text-white ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
            >
                {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật ngay' : 'Kích hoạt ngay')}
            </Button>
        </div>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            size="xl"
            title={
                <div className="flex items-center gap-4 py-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg rotate-3 transition-transform hover:rotate-0 ${isEditMode ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200/50' : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200/50'}`}>
                        <Ticket size={24} className="text-white" fill="currentColor" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-black text-gray-900 text-2xl tracking-tight block">
                            {isEditMode ? 'Chỉnh sửa ưu đãi' : 'Tạo mã giảm giá'}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isEditMode ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                            <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                {isEditMode ? `ĐANG CẬP NHẬT MÃ: ${promotionToEdit?.promo_code}` : 'THIẾT LẬP CHƯƠNG TRÌNH KHUYẾN MÃI MỚI'}
                            </p>
                        </div>
                    </div>
                </div>
            }
            footer={footer}
        >
            <div className="space-y-10 pb-4">
                {/* Section 1: Thông tin cơ bản */}
                <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <SectionHeader icon={Tag} title="Thông tin định danh" subtitle="Mã nhận diện và tên chương trình" color="#2563eb" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <Input
                            label="Mã khuyến mãi"
                            name="promo_code"
                            value={data.promo_code || ''}
                            onChange={handleChange}
                            placeholder="VD: BANHTAM50"
                            required
                            className="!rounded-2xl border-gray-300 focus:border-blue-500 font-black text-blue-600 uppercase bg-gray-50/30 py-4 shadow-inner"
                        />
                        <Input
                            label="Tên chương trình"
                            name="title"
                            value={data.title || ''}
                            onChange={handleChange}
                            placeholder="VD: Giảm 50% đơn đầu tiên"
                            required
                            className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner"
                        />
                    </div>
                </div>

                {/* Section 2: Giá trị giảm & Điều kiện */}
                <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <SectionHeader icon={Sparkles} title="Giá trị & Điều kiện" subtitle="Mức giảm và ngưỡng áp dụng" color="#10b981" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div>
                            <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em] mb-3 ml-1">Hình thức ưu đãi</label>
                            <div className="relative group/select">
                                <select
                                    name="discount_type"
                                    value={data.discount_type || 'percent'}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                >
                                    <option value="percent">Giảm theo phần trăm (%)</option>
                                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                                    <option value="free_shipping">Miễn phí vận chuyển</option>
                                </select>
                            </div>
                        </div>
                        <div className="relative group/input">
                            <Input
                                label="Giá trị ưu đãi"
                                name="discount_value"
                                type="number"
                                value={data.discount_value || ''}
                                onChange={handleChange}
                                placeholder={data.discount_type === 'percent' ? 'VD: 50' : 'VD: 50000'}
                                required
                                className="!rounded-2xl border-gray-300 font-black text-emerald-600 bg-gray-50/30 text-2xl py-4 shadow-inner pr-12"
                            />
                            <div className="absolute bottom-5 right-4 opacity-40 group-focus-within/input:opacity-100 transition-opacity text-emerald-500">
                                {data.discount_type === 'percent' ? <Percent size={20} /> : (data.discount_type === 'free_shipping' ? <Truck size={20} /> : <span className="font-black">₫</span>)}
                            </div>
                        </div>
                        <Input
                            label="Đơn hàng tối thiểu"
                            name="min_order_value"
                            type="number"
                            value={data.min_order_value || ''}
                            onChange={handleChange}
                            placeholder="VD: 100000"
                            className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner"
                            suffix={<span className="text-[10px] font-black text-gray-300 uppercase mr-3">VNĐ</span>}
                        />
                        <div>
                            <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] mb-3 ml-1">Trạng thái mã</label>
                            <div className="relative group/select">
                                <select
                                    name="status"
                                    value={data.status || 'active'}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                >
                                    <option value="active">Đang kích hoạt</option>
                                    <option value="inactive">Đang tạm ngưng</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Thời gian áp dụng */}
                <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <SectionHeader icon={Clock} title="Thời gian hiệu lực" subtitle="Lịch trình triển khai ưu đãi" color="#f59e0b" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <Input
                            label="Ngày bắt đầu hiệu lực"
                            name="start_date"
                            type="datetime-local"
                            value={data.start_date || ''}
                            onChange={handleChange}
                            className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner"
                        />
                        <Input
                            label="Ngày kết thúc ưu đãi"
                            name="end_date"
                            type="datetime-local"
                            value={data.end_date || ''}
                            onChange={handleChange}
                            className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner text-red-600"
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

