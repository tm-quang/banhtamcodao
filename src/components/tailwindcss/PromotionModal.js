import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Ticket, Percent, Sparkles, Tag, Clock, CheckCircle, Loader2, Truck } from 'lucide-react';
import { format } from 'date-fns';

const formatDateForInput = (date) => {
    if (!date) return '';
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
};

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
        <div className="flex items-center justify-end gap-2 w-full px-1">
            <Button
                variant="outline"
                onClick={onClose}
                className="h-9 !rounded-xl px-5 font-bold text-[10px] shadow-sm uppercase tracking-widest"
            >
                Hủy bỏ
            </Button>
            <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className={`flex items-center justify-center gap-2 h-9 !rounded-xl px-7 font-black text-[10px] uppercase tracking-widest text-white shadow-md transition-all ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
            >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Kích hoạt ngay')}
            </Button>
        </div>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            size="xl"
            noPadding={true}
            title={
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEditMode ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}>
                        <Ticket size={22} className={isEditMode ? 'text-blue-600' : 'text-emerald-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-900 block">
                            {isEditMode ? 'Chỉnh sửa ưu đãi' : 'Tạo mã giảm giá'}
                        </span>
                        <p className="text-xs text-gray-600 font-medium">
                            {isEditMode ? `Đang cập nhật mã: ${promotionToEdit?.promo_code}` : 'Thiết lập chương trình khuyến mãi mới'}
                        </p>
                    </div>
                </div>
            }
            footer={footer}
        >
            <div className="space-y-6 md:space-y-8 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Column 1: Thông tin định danh & Thời gian */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Section: Thông tin định danh */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Tag size={18} className="text-blue-600" />
                                <span className="text-sm font-black uppercase text-gray-700">Thông tin định danh</span>
                            </div>
                            <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Mã khuyến mãi *</label>
                                    <Input
                                        name="promo_code"
                                        value={data.promo_code || ''}
                                        onChange={handleChange}
                                        placeholder="VD: BANHTAM50"
                                        className="bg-white font-bold text-blue-600 uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Tên chương trình *</label>
                                    <Input
                                        name="title"
                                        value={data.title || ''}
                                        onChange={handleChange}
                                        placeholder="VD: Giảm 50% đơn đầu tiên"
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Thời gian hiệu lực */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={18} className="text-amber-500" />
                                <span className="text-sm font-black uppercase text-gray-700">Thời gian hiệu lực</span>
                            </div>
                            <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Bắt đầu</label>
                                    <Input
                                        name="start_date"
                                        type="datetime-local"
                                        value={data.start_date || ''}
                                        onChange={handleChange}
                                        className="bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Kết thúc</label>
                                    <Input
                                        name="end_date"
                                        type="datetime-local"
                                        value={data.end_date || ''}
                                        onChange={handleChange}
                                        className="bg-white text-red-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Giá trị & Điều kiện */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Section: Giá trị ưu đãi */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={18} className="text-emerald-500" />
                                <span className="text-sm font-black uppercase text-gray-700">Giá trị & Điều kiện</span>
                            </div>
                            <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Hình thức ưu đãi</label>
                                    <select
                                        name="discount_type"
                                        value={data.discount_type || 'percent'}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    >
                                        <option value="percent">Giảm theo phần trăm (%)</option>
                                        <option value="fixed">Số tiền cố định (VNĐ)</option>
                                        <option value="free_shipping">Miễn phí vận chuyển</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Giá trị giảm *</label>
                                        <div className="relative">
                                            <Input
                                                name="discount_value"
                                                type="number"
                                                value={data.discount_value || ''}
                                                onChange={handleChange}
                                                placeholder={data.discount_type === 'percent' ? 'VD: 50' : 'VD: 50000'}
                                                className="bg-white font-bold text-emerald-600 pr-8"
                                            />
                                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                                                {data.discount_type === 'percent' ? <Percent size={14} /> : (data.discount_type === 'free_shipping' ? <Truck size={14} /> : <span className="text-[10px] font-black">VNĐ</span>)}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Đơn tối thiểu</label>
                                        <div className="relative">
                                            <Input
                                                name="min_order_value"
                                                type="number"
                                                value={data.min_order_value || ''}
                                                onChange={handleChange}
                                                placeholder="VD: 100000"
                                                className="bg-white pr-8"
                                            />
                                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                                                <span className="text-[10px] font-black">VNĐ</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Trạng thái mã</label>
                                    <select
                                        name="status"
                                        value={data.status || 'active'}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    >
                                        <option value="active">Đang kích hoạt</option>
                                        <option value="inactive">Đang tạm ngưng</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

