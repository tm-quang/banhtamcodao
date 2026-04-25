/**
 * CustomerGroupModal component với Tailwind CSS
 */
'use client';
import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { X, Users, Info, Award, TrendingUp, Settings, CheckCircle, Loader2 } from 'lucide-react';

const SectionHeader = ({ icon: Icon, title, color = '#2563eb' }) => (
    <div className="flex items-center gap-2 mb-3">
        <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
        >
            <Icon size={16} style={{ color }} />
        </div>
        <span className="text-sm font-semibold text-gray-700">{title}</span>
    </div>
);

export default function CustomerGroupModal({ open, onClose, onSave, groupToEdit }) {
    const [group, setGroup] = useState({
        name: '',
        description: '',
        min_points: 0,
        points_per_amount: 1000,
        display_order: 0,
        is_active: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = Boolean(groupToEdit);

    useEffect(() => {
        if (open) {
            setGroup(groupToEdit
                ? { ...groupToEdit }
                : {
                    name: '',
                    description: '',
                    min_points: 0,
                    points_per_amount: 1000,
                    display_order: 0,
                    is_active: true
                }
            );
        }
    }, [open, groupToEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGroup(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
        }));
    };

    const handleSave = async () => {
        if (!group.name || group.min_points === undefined || group.points_per_amount === undefined) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setIsSubmitting(true);
        await onSave(group);
        setIsSubmitting(false);
    };

    const footer = (
        <div className="flex items-center justify-end gap-3">
            <Button
                variant="outline"
                onClick={onClose}
                className="!bg-gray-300 !hover:bg-gray-500 text-gray-700"
            >
                Hủy bỏ
            </Button>
            <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSubmitting || !group.name}
                startIcon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                className={isEditMode ? '!bg-blue-600 !hover:bg-blue-700' : '!bg-green-600 !hover:bg-green-700'}
            >
                {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm nhóm')}
            </Button>
        </div>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            size="md"
            title={
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEditMode ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}>
                        <Users size={22} className={isEditMode ? 'text-blue-600' : 'text-emerald-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-black text-gray-900 block">
                            {isEditMode ? 'Chỉnh sửa nhóm khách' : 'Thêm nhóm khách mới'}
                        </span>
                        <p className="text-xs text-gray-500 font-medium truncate">
                            {isEditMode ? `Đang chỉnh sửa: ${groupToEdit?.name}` : 'Thiết lập chính sách tích điểm & thăng hạng'}
                        </p>
                    </div>
                </div>
            }
            footer={footer}
        >
            <div className="space-y-8">
                {/* Section 1: Thông tin cơ bản */}
                <div>
                    <SectionHeader icon={Info} title="Thông tin cơ bản" color="#2563eb" />
                    <div className="space-y-4">
                        <Input
                            label="Tên nhóm *"
                            name="name"
                            value={group.name}
                            onChange={handleChange}
                            placeholder="VD: Khách hàng VIP, Khách hàng thân thiết..."
                            required
                            className="font-bold text-lg"
                        />
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Mô tả nhóm
                            </label>
                            <textarea
                                name="description"
                                value={group.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-md font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                                placeholder="Mô tả về đặc quyền hoặc điều kiện đặc biệt của nhóm..."
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Điều kiện thăng hạng */}
                <div>
                    <SectionHeader icon={TrendingUp} title="Chính sách tích điểm & thăng hạng" color="#f59e0b" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Input
                                label="Điểm tích lũy tối thiểu *"
                                name="min_points"
                                type="number"
                                value={group.min_points}
                                onChange={handleChange}
                                min={0}
                                step={1}
                                required
                                helperText="Số điểm cần đạt được để thăng hạng vào nhóm này"
                                className="font-mono text-amber-600 font-bold"
                            />
                        </div>
                        <Input
                            label="Tỷ lệ tích điểm *"
                            name="points_per_amount"
                            type="number"
                            value={group.points_per_amount}
                            onChange={handleChange}
                            min={1}
                            step={100}
                            required
                            helperText="VD: 1000 = mỗi 1000đ được 1 điểm"
                            className="font-mono"
                        />
                        <Input
                            label="Thứ tự hiển thị"
                            name="display_order"
                            type="number"
                            value={group.display_order}
                            onChange={handleChange}
                            min={0}
                            step={1}
                            helperText="Độ ưu tiên (Số càng lớn ưu tiên càng cao)"
                            className="font-mono"
                        />
                    </div>
                </div>

                {/* Section 4: Trạng thái */}
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${group.is_active ? 'bg-green-500' : 'bg-gray-400'}`}>
                                <CheckCircle size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Kích hoạt nhóm khách này</p>
                                <p className="text-xs text-gray-500">Chỉ nhóm đang hoạt động mới được thăng hạng</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={group.is_active}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

