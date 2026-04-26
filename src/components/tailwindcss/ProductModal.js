/**
 * ProductModal component với Tailwind CSS - Premium UI
 * @file src/components/tailwindcss/ProductModal.js
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { 
  Package, Tag, DollarSign, Star, Info, CheckCircle, X, 
  Upload, ImagePlus, Loader2, Sparkles, Zap, ShoppingBag, 
  ChevronRight, Layout, Settings
} from 'lucide-react';
import Image from 'next/image';

const SectionHeader = ({ icon: Icon, title, color = '#3b82f6', subtitle }) => (
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

      if (!result.success) throw new Error(result.error || 'Upload failed');

      setProduct(prev => ({ ...prev, image_url: result.url }));
      setImagePreview(result.url);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(`Tải ảnh thất bại: ${error.message}`);
      setImagePreview(productToEdit?.image_url || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
    <div className="flex items-center justify-end gap-3 w-full">
      <Button
        variant="outline"
        onClick={onClose}
        className="flex items-center justify-center h-10 !rounded-2xl font-black uppercase text-[11px] tracking-widest px-6 transition-all"
      >
        Hủy bỏ
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !product.name || !product.price}
        startIcon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
        className={`flex items-center justify-center h-10 !rounded-2xl shadow-xl transition-all font-black uppercase text-[11px] tracking-widest px-8 text-white ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
      >
        {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật món' : 'Tạo món ngay')}
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
            <Package size={24} className="text-white" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-black text-gray-900 text-2xl tracking-tight block uppercase">
              {isEditMode ? 'Sửa thông tin món' : 'Thêm món mới'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isEditMode ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">
                {isEditMode ? `ĐANG CẬP NHẬT ID: #${productToEdit?.id}` : 'THIẾT LẬP SẢN PHẨM MỚI TRÊN HỆ THỐNG'}
              </p>
            </div>
          </div>
        </div>
      }
      footer={footer}
    >
      <div className="space-y-10 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Cột trái: Thông tin cơ bản & Giá */}
          <div className="space-y-10">
            {/* Section 1: Định danh */}
            <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <SectionHeader icon={Layout} title="Định danh sản phẩm" subtitle="Tên và đường dẫn hiển thị" color="#2563eb" />
              <div className="space-y-6 relative z-10">
                <Input
                  label="Tên món ăn *"
                  name="name"
                  value={product.name}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: Bánh Tầm Bì Cô Đào"
                  className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner text-lg"
                />
                <Input
                  label="Slug (URL)"
                  name="slug"
                  value={product.slug}
                  onChange={handleInputChange}
                  placeholder="banh-tam-bi-co-dao"
                  className="!rounded-2xl border-gray-300 font-bold bg-gray-50/30 py-4 shadow-inner font-mono text-blue-600"
                />
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mô tả món ăn</label>
                  <textarea
                    name="description"
                    value={product.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Nhập mô tả hấp dẫn về món ăn..."
                    className="w-full px-5 py-4 bg-gray-50/30 border border-gray-300 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-blue-50/30 focus:border-blue-500 outline-none transition-all resize-none shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Kinh doanh */}
            <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <SectionHeader icon={DollarSign} title="Thông số kinh doanh" subtitle="Giá bán và quản lý kho" color="#10b981" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <Input
                  label="Giá bán gốc *"
                  name="price"
                  type="number"
                  value={product.price}
                  onChange={handleInputChange}
                  required
                  placeholder="50000"
                  className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner text-xl text-emerald-600"
                  suffix={<span className="text-[10px] font-black text-gray-400 mr-3 uppercase">VNĐ</span>}
                />
                <Input
                  label="Giá khuyến mãi"
                  name="discount_price"
                  type="number"
                  value={product.discount_price}
                  onChange={handleInputChange}
                  placeholder="45000"
                  className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner text-xl text-red-600"
                  suffix={<span className="text-[10px] font-black text-gray-400 mr-3 uppercase">VNĐ</span>}
                />
                <Input
                  label="Số lượng tồn kho"
                  name="inventory"
                  type="number"
                  value={product.inventory}
                  onChange={handleInputChange}
                  placeholder="VD: 100"
                  className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner"
                  helperText="Để trống nếu không giới hạn"
                />
                <div>
                   <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 ml-1">Món ăn đặc biệt</label>
                   <div 
                    onClick={() => handleInputChange({ target: { name: 'is_special', checked: !product.is_special, type: 'checkbox' } })}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl border cursor-pointer transition-all ${product.is_special ? 'bg-amber-50 border-amber-200' : 'bg-gray-50/30 border-gray-300'}`}
                   >
                     <div className="flex items-center gap-3">
                        <Star size={18} className={product.is_special ? 'text-amber-500 fill-amber-500' : 'text-gray-300'} />
                        <span className={`text-[11px] font-black uppercase tracking-wider ${product.is_special ? 'text-amber-700' : 'text-gray-500'}`}>BÁN CHẠY / HOT</span>
                     </div>
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${product.is_special ? 'border-amber-500 bg-amber-500' : 'border-gray-300 bg-white'}`}>
                        {product.is_special && <CheckCircle size={12} className="text-white" />}
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Hình ảnh & Phân loại */}
          <div className="space-y-10">
             {/* Section 3: Hình ảnh */}
             <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <SectionHeader icon={ImagePlus} title="Hình ảnh món ăn" subtitle="Ảnh đại diện hiển thị trên Menu" color="#ec4899" />
                
                <div className="space-y-6 relative z-10">
                  <div
                    className={`relative w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${dragOver ? 'border-pink-500 bg-pink-50/50 scale-[0.98]' : 'border-gray-300 bg-gray-50/50 hover:bg-white hover:border-pink-300'}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageUpload(e.dataTransfer.files[0]); }}
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3 group/img">
                           <button 
                            type="button"
                            onClick={() => document.getElementById('image-upload').click()}
                            className="w-12 h-12 rounded-2xl bg-white text-gray-900 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                           >
                              <RefreshCw size={20} />
                           </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-gray-400">
                        <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <Upload size={28} className="text-pink-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Kéo thả ảnh hoặc Click để tải lên</p>
                          <p className="text-[10px] font-bold text-gray-300 mt-1">PNG, JPG, HEIC (Tối đa 10MB)</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => document.getElementById('image-upload').click()}
                          className="px-6 py-2 bg-pink-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-100"
                        >
                          Chọn ảnh từ máy
                        </button>
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <Loader2 size={32} className="text-pink-500 animate-spin mb-3" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-pink-600">Đang xử lý ảnh...</span>
                      </div>
                    )}
                    <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} />
                  </div>

                  <Input
                    label="Hoặc dán URL hình ảnh"
                    name="image_url"
                    value={product.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/food.jpg"
                    className="!rounded-2xl border-gray-300 font-bold bg-gray-50/30 py-4 shadow-inner text-sm"
                  />
                </div>
             </div>

             {/* Section 4: Phân loại */}
             <div className="bg-white rounded-3xl p-8 border border-gray-300 shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <SectionHeader icon={Settings} title="Cấu hình hệ thống" subtitle="Danh mục và trạng thái hiển thị" color="#8b5cf6" />
                <div className="space-y-6 relative z-10">
                  <div>
                    <label className="block text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 ml-1">Danh mục món ăn *</label>
                    <select
                      name="category_id"
                      value={product.category_id}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-purple-50/50 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                      required
                    >
                      <option value="">-- CHỌN DANH MỤC --</option>
                      {categories?.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 ml-1">Trạng thái hiển thị</label>
                    <select
                      name="status"
                      value={product.status}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                    >
                      <option value="active">ĐANG KINH DOANH (HIỆN)</option>
                      <option value="inactive">TẠM NGƯNG BÁN (ẨN)</option>
                    </select>
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </Dialog>
  );
}
