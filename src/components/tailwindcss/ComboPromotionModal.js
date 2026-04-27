import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Gift, Calendar, CheckCircle, Loader2, Plus, Trash2, Info, LayoutList, Trophy, Settings, AlertCircle, ChevronRight, ChevronLeft, Target, Sparkles, Clock, Layers, MousePointer2 } from 'lucide-react';
import { format } from 'date-fns';

const formatDateForInput = (date) => {
    if (!date) return '';
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
};

export default function ComboPromotionModal({ open, onClose, onSave, comboToEdit, categories = [], products = [] }) {
    const [data, setData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [conditionRules, setConditionRules] = useState([]);
    const [rewardProducts, setRewardProducts] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const isEditMode = Boolean(comboToEdit);

    useEffect(() => {
        if (open) {
            const initialState = {
                name: '',
                description: '',
                status: 'active',
                start_date: '',
                end_date: '',
                condition_type: 'quantity',
                condition_operator: 'AND',
                min_order_value: 0,
                priority: 0
            };

            if (comboToEdit) {
                const conditions = comboToEdit.conditions || {};
                const rewards = comboToEdit.rewards || {};

                setData({
                    ...comboToEdit,
                    start_date: formatDateForInput(comboToEdit.start_date),
                    end_date: formatDateForInput(comboToEdit.end_date),
                    condition_type: conditions.type || 'quantity',
                    condition_operator: conditions.operator || 'AND',
                    min_order_value: comboToEdit.min_order_value || 0,
                });

                setConditionRules(conditions.rules || []);
                setRewardProducts(rewards.products || []);
            } else {
                setData(initialState);
                setConditionRules([{
                    category_slug: '',
                    product_slug: '',
                    product_id: '',
                    min_quantity: 2,
                    apply_to_all: false
                }]);
                setRewardProducts([{
                    category_slug: '',
                    product_slug: '',
                    product_id: '',
                    quantity_per_combo: 1
                }]);
            }
        }
    }, [open, comboToEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
        }));
    };

    const addConditionRule = () => {
        setConditionRules(prev => [...prev, {
            category_slug: '',
            product_slug: '',
            product_id: '',
            min_quantity: 1,
            apply_to_all: false
        }]);
    };

    const removeConditionRule = (index) => {
        setConditionRules(prev => prev.filter((_, i) => i !== index));
    };

    const updateConditionRule = (index, field, value) => {
        setConditionRules(prev => prev.map((rule, i) =>
            i === index ? { ...rule, [field]: value } : rule
        ));
    };

    const addRewardProduct = () => {
        setRewardProducts(prev => [...prev, {
            category_slug: '',
            product_slug: '',
            product_id: '',
            quantity_per_combo: 1
        }]);
    };

    const removeRewardProduct = (index) => {
        setRewardProducts(prev => prev.filter((_, i) => i !== index));
    };

    const updateRewardProduct = (index, field, value) => {
        setRewardProducts(prev => prev.map((product, i) =>
            i === index ? { ...product, [field]: value } : product
        ));
    };

    const handleSave = async () => {
        if (!data.name) {
            alert('Vui lòng nhập tên combo');
            return;
        }

        setIsSubmitting(true);

        const conditions = {
            type: data.condition_type,
            operator: data.condition_operator,
            rules: conditionRules.map(rule => ({
                ...(rule.apply_to_all ? { apply_to_all: true } : {}),
                ...(rule.category_slug ? { category_slug: rule.category_slug } : {}),
                ...(rule.product_slug ? { product_slug: rule.product_slug } : {}),
                ...(rule.product_id ? { product_id: rule.product_id } : {}),
                ...(rule.min_quantity ? { min_quantity: parseInt(rule.min_quantity) || 1 } : {}),
            }))
        };

        const rewards = {
            type: 'free_product',
            products: rewardProducts.map(product => ({
                ...(product.category_slug ? { category_slug: product.category_slug } : {}),
                ...(product.product_slug ? { product_slug: product.product_slug } : {}),
                ...(product.product_id ? { product_id: product.product_id } : {}),
                quantity_per_combo: parseInt(product.quantity_per_combo) || 1,
            }))
        };

        const saveData = {
            ...data,
            conditions,
            rewards,
            min_order_value: parseInt(data.min_order_value) || 0,
            priority: parseInt(data.priority) || 0
        };

        await onSave(saveData);
        setIsSubmitting(false);
    };

    const tabs = [
        { id: 0, label: 'Thông tin chung', icon: Info },
        { id: 1, label: 'Điều kiện', icon: Target },
        { id: 2, label: 'Phần thưởng', icon: Trophy },
    ];

    const footer = (
        <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-2">
                {activeTab > 0 && (
                    <Button
                        onClick={() => setActiveTab(activeTab - 1)}
                        className="h-9 !rounded-xl px-3 font-bold text-[10px] uppercase text-gray-600 bg-gray-100 hover:bg-gray-200 whitespace-nowrap"
                        startIcon={<ChevronLeft size={14} />}
                    >
                        Quay lại
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="h-9 !rounded-xl px-3 font-bold text-[10px] shadow-sm uppercase whitespace-nowrap"
                >
                    Hủy bỏ
                </Button>
                {activeTab < tabs.length - 1 ? (
                    <Button
                        onClick={() => setActiveTab(activeTab + 1)}
                        className="flex items-center justify-center gap-1 h-9 !rounded-xl px-3 font-black text-[10px] uppercase text-white bg-slate-800 hover:bg-slate-900 shadow-md transition-all whitespace-nowrap"
                    >
                        Tiếp theo <ChevronRight size={14} />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-1.5 h-9 !rounded-xl px-4 font-black text-[10px] uppercase text-white shadow-md transition-all bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                    >
                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        {isSubmitting ? 'Đang xử lý...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo combo')}
                    </Button>
                )}
            </div>
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
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Sparkles size={22} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-900 block truncate">
                            {isEditMode ? 'Chỉnh sửa Combo' : 'Tạo Combo mới'}
                        </span>
                        <p className="text-xs text-gray-600 font-medium truncate">
                            {isEditMode ? `Đang cập nhật: ${comboToEdit?.name}` : 'Thiết lập chương trình ưu đãi'}
                        </p>
                    </div>
                </div>
            }
            footer={footer}
        >
            <div className="space-y-6 min-h-[90vh] overflow-y-auto px-1 custom-scrollbar">

                {/* Tabs Navigation */}
                <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Icon size={14} className={isActive ? '' : 'opacity-70'} />
                                <span className={`text-[10px] md:text-[11px] uppercase tracking-wide ${isActive ? 'font-black' : 'font-bold'}`}>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="min-h-[350px]">
                    {/* Tab 0: General Info */}
                    {activeTab === 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                            {/* Column 1 */}
                            <div className="space-y-4 md:space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info size={18} className="text-blue-600" />
                                        <span className="text-sm font-black uppercase text-gray-700">Thông tin chương trình</span>
                                    </div>
                                    <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Tên combo *</label>
                                            <Input
                                                name="name"
                                                value={data.name || ''}
                                                onChange={handleChange}
                                                placeholder="VD: Combo Buffet 299k tặng Coca"
                                                required
                                                className="bg-white font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Mô tả quyền lợi</label>
                                            <textarea
                                                name="description"
                                                value={data.description || ''}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                                                placeholder="Khách hàng sẽ nhìn thấy mô tả này..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-4 md:space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={18} className="text-emerald-500" />
                                        <span className="text-sm font-black uppercase text-gray-700">Thời gian & Hiệu lực</span>
                                    </div>
                                    <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Bắt đầu *</label>
                                                <Input
                                                    name="start_date"
                                                    type="datetime-local"
                                                    value={data.start_date || ''}
                                                    onChange={handleChange}
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
                                                    className="bg-white text-red-600"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Trạng thái</label>
                                            <select
                                                name="status"
                                                value={data.status || 'active'}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                            >
                                                <option value="active">Đang hoạt động</option>
                                                <option value="inactive">Tạm dừng</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Settings size={18} className="text-indigo-500" />
                                        <span className="text-sm font-black uppercase text-gray-700">Cấu hình nâng cao</span>
                                    </div>
                                    <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Độ ưu tiên</label>
                                                <Input
                                                    name="priority"
                                                    type="number"
                                                    value={data.priority || 0}
                                                    onChange={handleChange}
                                                    min={0}
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Đơn tối thiểu (VNĐ)</label>
                                                <Input
                                                    name="min_order_value"
                                                    type="number"
                                                    value={data.min_order_value || 0}
                                                    onChange={handleChange}
                                                    min={0}
                                                    className="bg-white font-bold text-blue-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 1: Conditions */}
                    {activeTab === 1 && (
                        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target size={18} className="text-amber-500" />
                                        <span className="text-sm font-black uppercase text-gray-700">Điều kiện áp dụng</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Kiểu kích hoạt</label>
                                            <select
                                                value={data.condition_type || 'quantity'}
                                                onChange={(e) => setData({ ...data, condition_type: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-amber-500 outline-none"
                                            >
                                                <option value="quantity">Số lượng</option>
                                                <option value="products">Sản phẩm</option>
                                                <option value="category">Danh mục</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Logic kiểm tra</label>
                                            <select
                                                value={data.condition_operator || 'AND'}
                                                onChange={(e) => setData({ ...data, condition_operator: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-amber-500 outline-none"
                                            >
                                                <option value="AND">Và (Tất cả)</option>
                                                <option value="OR">Hoặc (Bất kỳ)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 lg:col-span-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Layers size={18} className="text-amber-500" />
                                            <span className="text-sm font-black uppercase text-gray-700">Danh sách quy tắc</span>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase">{conditionRules.length} Quy tắc</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {conditionRules.map((rule, index) => (
                                            <div key={index} className="p-3 bg-gray-50 rounded-2xl border border-gray-300 relative group">
                                                <button
                                                    onClick={() => removeConditionRule(index)}
                                                    className="absolute top-2 right-2 w-7 h-7 bg-white border border-red-100 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                                <div className="space-y-3 mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`all-${index}`}
                                                            checked={rule.apply_to_all || false}
                                                            onChange={(e) => updateConditionRule(index, 'apply_to_all', e.target.checked)}
                                                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                                                        />
                                                        <label htmlFor={`all-${index}`} className="text-[11px] font-bold text-gray-700 cursor-pointer">Áp dụng cho toàn bộ Menu</label>
                                                    </div>

                                                    {!rule.apply_to_all && (
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Danh mục</label>
                                                                <select
                                                                    value={rule.category_slug || ''}
                                                                    onChange={(e) => updateConditionRule(index, 'category_slug', e.target.value)}
                                                                    className="w-full rounded-xl border border-gray-200 p-2 text-sm bg-white focus:border-amber-500 outline-none"
                                                                >
                                                                    <option value="">-- Mọi danh mục --</option>
                                                                    {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Sản phẩm</label>
                                                                <select
                                                                    value={rule.product_slug || rule.product_id || ''}
                                                                    onChange={(e) => {
                                                                        const p = products.find(prod => prod.slug === e.target.value || prod.id === e.target.value);
                                                                        if (p) { updateConditionRule(index, 'product_slug', p.slug); updateConditionRule(index, 'product_id', p.id); }
                                                                        else { updateConditionRule(index, 'product_slug', ''); updateConditionRule(index, 'product_id', ''); }
                                                                    }}
                                                                    className="w-full rounded-xl border border-gray-200 p-2 text-sm bg-white focus:border-amber-500 outline-none"
                                                                >
                                                                    <option value="">-- Món bất kỳ --</option>
                                                                    {products.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Số lượng cần mua</label>
                                                        <Input
                                                            type="number"
                                                            value={rule.min_quantity || ''}
                                                            onChange={(e) => updateConditionRule(index, 'min_quantity', e.target.value)}
                                                            min={1}
                                                            className="bg-white font-bold text-amber-600"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addConditionRule}
                                        className="w-full mt-3 h-10 border-dashed border-2 text-amber-600 border-amber-200 hover:bg-amber-50 uppercase font-black text-[10px]"
                                        startIcon={<Plus size={16} />}
                                    >
                                        Thêm quy tắc mới
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Rewards */}
                    {activeTab === 2 && (
                        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Gift size={18} className="text-emerald-500" />
                                        <span className="text-sm font-black uppercase text-gray-700">Phần thưởng quà tặng</span>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase">{rewardProducts.length} Quà</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {rewardProducts.map((product, index) => (
                                        <div key={index} className="p-3 bg-gray-50 rounded-2xl border border-gray-300 relative group">
                                            <button
                                                onClick={() => removeRewardProduct(index)}
                                                className="absolute top-2 right-2 w-7 h-7 bg-white border border-red-100 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                                            >
                                                <Trash2 size={14} />
                                            </button>

                                            <div className="space-y-3 mt-1">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Danh mục quà</label>
                                                    <select
                                                        value={product.category_slug || ''}
                                                        onChange={(e) => updateRewardProduct(index, 'category_slug', e.target.value)}
                                                        className="w-full rounded-xl border border-gray-200 p-2 text-sm bg-white focus:border-emerald-500 outline-none"
                                                    >
                                                        <option value="">-- Mọi danh mục --</option>
                                                        {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Sản phẩm tặng</label>
                                                    <select
                                                        value={product.product_slug || product.product_id || ''}
                                                        onChange={(e) => {
                                                            const p = products.find(prod => prod.slug === e.target.value || prod.id === e.target.value);
                                                            if (p) { updateRewardProduct(index, 'product_slug', p.slug); updateRewardProduct(index, 'product_id', p.id); }
                                                            else { updateRewardProduct(index, 'product_slug', ''); updateRewardProduct(index, 'product_id', ''); }
                                                        }}
                                                        className="w-full rounded-xl border border-gray-200 p-2 text-sm bg-white focus:border-emerald-500 outline-none"
                                                    >
                                                        <option value="">-- Chọn món tặng --</option>
                                                        {products.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">SL quà tặng</label>
                                                    <Input
                                                        type="number"
                                                        value={product.quantity_per_combo || ''}
                                                        onChange={(e) => updateRewardProduct(index, 'quantity_per_combo', e.target.value)}
                                                        min={1}
                                                        className="bg-white font-bold text-emerald-600"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addRewardProduct}
                                    className="w-full mt-3 h-10 border-dashed border-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 uppercase font-black text-[10px]"
                                    startIcon={<Plus size={16} />}
                                >
                                    Thêm phần thưởng mới
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
}
