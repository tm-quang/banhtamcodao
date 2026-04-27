import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Zap, Percent, CheckCircle, Image, Link as LinkIcon, Palette, Loader2, Sparkles, Clock, LayoutGrid, Rocket, Hash } from 'lucide-react';
import { format } from 'date-fns';

const formatDateForInput = (date) => {
    if (!date) return '';
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
};

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
                className={`flex items-center justify-center gap-2 h-9 !rounded-xl px-7 font-black text-[10px] uppercase tracking-widest text-white shadow-md transition-all ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-100'}`}
            >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Kích hoạt ngay')}
            </Button>
        </div>
    );

    const isLightColor = ['#FFD93D', '#4ECDC4', '#1ABC9C'].includes(data.badge_color);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            size="xl"
            noPadding={true}
            title={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Zap size={22} className="text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-900 block">
                            {isEditMode ? 'Chỉnh sửa Flash Sale' : 'Tạo Flash Sale mới'}
                        </span>
                        <p className="text-xs text-gray-600 font-medium">
                            {isEditMode ? `Đang cập nhật: ${flashSaleToEdit?.name}` : 'Thiết lập chiến dịch giờ vàng'}
                        </p>
                    </div>
                </div>
            }
            footer={footer}
        >
            <div className="space-y-6 md:space-y-8 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Column 1 */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Section: Thông tin chiến dịch */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Rocket size={18} className="text-orange-500" />
                                <span className="text-sm font-black uppercase text-gray-700">Thông tin chiến dịch</span>
                            </div>
                            <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Tên chương trình *</label>
                                    <Input
                                        name="name"
                                        value={data.name || ''}
                                        onChange={handleChange}
                                        placeholder="VD: Flash Sale Giờ Vàng"
                                        required
                                        className="bg-white font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Mô tả chi tiết</label>
                                    <textarea
                                        name="description"
                                        value={data.description || ''}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                                        placeholder="Khách hàng sẽ nhìn thấy nội dung này..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Độ ưu tiên hiển thị</label>
                                    <Input
                                        name="priority"
                                        type="number"
                                        value={data.priority || 0}
                                        onChange={handleChange}
                                        className="bg-white text-orange-600"
                                        startIcon={<Hash size={14} className="text-gray-400" />}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Hình ảnh & Điều hướng */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <LayoutGrid size={18} className="text-blue-500" />
                                <span className="text-sm font-black uppercase text-gray-700">Hình ảnh & Điều hướng</span>
                            </div>
                            <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">URL Banner Quảng bá</label>
                                    <Input
                                        name="image_url"
                                        value={data.image_url || ''}
                                        onChange={handleChange}
                                        placeholder="/images/hero-dish_4.png"
                                        className="bg-white"
                                        startIcon={<Image size={14} className="text-blue-500" />}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Đường dẫn đích</label>
                                    <Input
                                        name="link_url"
                                        value={data.link_url || '/menu'}
                                        onChange={handleChange}
                                        placeholder="/menu"
                                        className="bg-white"
                                        startIcon={<LinkIcon size={14} className="text-blue-500" />}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Section: Cấu hình mức giảm */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={18} className="text-emerald-500" />
                                <span className="text-sm font-black uppercase text-gray-700">Cấu hình mức giảm</span>
                            </div>
                            <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Hình thức khuyến mãi</label>
                                    <select
                                        name="discount_type"
                                        value={data.discount_type || 'percent'}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    >
                                        <option value="percent">Giảm theo phần trăm (%)</option>
                                        <option value="fixed">Giảm số tiền cố định (VNĐ)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Giá trị ưu đãi *</label>
                                    <div className="relative">
                                        <Input
                                            name="discount_value"
                                            type="number"
                                            value={data.discount_value || ''}
                                            onChange={handleChange}
                                            placeholder={data.discount_type === 'percent' ? 'VD: 30' : 'VD: 50000'}
                                            required
                                            className="bg-white font-bold text-emerald-600 pr-10 text-lg"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-black">
                                            {data.discount_type === 'percent' ? '%' : 'VNĐ'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Thời gian chạy */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={18} className="text-red-500" />
                                <span className="text-sm font-black uppercase text-gray-700">Thời gian chạy</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Bắt đầu *</label>
                                    <Input
                                        name="start_date"
                                        type="datetime-local"
                                        value={data.start_date || ''}
                                        onChange={handleChange}
                                        required
                                        className="bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Kết thúc *</label>
                                    <Input
                                        name="end_date"
                                        type="datetime-local"
                                        value={data.end_date || ''}
                                        onChange={handleChange}
                                        required
                                        className="bg-white text-red-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Giao diện & Trạng thái */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Palette size={18} className="text-purple-500" />
                                <span className="text-sm font-black uppercase text-gray-700">Giao diện & Trạng thái</span>
                            </div>
                            <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Nhãn (Badge)</label>
                                        <Input
                                            name="badge_text"
                                            value={data.badge_text || 'FLASH'}
                                            onChange={handleChange}
                                            placeholder="VD: -50%"
                                            className="bg-white font-bold uppercase"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Trạng thái</label>
                                        <select
                                            name="status"
                                            value={data.status || 'active'}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                        >
                                            <option value="active">Đang kích hoạt</option>
                                            <option value="inactive">Đang tạm tắt</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Màu sắc chủ đạo</label>
                                    <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl border border-gray-200">
                                        {colorPresets.map(({ color, name }) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setData({ ...data, badge_color: color })}
                                                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-125 shadow-sm ${data.badge_color === color ? 'border-white ring-2 ring-purple-400 scale-110 shadow-md' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                                title={name}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Preview mini */}
                                <div className="mt-2 p-4 rounded-xl border border-dashed border-gray-300 bg-white flex items-center justify-center gap-4 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-50" />
                                    <div className="relative z-10">
                                        <span
                                            className="px-4 py-1.5 rounded-xl font-black text-[11px] shadow-sm uppercase tracking-wider block border border-white/50"
                                            style={{
                                                backgroundColor: data.badge_color || '#FFD93D',
                                                color: isLightColor ? '#222' : '#fff',
                                            }}
                                        >
                                            {data.badge_text || 'FLASH'}
                                        </span>
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm truncate relative z-10 max-w-[150px]">{data.name || 'Tên chiến dịch'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
