/**
 * CategoryModal component với Tailwind CSS - Premium UI
 * @file src/components/tailwindcss/CategoryModal.js
 */
'use client';

import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { 
  FolderTree, Info, Link2, Layers, CheckCircle, X, Star, 
  Layout, Hash, Sparkles, ChevronRight, Zap, Loader2
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

const slugify = (str) => {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/[đĐ]/g, 'd');
  str = str.replace(/[^a-z0-9\s-]/g, '');
  str = str.replace(/[\s_-]+/g, '-');
  str = str.replace(/^-+|-+$/g, '');
  return str;
};

export default function CategoryModal({ open, onClose, onSave, categoryToEdit, categories = [] }) {
  const [category, setCategory] = useState({ name: '', slug: '', parent_id: '', sort_order: 0, active: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(categoryToEdit);

  useEffect(() => {
    if (open) {
      setCategory(categoryToEdit
        ? { ...categoryToEdit, parent_id: categoryToEdit.parent_id || '', active: categoryToEdit.active !== false }
        : { name: '', slug: '', parent_id: '', sort_order: 0, active: true }
      );
    }
  }, [open, categoryToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setCategory(prev => {
      const newState = { ...prev, [name]: val };
      if (name === 'name') {
        newState.slug = slugify(val);
      }
      return newState;
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(category);
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
        disabled={isSubmitting || !category.name}
        startIcon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
        className={`flex items-center justify-center h-10 !rounded-2xl shadow-xl transition-all font-black uppercase text-[11px] tracking-widest px-8 text-white ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
      >
        {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật ngay' : 'Tạo danh mục')}
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
            <FolderTree size={24} className="text-white" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-black text-gray-900 text-2xl tracking-tight block uppercase">
              {isEditMode ? 'Sửa danh mục' : 'Thêm danh mục'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isEditMode ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">
                {isEditMode ? `ĐANG CHỈNH SỬA: ${categoryToEdit?.name}` : 'THIẾT LẬP PHÂN LOẠI THỰC ĐƠN MỚI'}
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
          <SectionHeader icon={Layout} title="Thông tin cơ bản" subtitle="Tên và đường dẫn danh mục" color="#2563eb" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <Input
              label="Tên danh mục *"
              name="name"
              value={category.name}
              onChange={handleChange}
              placeholder="VD: Món chính, Đồ uống..."
              required
              className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner text-lg"
            />
            <Input
              label="Slug (URL)"
              name="slug"
              value={category.slug}
              onChange={handleChange}
              placeholder="mon-chinh"
              className="!rounded-2xl border-gray-300 font-bold bg-gray-50/30 py-4 shadow-inner font-mono text-blue-600"
            />
          </div>
        </div>

        {/* Section 2: Phân cấp & Sắp xếp */}
        <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <SectionHeader icon={Layers} title="Phân cấp & Sắp xếp" subtitle="Quản lý cấu trúc và thứ tự" color="#f59e0b" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 ml-1">Danh mục cha</label>
              <div className="relative group/select">
                <select
                  name="parent_id"
                  value={category.parent_id}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-amber-50/50 focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                >
                  <option value="">-- DANH MỤC GỐC --</option>
                  {(categories || [])
                    .filter(c => c.id !== category.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>
            <Input
              label="Thứ tự hiển thị"
              name="sort_order"
              type="number"
              value={category.sort_order}
              onChange={handleChange}
              placeholder="0"
              className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner"
              prefix={<Hash size={16} className="text-gray-400 ml-4 mr-2" />}
            />
          </div>
          
          <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-4 group/tip hover:bg-blue-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 group-hover/tip:scale-110 transition-transform">
              <Zap size={18} className="text-blue-500" />
            </div>
            <p className="text-[11px] font-bold text-blue-700/80 leading-relaxed uppercase tracking-tight">
              Mẹo: Chọn danh mục cha để tạo cấu trúc phân cấp (VD: Bánh tằm là con của Món chính).
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-6 rounded-[28px] bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <Star size={80} fill="currentColor" />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Sparkles size={14} /> Danh mục gốc
                </p>
                <p className="text-[11px] font-medium leading-relaxed opacity-90">
                  Dùng cho các nhóm lớn như Món ăn, Nước uống để tạo Menu chính.
                </p>
              </div>
           </div>
           <div className="p-6 rounded-[28px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <Layers size={80} fill="currentColor" />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Zap size={14} /> Danh mục con
                </p>
                <p className="text-[11px] font-medium leading-relaxed opacity-90">
                  Dùng để chi tiết hóa các loại món (Nước ép, Sinh tố...) giúp khách hàng dễ tìm.
                </p>
              </div>
           </div>
        </div>
      </div>
    </Dialog>
  );
}
