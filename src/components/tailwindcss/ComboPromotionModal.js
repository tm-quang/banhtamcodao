/**
 * ComboPromotionModal component với Tailwind CSS - Premium Edition
 */
'use client';
import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Gift, X, Calendar, CheckCircle, Loader2, Plus, Trash2, Info, LayoutList, Trophy, Settings, AlertCircle, ChevronRight, ChevronLeft, Target, Sparkles, Clock, Layers, MousePointer2 } from 'lucide-react';
import { format } from 'date-fns';

const formatDateForInput = (date) => {
    if (!date) return '';
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
};

const SectionHeader = ({ icon: Icon, title, color = '#2563eb', subtitle }) => (
    <div className="flex flex-col gap-1 mb-5 mt-8 first:mt-2">
        <div className="flex items-center gap-3">
            <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-transform hover:scale-110 duration-300"
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
        { id: 0, label: 'Thông tin chung', icon: Info, color: 'blue' },
        { id: 1, label: 'Điều kiện áp dụng', icon: Target, color: 'amber' },
        { id: 2, label: 'Phần thưởng', icon: Trophy, color: 'emerald' },
    ];

    const footer = (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
                {activeTab > 0 && (
                    <Button
                        onClick={() => setActiveTab(activeTab - 1)}
                        className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 text-gray-500 hover:text-gray-900 bg-white font-black uppercase text-[11px] tracking-widest px-4 transition-all"
                        startIcon={<ChevronLeft size={18} />}
                    >
                        Quay lại
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-3">
                <Button
                    onClick={onClose}
                    className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 text-gray-400 hover:text-gray-600 bg-white font-black uppercase text-[11px] tracking-widest px-6 transition-all"
                >
                    Hủy bỏ
                </Button>
                {activeTab < tabs.length - 1 ? (
                    <Button
                        onClick={() => setActiveTab(activeTab + 1)}
                        className="flex items-center justify-center h-10 !rounded-2xl bg-slate-900 hover:bg-black text-white shadow-lg shadow-gray-200 font-black uppercase text-[11px] tracking-widest px-8 transition-all"
                        endIcon={<ChevronRight size={18} />}
                    >
                        Tiếp theo
                    </Button>
                ) : (
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        className="flex items-center justify-center h-10 !rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 font-black uppercase text-[11px] tracking-widest px-8 transition-all"
                    >
                        {isSubmitting ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật ngay' : 'Thêm mới combo')}
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
            title={
                <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-100 rotate-3 transition-transform hover:rotate-0">
                        <Sparkles size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-black text-gray-900 text-xl tracking-tight block">
                            {isEditMode ? 'Chỉnh sửa Combo' : 'Tạo Combo mới'}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                {isEditMode ? `ĐANG CẬP NHẬT: ${comboToEdit?.name}` : 'THIẾT LẬP CHƯƠNG TRÌNH ƯU ĐÃI THÔNG MINH'}
                            </p>
                        </div>
                    </div>
                </div>
            }
            footer={footer}
        >
            <div className="space-y-8 pb-4">
                {/* Modern Tabs Navigation */}
                <div className="flex items-center p-1.5 bg-gray-100/60 rounded-2xl border border-gray-200/50 backdrop-blur-sm relative overflow-hidden">
                    <div
                        className="absolute top-1.5 bottom-1.5 transition-all duration-500 ease-out rounded-[18px] bg-white shadow-md border border-gray-300"
                        style={{
                            left: `${(activeTab * 100) / tabs.length}%`,
                            width: `${100 / tabs.length}%`,
                            zIndex: 0
                        }}
                    />
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative z-10 flex-1 flex items-center justify-center gap-3 px-4 py-3.5 rounded-[18px] transition-all duration-500 ${isActive
                                    ? 'text-gray-900'
                                    : 'text-gray-400 hover:text-gray-600 font-bold'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-blue-600 scale-110 transition-transform' : 'opacity-60'} />
                                <span className={`text-[13px] tracking-tight uppercase ${isActive ? 'font-black' : 'font-bold'}`}>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="min-h-[450px]">
                    {/* Tab 0: General Info */}
                    {activeTab === 0 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                            <div className="bg-white rounded-[32px] p-1 border border-gray-300 shadow-md">
                                <div className="p-6">
                                    <SectionHeader icon={Info} title="Thông tin chương trình" subtitle="Tên gọi và mô tả chi tiết" color="#2563eb" />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2">
                                            <Input
                                                label="Tên combo chương trình"
                                                name="name"
                                                value={data.name || ''}
                                                onChange={handleChange}
                                                placeholder="VD: Combo Buffet 299k tặng Coca"
                                                required
                                                className="!rounded-2xl border-gray-200 focus:border-blue-500 font-black text-lg bg-gray-50/30 py-4"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Trạng thái</label>
                                            <div className="relative group">
                                                <select
                                                    name="status"
                                                    value={data.status || 'active'}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="active">Đang hoạt động</option>
                                                    <option value="inactive">Tạm dừng áp dụng</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
                                                    <ChevronRight size={18} className="rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Mô tả quyền lợi hiển thị cho khách</label>
                                            <textarea
                                                name="description"
                                                value={data.description || ''}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-md font-bold text-gray-600 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none resize-none shadow-inner"
                                                placeholder="Khách hàng sẽ nhìn thấy mô tả này trên ứng dụng..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-[32px] p-6 border border-gray-300 shadow-md relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16" />
                                    <SectionHeader icon={Clock} title="Thời gian hiệu lực" subtitle="Lịch trình triển khai" color="#10b981" />
                                    <div className="space-y-5">
                                        <Input
                                            label="Bắt đầu từ"
                                            name="start_date"
                                            type="datetime-local"
                                            value={data.start_date || ''}
                                            onChange={handleChange}
                                            className="!rounded-2xl border-gray-200 font-bold bg-gray-50/30"
                                        />
                                        <Input
                                            label="Kết thúc vào"
                                            name="end_date"
                                            type="datetime-local"
                                            value={data.end_date || ''}
                                            onChange={handleChange}
                                            className="!rounded-2xl border-gray-200 font-bold bg-gray-50/30 text-red-500"
                                        />
                                    </div>
                                </div>
                                <div className="bg-white rounded-[32px] p-6 border border-gray-300 shadow-md relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16" />
                                    <SectionHeader icon={Settings} title="Cấu hình nâng cao" subtitle="Độ ưu tiên & giá trị" color="#6366f1" />
                                    <div className="space-y-5">
                                        <Input
                                            label="Độ ưu tiên hệ thống"
                                            name="priority"
                                            type="number"
                                            value={data.priority || 0}
                                            onChange={handleChange}
                                            min={0}
                                            className="!rounded-2xl border-gray-200 font-bold bg-gray-50/30"
                                        />
                                        <Input
                                            label="Đơn hàng tối thiểu (VNĐ)"
                                            name="min_order_value"
                                            type="number"
                                            value={data.min_order_value || 0}
                                            onChange={handleChange}
                                            min={0}
                                            className="!rounded-2xl border-gray-200 font-black text-blue-600 bg-gray-50/30 text-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 1: Conditions */}
                    {activeTab === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-500">
                            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-[28px] border border-amber-100 flex gap-4 shadow-md relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                    <Target size={120} className="text-amber-500" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0 border border-amber-200/50">
                                    <AlertCircle className="text-amber-500" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-amber-900 uppercase tracking-tight mb-0.5">Xác định điều kiện nhận quà</p>
                                    <p className="text-[13px] font-medium text-amber-800/80 leading-relaxed">
                                        Thiết lập chính xác những sản phẩm khách hàng cần mua để kích hoạt combo này. Bạn có thể kết hợp nhiều quy tắc khác nhau.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-[28px] border border-gray-300 shadow-md">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Kiểu kích hoạt</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['quantity', 'products', 'category'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setData({ ...data, condition_type: type })}
                                                className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-tight transition-all ${data.condition_type === type
                                                    ? 'bg-amber-100 text-amber-700 border-2 border-amber-200'
                                                    : 'bg-gray-50 text-gray-400 border-2 border-transparent hover:bg-gray-100'}`}
                                            >
                                                {type === 'quantity' ? 'Số lượng' : type === 'products' ? 'Sản phẩm' : 'Danh mục'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-[28px] border border-gray-300 shadow-md">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Logic kiểm tra</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['AND', 'OR'].map((op) => (
                                            <button
                                                key={op}
                                                onClick={() => setData({ ...data, condition_operator: op })}
                                                className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-tight transition-all ${data.condition_operator === op
                                                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                                                    : 'bg-gray-50 text-gray-400 border-2 border-transparent hover:bg-gray-100'}`}
                                            >
                                                {op === 'AND' ? 'Và (Tất cả)' : 'Hoặc (Bất kỳ)'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <SectionHeader icon={Layers} title="Danh sách quy tắc" subtitle="Yêu cầu mua hàng cơ sở" color="#f59e0b" />
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{conditionRules.length} QUY TẮC</span>
                                </div>
                                {conditionRules.map((rule, index) => (
                                    <div key={index} className="p-8 rounded-3xl bg-white border border-gray-300 shadow-md relative group transition-all hover:shadow-md hover:border-amber-200 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                                        <button
                                            onClick={() => removeConditionRule(index)}
                                            className="absolute top-4 right-4 w-10 h-10 bg-white border border-red-50 text-red-400 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg z-10"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <div className="space-y-8 relative z-10">
                                            <div className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-300 shadow-inner">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            id={`all-${index}`}
                                                            checked={rule.apply_to_all || false}
                                                            onChange={(e) => updateConditionRule(index, 'apply_to_all', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                                    </div>
                                                    <label htmlFor={`all-${index}`} className="text-[13px] font-black text-gray-700 cursor-pointer uppercase tracking-tight">Áp dụng cho toàn bộ Menu</label>
                                                </div>
                                                {rule.apply_to_all && <Sparkles size={18} className="text-amber-400 animate-pulse" />}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                                                {!rule.apply_to_all && (
                                                    <>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-amber-600 uppercase tracking-[0.15em] mb-3 ml-1">Chọn danh mục</label>
                                                            <div className="relative group/select">
                                                                <select
                                                                    value={rule.category_slug || ''}
                                                                    onChange={(e) => updateConditionRule(index, 'category_slug', e.target.value)}
                                                                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl text-sm font-black focus:ring-4 focus:ring-amber-50 focus:border-amber-400 outline-none shadow-inner appearance-none cursor-pointer"
                                                                >
                                                                    <option value="">-- Mọi danh mục --</option>
                                                                    {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
                                                                </select>
                                                                <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-amber-400 group-hover/select:text-amber-600 transition-colors" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-amber-600 uppercase tracking-[0.15em] mb-3 ml-1">Sản phẩm yêu cầu</label>
                                                            <div className="relative group/select">
                                                                <select
                                                                    value={rule.product_slug || rule.product_id || ''}
                                                                    onChange={(e) => {
                                                                        const p = products.find(prod => prod.slug === e.target.value || prod.id === e.target.value);
                                                                        if (p) { updateConditionRule(index, 'product_slug', p.slug); updateConditionRule(index, 'product_id', p.id); }
                                                                        else { updateConditionRule(index, 'product_slug', ''); updateConditionRule(index, 'product_id', ''); }
                                                                    }}
                                                                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl text-sm font-black focus:ring-4 focus:ring-amber-50 focus:border-amber-400 outline-none shadow-inner appearance-none cursor-pointer"
                                                                >
                                                                    <option value="">-- Món bất kỳ --</option>
                                                                    {products.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
                                                                </select>
                                                                <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-amber-400 group-hover/select:text-amber-600 transition-colors" />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                <div className={rule.apply_to_all ? "md:col-span-3" : ""}>
                                                    <Input
                                                        label="Số lượng cần mua"
                                                        type="number"
                                                        value={rule.min_quantity || ''}
                                                        onChange={(e) => updateConditionRule(index, 'min_quantity', e.target.value)}
                                                        min={1}
                                                        className="!rounded-2xl border-gray-300 font-black text-amber-600 bg-gray-50/30 text-lg shadow-inner"
                                                        suffix={<span className="text-[10px] font-black text-gray-300 uppercase mr-2">Món</span>}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addConditionRule}
                                    className="w-full py-10 border-2 border-dashed border-gray-200 rounded-3xl hover:border-amber-400 hover:bg-amber-50/30 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex flex-col items-center gap-3 relative z-10">
                                        <div className="w-14 h-14 rounded-[20px] bg-gray-100 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all group-hover:scale-110 group-hover:rotate-6 shadow-md">
                                            <Plus size={28} />
                                        </div>
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] group-hover:text-amber-600 transition-colors">Thêm quy tắc điều kiện</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Rewards */}
                    {activeTab === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-6 duration-500">
                            <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[28px] border border-emerald-100 flex gap-4 shadow-md relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                    <Trophy size={120} className="text-emerald-500" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0 border border-emerald-200/50">
                                    <Sparkles className="text-emerald-500" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-emerald-900 uppercase tracking-tight mb-0.5">Thiết lập quà tặng ưu đãi</p>
                                    <p className="text-[13px] font-medium text-emerald-800/80 leading-relaxed">
                                        Chọn các sản phẩm sẽ được tặng miễn phí cho khách hàng khi họ thỏa mãn điều kiện combo. Chúc mừng khách hàng bằng những món quà tuyệt vời!
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <SectionHeader icon={Gift} title="Danh sách quà tặng" subtitle="Sản phẩm miễn phí kèm theo" color="#10b981" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{rewardProducts.length} PHẦN QUÀ</span>
                                </div>
                                {rewardProducts.map((product, index) => (
                                    <div key={index} className="p-8 rounded-3xl bg-white border border-gray-300 shadow-md relative group transition-all hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                                        <button
                                            onClick={() => removeRewardProduct(index)}
                                            className="absolute top-4 right-4 w-10 h-10 bg-white border border-red-50 text-red-400 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg z-10"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end relative z-10">
                                            <div>
                                                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em] mb-3 ml-1">Danh mục quà</label>
                                                <div className="relative group/select">
                                                    <select
                                                        value={product.category_slug || ''}
                                                        onChange={(e) => updateRewardProduct(index, 'category_slug', e.target.value)}
                                                        className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl text-sm font-black focus:ring-4 focus:ring-emerald-50 focus:border-emerald-400 outline-none shadow-inner appearance-none cursor-pointer"
                                                    >
                                                        <option value="">-- Mọi danh mục --</option>
                                                        {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
                                                    </select>
                                                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-emerald-400 group-hover/select:text-emerald-600 transition-colors" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em] mb-3 ml-1">Sản phẩm tặng</label>
                                                <div className="relative group/select">
                                                    <select
                                                        value={product.product_slug || product.product_id || ''}
                                                        onChange={(e) => {
                                                            const p = products.find(prod => prod.slug === e.target.value || prod.id === e.target.value);
                                                            if (p) { updateRewardProduct(index, 'product_slug', p.slug); updateRewardProduct(index, 'product_id', p.id); }
                                                            else { updateRewardProduct(index, 'product_slug', ''); updateRewardProduct(index, 'product_id', ''); }
                                                        }}
                                                        className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl text-sm font-black focus:ring-4 focus:ring-emerald-50 focus:border-emerald-400 outline-none shadow-inner appearance-none cursor-pointer"
                                                    >
                                                        <option value="">-- Chọn món tặng --</option>
                                                        {products.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
                                                    </select>
                                                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-emerald-400 group-hover/select:text-emerald-600 transition-colors" />
                                                </div>
                                            </div>
                                            <div className="relative group/input">
                                                <Input
                                                    label="SL quà tặng"
                                                    type="number"
                                                    value={product.quantity_per_combo || ''}
                                                    onChange={(e) => updateRewardProduct(index, 'quantity_per_combo', e.target.value)}
                                                    min={1}
                                                    className="!rounded-2xl border-gray-300 font-black text-emerald-600 text-xl !bg-gray-50/50 group-hover/input:border-emerald-300 transition-colors pr-12"
                                                />
                                                <div className="absolute bottom-4 right-4 text-[10px] font-black text-emerald-300 uppercase tracking-widest pointer-events-none">Món</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addRewardProduct}
                                    className="w-full py-10 border-2 border-dashed border-gray-200 rounded-3xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex flex-col items-center gap-3 relative z-10">
                                        <div className="w-14 h-14 rounded-[20px] bg-gray-100 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all group-hover:scale-110 group-hover:rotate-6 shadow-md">
                                            <Plus size={28} />
                                        </div>
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] group-hover:text-emerald-600 transition-colors">Thêm phần thưởng mới</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
}

