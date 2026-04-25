/**
 * CategoryModal component với Tailwind CSS
 */
'use client';
import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { FolderTree, Info, Link2, Layers, CheckCircle, X, Star } from 'lucide-react';

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

export default function CategoryModal({ open, onClose, onSave, categoryToEdit, categories }) {
  const [category, setCategory] = useState({ name: '', slug: '', parent_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(categoryToEdit);

  useEffect(() => {
    if (open) {
      setCategory(categoryToEdit
        ? { ...categoryToEdit, parent_id: categoryToEdit.parent_id || '' }
        : { name: '', slug: '', parent_id: '' }
      );
    }
  }, [open, categoryToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory(prev => ({ ...prev, [name]: value }));
    if (name === 'name') {
      setCategory(prev => ({ ...prev, slug: slugify(value) }));
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    await onSave(category);
    setIsSubmitting(false);
  };

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Hủy bỏ
      </Button>
      <Button
        variant={isEditMode ? 'primary' : 'success'}
        onClick={handleSave}
        disabled={isSubmitting || !category.name}
        loading={isSubmitting}
        startIcon={!isSubmitting && <CheckCircle size={16} />}
      >
        {isEditMode ? 'Cập nhật' : 'Thêm danh mục'}
      </Button>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-3 w-full">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isEditMode ? 'bg-blue-500/20' : 'bg-green-500/20'
              }`}
          >
            <FolderTree
              size={20}
              className={isEditMode ? 'text-blue-600' : 'text-green-600'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">
              {isEditMode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            {isEditMode && (
              <p className="text-sm text-gray-500 truncate">{categoryToEdit?.name}</p>
            )}
          </div>
        </div>
      }
      footer={footer}
    >
      <div className="space-y-8">
        {/* Basic Info */}
        <div>
          <SectionHeader icon={Info} title="Thông tin cơ bản" color="#2563eb" />
          <div className="space-y-4">
            <Input
              name="name"
              label="Tên danh mục *"
              value={category.name}
              onChange={handleChange}
              required
              placeholder="VD: Món chính, Đồ uống..."
              className="text-lg font-medium"
            />
            <Input
              name="slug"
              label="Slug (URL)"
              value={category.slug}
              onChange={handleChange}
              helperText="Tự động tạo từ tên, có thể sửa lại"
              startIcon={<Link2 size={16} />}
              className="bg-gray-50 font-mono text-blue-600"
            />
          </div>
        </div>

        {/* Parent Category */}
        <div>
          <SectionHeader icon={Layers} title="Phân cấp & Sắp xếp" color="#f59e0b" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Danh mục cha
              </label>
              <select
                name="parent_id"
                value={category.parent_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Không có (Danh mục gốc)</option>
                {categories.filter(c => c.id !== category.id).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Thêm trường số thứ tự nếu có trong DB */}
            <div>
              <Input
                name="sort_order"
                label="Số thứ tự"
                type="number"
                value={category.sort_order || 0}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 bg-gray-100 p-4 rounded-lg flex items-center gap-2">
            <Info size={14} className="text-blue-500 flex-shrink-0" />
            <span>Chọn danh mục cha để tạo cấu trúc phân cấp (VD: Bánh tằm là con của Món chính).</span>
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
          <p className="text-sm text-blue-800 font-bold mb-2 flex items-center gap-2">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            Mẹo nhỏ
          </p>
          <ul className="text-sm text-blue-700 space-y-1 ml-1">
            <li>• <span className="font-bold">Danh mục gốc:</span> Thường dùng cho các nhóm lớn như Món ăn, Nước uống.</li>
            <li>• <span className="font-bold">Danh mục con:</span> Dùng để chi tiết hóa (Nước ép, Sinh tố...).</li>
          </ul>
        </div>
      </div>
    </Dialog>
  );
}

