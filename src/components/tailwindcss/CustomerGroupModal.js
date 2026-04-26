/**
 * CustomerGroupModal component với Tailwind CSS - Premium UI
 * @file src/components/tailwindcss/CustomerGroupModal.js
 */
'use client';

import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { 
  X, Users, Info, Award, TrendingUp, Settings, 
  CheckCircle, Loader2, Sparkles, Layout, Zap, Hash
} from 'lucide-react';

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
        if (!group.name) return;
        setIsSubmitting(true);
        try {
          await onSave(group);
        } catch (error) {
          console.error('Save failed:', error);
        } finally {
          setIsSubmitting(false);
        }
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
          disabled={isSubmitting || !group.name}
          startIcon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          className={`flex items-center justify-center h-10 !rounded-2xl shadow-xl transition-all font-black uppercase text-[11px] tracking-widest px-8 text-white ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
        >
          {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật ngay' : 'Kích hoạt nhóm')}
        </Button>
      </div>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            size="lg"
            title={
                <div className="flex items-center gap-4 py-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg rotate-3 transition-transform hover:rotate-0 ${isEditMode ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200/50' : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200/50'}`}>
                    <Users size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-black text-gray-900 text-2xl tracking-tight block uppercase">
                      {isEditMode ? 'Sửa nhóm khách' : 'Thêm nhóm khách'}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${isEditMode ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                      <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">
                        {isEditMode ? `ĐANG CHỈNH SỬA: ${groupToEdit?.name}` : 'THIẾT LẬP PHÂN HẠNG THÀNH VIÊN MỚI'}
                      </p>
                    </div>
                  </div>
                </div>
            }
            footer={footer}
        >
            <div className="space-y-10 pb-4">
                {/* Section 1: Định danh */}
                <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  <SectionHeader icon={Layout} title="Thông tin định danh" subtitle="Tên gọi và mô tả đặc quyền" color="#2563eb" />
                  <div className="space-y-6 relative z-10">
                    <Input
                      label="Tên nhóm khách hàng *"
                      name="name"
                      value={group.name}
                      onChange={handleChange}
                      placeholder="VD: Khách hàng VIP, Thành viên thân thiết..."
                      required
                      className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner text-lg"
                    />
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mô tả đặc quyền nhóm</label>
                      <textarea
                        name="description"
                        value={group.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Nhập các quyền lợi đặc biệt của nhóm này..."
                        className="w-full px-5 py-4 bg-gray-50/30 border border-gray-300 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-blue-50/30 focus:border-blue-500 outline-none transition-all resize-none shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Chính sách thăng hạng */}
                <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  <SectionHeader icon={TrendingUp} title="Chính sách tích lũy" subtitle="Điều kiện thăng hạng và tỷ lệ điểm" color="#f59e0b" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="md:col-span-2">
                        <Input
                          label="Điểm tích lũy tối thiểu *"
                          name="min_points"
                          type="number"
                          value={group.min_points}
                          onChange={handleChange}
                          required
                          className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner text-xl text-amber-600"
                          helperText="Số điểm cần đạt được để thăng hạng vào nhóm này"
                          prefix={<Award size={18} className="text-amber-500 ml-4 mr-2" />}
                        />
                    </div>
                    <Input
                      label="Tỷ lệ tích điểm *"
                      name="points_per_amount"
                      type="number"
                      value={group.points_per_amount}
                      onChange={handleChange}
                      required
                      className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner"
                      helperText="VD: 1000 = mỗi 1000đ được tích 1 điểm"
                      prefix={<Zap size={18} className="text-blue-500 ml-4 mr-2" />}
                    />
                    <Input
                      label="Thứ tự hiển thị"
                      name="display_order"
                      type="number"
                      value={group.display_order}
                      onChange={handleChange}
                      className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner"
                      helperText="Độ ưu tiên hiển thị (Số càng lớn ưu tiên càng cao)"
                      prefix={<Hash size={18} className="text-gray-400 ml-4 mr-2" />}
                    />
                  </div>
                </div>

                {/* Section 3: Trạng thái & Tip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
                    <SectionHeader icon={Settings} title="Trạng thái" subtitle="Kích hoạt chính sách nhóm" color="#10b981" />
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-200 rounded-2xl relative z-10">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${group.is_active ? 'bg-emerald-500' : 'bg-gray-400'} shadow-lg transition-colors`}>
                            <CheckCircle size={20} className="text-white" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-gray-800 uppercase tracking-tight">Đang hoạt động</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Áp dụng cho hệ thống</p>
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
                          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                        </label>
                    </div>
                  </div>

                  <div className="p-8 rounded-[28px] bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-xl relative overflow-hidden group flex flex-col justify-center">
                    <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-700">
                      <Sparkles size={110} fill="currentColor" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Info size={16} /> Lưu ý thăng hạng
                      </p>
                      <p className="text-[11px] font-medium leading-relaxed opacity-90">
                        Hệ thống sẽ tự động thăng hạng khách hàng khi họ đạt đủ số điểm tích lũy tối thiểu của nhóm.
                      </p>
                    </div>
                  </div>
                </div>
            </div>
        </Dialog>
    );
}
