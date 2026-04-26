/**
 * TestimonialModal component với Tailwind CSS - Premium UI
 * @file src/components/tailwindcss/TestimonialModal.js
 */
'use client';

import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { 
  MessageSquare, Star, CheckCircle, X, Layout, 
  Hash, Settings, Info, Loader2, Sparkles, UserCircle,
  Quote, Zap, Layers
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

export default function TestimonialModal({ open, onClose, onSave, testimonialToEdit }) {
  const [data, setData] = useState({
    customer_name: '',
    rating: 5,
    content: '',
    display_order: 0,
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(testimonialToEdit);

  useEffect(() => {
    if (open) {
      setData(testimonialToEdit 
        ? { ...testimonialToEdit }
        : {
            customer_name: '',
            rating: 5,
            content: '',
            display_order: 0,
            status: 'active'
          }
      );
    }
  }, [open, testimonialToEdit]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value 
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!data.customer_name || !data.content) return;
    
    setIsSubmitting(true);
    try {
      await onSave(data);
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
        disabled={isSubmitting || !data.customer_name || !data.content}
        startIcon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
        className={`flex items-center justify-center h-10 !rounded-2xl shadow-xl transition-all font-black uppercase text-[11px] tracking-widest px-8 text-white ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
      >
        {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật ngay' : 'Thêm đánh giá')}
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
            <MessageSquare size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-black text-gray-900 text-2xl tracking-tight block uppercase">
              {isEditMode ? 'Sửa đánh giá' : 'Thêm đánh giá'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isEditMode ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">
                {isEditMode ? `ĐANG CẬP NHẬT PHẢN HỒI CỦA KHÁCH` : 'THIẾT LẬP NỘI DUNG TESTIMONIAL MỚI'}
              </p>
            </div>
          </div>
        </div>
      }
      footer={footer}
    >
      <form onSubmit={handleSave} className="space-y-10 pb-4">
        {/* Section 1: Thông tin khách hàng */}
        <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <SectionHeader icon={UserCircle} title="Thông tin khách hàng" subtitle="Định danh người đánh giá" color="#2563eb" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <Input
              label="Tên khách hàng *"
              name="customer_name"
              value={data.customer_name}
              onChange={handleChange}
              placeholder="VD: Nguyễn Văn A"
              required
              className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner text-lg"
            />
            <div>
              <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 ml-1">Xếp hạng đánh giá</label>
              <div className="relative group/select">
                <select
                  name="rating"
                  value={data.rating}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-amber-50/50 focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 Sao)</option>
                  <option value="4">⭐⭐⭐⭐ (4 Sao)</option>
                  <option value="3">⭐⭐⭐ (3 Sao)</option>
                  <option value="2">⭐⭐ (2 Sao)</option>
                  <option value="1">⭐ (1 Sao)</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-amber-400">
                   <Star size={18} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Nội dung đánh giá */}
        <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <SectionHeader icon={Quote} title="Nội dung phản hồi" subtitle="Ý kiến chi tiết từ khách hàng" color="#6366f1" />
          <div className="relative z-10">
            <textarea
              name="content"
              value={data.content}
              onChange={handleChange}
              rows={4}
              placeholder="Nhập nội dung đánh giá của khách hàng tại đây..."
              className="w-full px-5 py-4 bg-gray-50/30 border border-gray-300 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-indigo-50/30 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner italic leading-relaxed"
              required
            />
          </div>
        </div>

        {/* Section 3: Cấu hình hiển thị */}
        <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <SectionHeader icon={Settings} title="Cấu hình hiển thị" subtitle="Trạng thái và vị trí ưu tiên" color="#10b981" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 ml-1">Trạng thái hiển thị</label>
              <select
                name="status"
                value={data.status}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
              >
                <option value="active">CÔNG KHAI (HIỆN)</option>
                <option value="inactive">TẠM ẨN (DỰ THẢO)</option>
              </select>
            </div>
            <Input
              label="Thứ tự hiển thị"
              name="display_order"
              type="number"
              value={data.display_order}
              onChange={handleChange}
              placeholder="0"
              className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner"
              prefix={<Hash size={16} className="text-gray-400 ml-4 mr-2" />}
            />
          </div>
          
          <div className="mt-6 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-4 group/tip hover:bg-emerald-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 group-hover/tip:scale-110 transition-transform">
              <Zap size={18} className="text-emerald-500" />
            </div>
            <p className="text-[11px] font-bold text-emerald-700/80 leading-relaxed uppercase tracking-tight">
              Lưu ý: Nội dung này sẽ được hiển thị tại phần "Khách hàng nói gì về chúng tôi" ở trang chủ.
            </p>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
