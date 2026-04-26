/**
 * FlashSaleModal component với Tailwind CSS - Premium Edition
 */
'use client';
import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Zap, X, Percent, DollarSign, Calendar, CheckCircle, Image, Link as LinkIcon, Palette, Loader2, Sparkles, Clock, LayoutGrid, Rocket } from 'lucide-react';
import { format } from 'date-fns';

const formatDateForInput = (date) => {
    if (!date) return '';
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
};

const SectionHeader = ({ icon: Icon, title, color = '#f59e0b', subtitle }) => (
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

const colorPresets = [
    { color: '#FFD93D', name: 'Vàng Gold' },
    { color: '#FF6B6B', name: 'Đỏ Coral' },
    { color: '#4ECDC4', name: 'Xanh Mint' },
    { color: '#9B59B6', name: 'Tím Purple' },
    { color: '#3498DB', name: 'Xanh Blue' },
    { color: '#E67E22', name: 'Cam Orange' },
    { color: '#1ABC9C', name: 'Xanh Emerald' },
    { color: '#E91E63', name: 'Hồng Pink' },
    { color: '#FF0000', name: 'Đỏ Đậm' },
    { color: '#000000', name: 'Đen' },
];

export default function FlashSaleModal({ open, onClose, onSave, flashSaleToEdit }) {
    const [data, setData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = Boolean(flashSaleToEdit);

    useEffect(() => {
        if (open) {
            const initialState = {
                name: '',
                description: '',
                badge_text: 'FLASH',
                badge_color: '#FFD93D',
                discount_value: '',
                discount_type: 'percent',
                image_url: '',
                link_url: '/menu',
                start_date: '',
                end_date: '',
                priority: 0,
                status: 'active'
            };
            const editState = flashSaleToEdit ? {
                ...flashSaleToEdit,
                start_date: formatDateForInput(flashSaleToEdit.start_date),
                end_date: formatDateForInput(flashSaleToEdit.end_date),
            } : {};
            setData(isEditMode ? editState : initialState);
        }
    }, [open, flashSaleToEdit, isEditMode]);

    const handleChange = (e) => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        setIsSubmitting(true);
        await onSave(data);
        setIsSubmitting(false);
    };

    const footer = (
        <div className="flex items-center justify-end gap-3 w-full">
            <Button
                variant="outline"
                onClick={onClose}
                className="flex items-center justify-center h-10 !rounded-2xl font-black uppercase text-[11px] tracking-widest px-6 transition-all"
            >
                Hủy bỏ
            </Button>
            <Button
                onClick={handleSave}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                className={`flex items-center justify-center h-10 !rounded-2xl shadow-xl transition-all font-black uppercase text-[11px] tracking-widest px-8 text-white ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-100'}`}
            >
                {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật ngay' : 'Kích hoạt ngay')}
            </Button>
        </div>
    );

    const isLightColor = ['#FFD93D', '#4ECDC4', '#1ABC9C'].includes(data.badge_color);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            size="xl"
            title={
                <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-200/50 rotate-3 transition-transform hover:rotate-0">
                        <Zap size={24} className="text-white" fill="currentColor" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-black text-gray-900 text-2xl tracking-tight block">
                            {isEditMode ? 'Chỉnh sửa Flash Sale' : 'Tạo Flash Sale mới'}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                {isEditMode ? `ĐANG CẬP NHẬT: ${flashSaleToEdit?.name}` : 'THIẾT LẬP CHIẾN DỊCH GIỜ VÀNG'}
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
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <SectionHeader icon={Rocket} title="Thông tin chiến dịch" subtitle="Tên gọi và độ ưu tiên hiển thị" color="#f59e0b" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <div className="md:col-span-2">
                            <Input
                                label="Tên chương trình"
                                name="name"
                                value={data.name || ''}
                                onChange={handleChange}
                                placeholder="VD: Flash Sale Giờ Vàng"
                                required
                                className="!rounded-2xl border-gray-300 focus:border-orange-500 font-black text-lg bg-gray-50/30 py-4 shadow-inner"
                            />
                        </div>
                        <Input
                            label="Độ ưu tiên"
                            name="priority"
                            type="number"
                            value={data.priority || 0}
                            onChange={handleChange}
                            className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner text-orange-600"
                        />
                        <div className="md:col-span-3">
                            <label className="block text-[10px] font-black text-orange-600 uppercase tracking-[0.15em] mb-3 ml-1">Mô tả chi tiết chương trình</label>
                            <textarea
                                name="description"
                                value={data.description || ''}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl text-md font-bold text-gray-600 focus:ring-4 focus:ring-orange-50/50 focus:border-orange-500 transition-all outline-none resize-none shadow-inner"
                                placeholder="Khách hàng sẽ nhìn thấy nội dung này khi bấm vào banner..."
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Giao diện & Trạng thái */}
                <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <SectionHeader icon={Palette} title="Giao diện & Trạng thái" subtitle="Cấu hình badge và màu sắc" color="#9b59b6" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <Input
                            label="Nội dung Nhãn (Badge)"
                            name="badge_text"
                            value={data.badge_text || 'FLASH'}
                            onChange={handleChange}
                            placeholder="VD: -50%"
                            className="!rounded-2xl border-gray-300 font-black uppercase text-center bg-gray-50/30 py-4 shadow-inner"
                        />
                        <div>
                            <label className="block text-[10px] font-black text-purple-600 uppercase tracking-[0.15em] mb-3 ml-1">Bảng màu chủ đạo</label>
                            <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 rounded-2xl border border-gray-300 shadow-inner">
                                {colorPresets.map(({ color, name }) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setData({ ...data, badge_color: color })}
                                        className={`w-8 h-8 rounded-full border-4 transition-all hover:scale-125 shadow-sm ${data.badge_color === color ? 'border-white ring-2 ring-purple-400 scale-110 shadow-lg' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                        title={name}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-purple-600 uppercase tracking-[0.15em] mb-3 ml-1">Trạng thái chiến dịch</label>
                            <div className="relative group/select">
                                <select
                                    name="status"
                                    value={data.status || 'active'}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-purple-50/50 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                >
                                    <option value="active">Đang kích hoạt</option>
                                    <option value="inactive">Đang tạm tắt</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Preview Box */}
                    <div className="mt-8 p-6 rounded-[32px] border-2 border-dashed border-gray-200 bg-gray-50/50 shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-purple-500/5 opacity-50" />
                        <span className="relative z-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-5 text-center">Xem trước giao diện thực tế</span>
                        <div className="relative z-10 flex items-center justify-center gap-8">
                            <div className="relative group/badge cursor-default">
                                <div
                                    className="absolute inset-0 blur-md opacity-40 group-hover:opacity-60 transition-opacity rounded-2xl"
                                    style={{ backgroundColor: data.badge_color || '#FFD93D' }}
                                />
                                <span
                                    className="relative z-10 px-6 py-2.5 rounded-2xl font-black text-[13px] shadow-xl uppercase tracking-[0.1em] transition-all block border border-white/30"
                                    style={{
                                        backgroundColor: data.badge_color || '#FFD93D',
                                        color: isLightColor ? '#222' : '#fff',
                                        transform: 'rotate(-2deg)'
                                    }}
                                >
                                    {data.badge_text || 'FLASH'}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-gray-200" />
                            <span className="font-black text-gray-900 text-lg tracking-tight">{data.name || 'Tên chiến dịch Flash Sale'}</span>
                        </div>
                    </div>
                </div>

                {/* Section 3: Giá trị giảm giá */}
                <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <SectionHeader icon={Sparkles} title="Cấu hình mức giảm" subtitle="Giá trị ưu đãi áp dụng trực tiếp" color="#10b981" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div>
                            <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em] mb-3 ml-1">Hình thức khuyến mãi</label>
                            <div className="relative group/select">
                                <select
                                    name="discount_type"
                                    value={data.discount_type || 'percent'}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                >
                                    <option value="percent">Giảm theo phần trăm (%)</option>
                                    <option value="fixed">Giảm số tiền cố định (VNĐ)</option>
                                </select>
                            </div>
                        </div>
                        <Input
                            label="Giá trị ưu đãi"
                            name="discount_value"
                            type="number"
                            value={data.discount_value || ''}
                            onChange={handleChange}
                            placeholder={data.discount_type === 'percent' ? 'VD: 30' : 'VD: 50000'}
                            required
                            className="!rounded-2xl border-gray-300 font-black text-emerald-600 bg-gray-50/30 text-2xl py-4 shadow-inner"
                            suffix={<span className="text-xs font-black text-gray-300 uppercase mr-3">{data.discount_type === 'percent' ? '%' : 'VNĐ'}</span>}
                        />
                    </div>
                </div>

                {/* Section 4: Hình ảnh & Liên kết */}
                <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <SectionHeader icon={LayoutGrid} title="Hình ảnh & Điều hướng" subtitle="Thiết kế banner và liên kết đích" color="#3498db" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <Input
                            label="URL Banner Quảng bá"
                            name="image_url"
                            value={data.image_url || ''}
                            onChange={handleChange}
                            placeholder="/images/hero-dish_4.png"
                            className="!rounded-2xl border-gray-300 font-bold bg-gray-50/30 py-4 shadow-inner"
                            startIcon={<Image size={18} className="text-blue-500" />}
                        />
                        <Input
                            label="Đường dẫn điều hướng"
                            name="link_url"
                            value={data.link_url || '/menu'}
                            onChange={handleChange}
                            placeholder="/menu"
                            className="!rounded-2xl border-gray-300 font-bold bg-gray-50/30 py-4 shadow-inner"
                            startIcon={<LinkIcon size={18} className="text-blue-500" />}
                        />
                    </div>
                </div>

                {/* Section 5: Thời gian áp dụng */}
                <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <SectionHeader icon={Clock} title="Thời gian chạy" subtitle="Thiết lập khung giờ vàng" color="#e74c3c" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <Input
                            label="Thời điểm mở khuyến mãi"
                            name="start_date"
                            type="datetime-local"
                            value={data.start_date || ''}
                            onChange={handleChange}
                            required
                            className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner"
                        />
                        <Input
                            label="Thời điểm kết thúc"
                            name="end_date"
                            type="datetime-local"
                            value={data.end_date || ''}
                            onChange={handleChange}
                            required
                            className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner text-red-600"
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

