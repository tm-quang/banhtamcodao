import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { 
  FolderTree, Layers, CheckCircle, Star, 
  Layout, Hash, Sparkles, ChevronRight, Zap, Loader2
} from 'lucide-react';

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
        disabled={isSubmitting || !category.name}
        className={`flex items-center justify-center gap-2 h-9 !rounded-xl px-7 font-black text-[10px] uppercase tracking-widest text-white shadow-md transition-all ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
      >
        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
        {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo danh mục')}
      </Button>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      noPadding={true}
      title={
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEditMode ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}>
            <FolderTree size={22} className={isEditMode ? 'text-blue-600' : 'text-emerald-600'} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-gray-900 block">
              {isEditMode ? 'Sửa danh mục' : 'Thêm danh mục'}
            </span>
            <p className="text-xs text-gray-600 font-medium">
              {isEditMode ? `Đang chỉnh sửa: ${categoryToEdit?.name}` : 'Thiết lập phân loại thực đơn mới'}
            </p>
          </div>
        </div>
      }
      footer={footer}
    >
      <div className="space-y-6 md:space-y-8 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Column 1: Thông tin cơ bản */}
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Layout size={18} className="text-blue-600" />
                <span className="text-sm font-black uppercase text-gray-700">Thông tin cơ bản</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Tên danh mục *</label>
                  <Input
                    name="name"
                    value={category.name}
                    onChange={handleChange}
                    placeholder="VD: Món chính, Đồ uống..."
                    required
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Slug (URL)</label>
                  <Input
                    name="slug"
                    value={category.slug}
                    onChange={handleChange}
                    placeholder="mon-chinh"
                    className="bg-white font-mono text-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Phân cấp & Sắp xếp */}
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={18} className="text-amber-500" />
                <span className="text-sm font-black uppercase text-gray-700">Phân cấp & Sắp xếp</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Danh mục cha</label>
                  <div className="relative group/select">
                    <select
                      name="parent_id"
                      value={category.parent_id}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- DANH MỤC GỐC --</option>
                      {(categories || [])
                        .filter(c => c.id !== category.id)
                        .map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))
                      }
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                      <ChevronRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Thứ tự hiển thị</label>
                  <Input
                    name="sort_order"
                    type="number"
                    value={category.sort_order}
                    onChange={handleChange}
                    placeholder="0"
                    className="bg-white"
                    startIcon={<Hash size={14} className="text-gray-400" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                <Star size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-800 mb-1">
                  Danh mục gốc
                </p>
                <p className="text-[11px] font-medium text-blue-900/70">
                  Dùng cho các nhóm lớn như Món ăn, Nước uống.
                </p>
              </div>
           </div>
           <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <Layers size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-1">
                  Danh mục con
                </p>
                <p className="text-[11px] font-medium text-emerald-900/70">
                  Chi tiết hóa món (Nước ép, Sinh tố...).
                </p>
              </div>
           </div>
        </div>
      </div>
    </Dialog>
  );
}
