/**
 * BannerModal component with Tailwind CSS - Premium UI
 * @file src/components/tailwindcss/BannerModal.js
 */
'use client';

import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { 
  Image as ImageIcon, X, CheckCircle, Loader2, Monitor, Smartphone, 
  Laptop, Link as LinkIcon, Type, Hash, ShieldCheck, Zap
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

export default function BannerModal({ open, onClose, onSave, bannerToEdit }) {
  const [data, setData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(bannerToEdit);

  useEffect(() => {
    if (open) {
      const initialState = {
        title: '',
        image_url: '',
        link: '',
        device: 'all',
        display_order: 0,
        is_active: true
      };
      setData(isEditMode ? { ...bannerToEdit } : initialState);
    }
  }, [open, bannerToEdit, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(data);
    } catch (error) {
      console.error('Error in onSave:', error);
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
        disabled={isSubmitting}
        startIcon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
        className={`flex items-center justify-center h-10 !rounded-2xl shadow-xl transition-all font-black uppercase text-[11px] tracking-widest px-8 text-white ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
      >
        {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật ngay' : 'Kích hoạt Banner')}
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
            <ImageIcon size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-black text-gray-900 text-2xl tracking-tight block uppercase">
              {isEditMode ? 'Sửa nội dung Banner' : 'Thêm Banner mới'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isEditMode ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">
                {isEditMode ? `ĐANG CẬP NHẬT ID: #${bannerToEdit?.id}` : 'THIẾT LẬP HÌNH ẢNH QUẢNG CÁO MỚI'}
              </p>
            </div>
          </div>
        </div>
      }
      footer={footer}
    >
      <div className="space-y-10 pb-4">
        {/* Section 1: Nội dung & Hình ảnh */}
        <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <SectionHeader icon={Type} title="Nội dung & Hình ảnh" subtitle="Tiêu đề và đường dẫn ảnh Banner" color="#2563eb" />
          <div className="space-y-6 relative z-10">
            <Input
              label="Tiêu đề Banner"
              name="title"
              value={data.title || ''}
              onChange={handleChange}
              placeholder="VD: Siêu khuyến mãi mùa hè 2024"
              className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                label="Đường dẫn ảnh (URL)"
                name="image_url"
                value={data.image_url || ''}
                onChange={handleChange}
                placeholder="https://example.com/banner.jpg"
                required
                className="!rounded-2xl border-gray-300 font-bold bg-gray-50/30 py-4 shadow-inner"
              />
              <Input
                label="Đường dẫn khi click (Link)"
                name="link"
                value={data.link || ''}
                onChange={handleChange}
                placeholder="/menu hoặc https://..."
                className="!rounded-2xl border-gray-300 font-bold bg-gray-50/30 py-4 shadow-inner"
              />
            </div>
            
            {/* Image Preview */}
            {data.image_url && (
              <div className="mt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Xem trước hình ảnh</p>
                <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                  <img src={data.image_url} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Cấu hình hiển thị */}
        <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <SectionHeader icon={Zap} title="Cấu hình hiển thị" subtitle="Thiết bị và thứ tự ưu tiên" color="#8b5cf6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-purple-600 uppercase tracking-[0.15em] mb-3 ml-1">Thiết bị áp dụng</label>
              <select
                name="device"
                value={data.device || 'all'}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-purple-50/50 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
              >
                <option value="all">Tất cả thiết bị</option>
                <option value="desktop">Chỉ Máy tính (Desktop)</option>
                <option value="mobile">Chỉ Điện thoại (Mobile)</option>
              </select>
            </div>
            <Input
              label="Thứ tự hiển thị"
              name="display_order"
              type="number"
              value={data.display_order || 0}
              onChange={handleChange}
              placeholder="VD: 0, 1, 2..."
              className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner"
            />
            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] mb-3 ml-1">Trạng thái</label>
              <select
                name="is_active"
                value={data.is_active === false ? "false" : "true"}
                onChange={(e) => setData(prev => ({ ...prev, is_active: e.target.value === "true" }))}
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
              >
                <option value="true">Đang kích hoạt (Hiện)</option>
                <option value="false">Tạm ngưng (Ẩn)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
