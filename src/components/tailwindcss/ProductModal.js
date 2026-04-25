/**
 * ProductModal component với Tailwind CSS
 */
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Package, Tag, DollarSign, Star, Info, CheckCircle, X, Upload, ImagePlus } from 'lucide-react';
import Image from 'next/image';

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

const SectionHeader = ({ icon: Icon, title, color = '#3b82f6' }) => (
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

export default function ProductModal({ open, onClose, categories, productToEdit }) {
  const router = useRouter();
  const [product, setProduct] = useState({
    name: '', slug: '', description: '', image_url: '', price: '',
    discount_price: '', category_id: '', status: 'active', is_special: false, inventory: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(productToEdit);

  useEffect(() => {
    if (open) {
      if (isEditMode && productToEdit) {
        setProduct({
          ...productToEdit,
          is_special: Boolean(productToEdit.is_special),
          inventory: productToEdit.inventory !== null && productToEdit.inventory !== undefined 
            ? productToEdit.inventory.toString() 
            : '',
          price: productToEdit.price?.toString() || '',
          discount_price: productToEdit.discount_price?.toString() || ''
        });
        setImagePreview(productToEdit.image_url || '');
      } else {
        setProduct({
          name: '', slug: '', description: '', image_url: '', price: '',
          discount_price: '', category_id: '', status: 'active', is_special: false, inventory: ''
        });
        setImagePreview('');
      }
      setErrors({});
    }
  }, [open, productToEdit, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setProduct(prev => {
      const newState = { ...prev, [name]: val };
      if (name === 'name') {
        newState.slug = slugify(val);
      }
      return newState;
    });
    
    // Update image preview when image_url changes
    if (name === 'image_url' && value) {
      setImagePreview(value);
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setImagePreview(URL.createObjectURL(file));

    try {
      const { uploadImage } = await import('@/app/actions/cloudinary');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'banhtamcodao');

      const result = await uploadImage(formData);

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      const secureUrl = result.url;
      setProduct(prev => ({ ...prev, image_url: secureUrl }));
      setImagePreview(secureUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(`Tải ảnh thất bại: ${error.message}`);
      setImagePreview(productToEdit?.image_url || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const validate = () => {
    const newErrors = {};
    
    if (!product.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên món';
    }
    
    if (!product.price || parseFloat(product.price) <= 0) {
      newErrors.price = 'Vui lòng nhập giá hợp lệ';
    }
    
    if (product.discount_price && parseFloat(product.discount_price) >= parseFloat(product.price)) {
      newErrors.discount_price = 'Giá khuyến mãi phải nhỏ hơn giá gốc';
    }
    
    if (!product.category_id) {
      newErrors.category_id = 'Vui lòng chọn danh mục';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const apiUrl = isEditMode ? `/api/admin/products/${productToEdit.id}` : '/api/admin/products';
    const method = isEditMode ? 'PUT' : 'POST';

    const submitData = {
      ...product,
      is_special: product.is_special ? 1 : 0,
      inventory: product.inventory && product.inventory !== '' ? parseInt(product.inventory, 10) : null,
      price: parseFloat(product.price),
      discount_price: product.discount_price ? parseFloat(product.discount_price) : null
    };

    try {
      const res = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        onClose();
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Có lỗi xảy ra: ${err.message || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Có lỗi xảy ra!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Hủy
      </Button>
      <Button 
        variant="primary" 
        onClick={handleSubmit}
        disabled={isSubmitting}
        startIcon={isSubmitting ? null : <CheckCircle size={16} />}
      >
        {isSubmitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
      </Button>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <Package size={22} className="text-blue-600" />
          <span className="font-bold text-gray-900">
            {isEditMode ? 'Chỉnh sửa món' : 'Thêm món mới'}
          </span>
        </div>
      }
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Info */}
            <div>
              <SectionHeader icon={Info} title="Thông tin cơ bản" color="#3b82f6" />
              <div className="space-y-4">
                <Input
                  label="Tên món ăn *"
                  name="name"
                  value={product.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  required
                  placeholder="VD: Bánh Tầm Cô Đào"
                />
                <Input
                  label="Slug (URL)"
                  name="slug"
                  value={product.slug}
                  onChange={handleInputChange}
                  error={errors.slug}
                  helperText="Tự động tạo từ tên, có thể sửa lại"
                  className="bg-gray-50"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={product.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mô tả ngắn về món ăn..."
                  />
                </div>
              </div>
            </div>

            {/* Price & Inventory */}
            <div>
              <SectionHeader icon={DollarSign} title="Giá bán & Tồn kho" color="#10b981" />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Giá gốc *"
                  name="price"
                  type="number"
                  value={product.price}
                  onChange={handleInputChange}
                  error={errors.price}
                  required
                  endAdornment={<span className="text-gray-400 text-sm">VNĐ</span>}
                />
                <Input
                  label="Giá khuyến mãi"
                  name="discount_price"
                  type="number"
                  value={product.discount_price}
                  onChange={handleInputChange}
                  error={errors.discount_price}
                  endAdornment={<span className="text-gray-400 text-sm">VNĐ</span>}
                />
                <Input
                  label="Tồn kho"
                  name="inventory"
                  type="number"
                  value={product.inventory}
                  onChange={handleInputChange}
                  error={errors.inventory}
                  helperText="Để trống nếu không quản lý"
                />
              </div>
            </div>

            {/* Category & Settings */}
            <div>
              <SectionHeader icon={Tag} title="Danh mục & Cài đặt" color="#8b5cf6" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục *
                  </label>
                  <select
                    name="category_id"
                    value={product.category_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.category_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={product.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tắt</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_special"
                    checked={product.is_special}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-amber-500" />
                    <span className="text-sm font-medium text-gray-700">Món bán chạy</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="lg:col-span-2">
            <SectionHeader icon={ImagePlus} title="Hình ảnh" color="#ec4899" />
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isUploading ? 'opacity-50' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('image-upload').click()}
            >
              {imagePreview ? (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white">Đang tải...</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Upload size={48} className="text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Kéo thả ảnh vào đây hoặc click để chọn
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF tối đa 10MB
                  </p>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
            
            {/* URL Input */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">hoặc</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              <Input
                label="Dán URL ảnh"
                name="image_url"
                value={product.image_url}
                onChange={handleInputChange}
                placeholder="https://..."
                helperText="Nhập URL ảnh từ internet"
              />
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

