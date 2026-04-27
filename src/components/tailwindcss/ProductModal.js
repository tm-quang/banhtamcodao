import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { 
  Package, DollarSign, Star, CheckCircle, 
  Upload, ImagePlus, Loader2, Layout, Settings, RefreshCw
} from 'lucide-react';
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
    <div className="flex items-center justify-end gap-2 w-full px-1">
      <Button
        variant="outline"
        onClick={onClose}
        className="h-9 !rounded-xl px-5 font-bold text-[10px] shadow-sm uppercase tracking-widest"
      >
        Hủy bỏ
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !product.name || !product.price}
        className={`flex items-center justify-center gap-2 h-9 !rounded-xl px-7 font-black text-[10px] uppercase tracking-widest text-white shadow-md transition-all ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
      >
        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
        {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo món ngay')}
      </Button>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      noPadding={true}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Package size={22} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-gray-900 block">
              {isEditMode ? 'Sửa thông tin món' : 'Thêm món mới'}
            </span>
            <p className="text-xs text-gray-600 font-medium">
              {isEditMode ? `Đang cập nhật ID: #${productToEdit?.id}` : 'Thiết lập sản phẩm mới'}
            </p>
          </div>
        </div>
      }
      footer={footer}
    >
      <div className="space-y-6 md:space-y-8 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          
          {/* Cột trái */}
          <div className="space-y-4 md:space-y-6">
            {/* Định danh sản phẩm */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Layout size={18} className="text-blue-600" />
                <span className="text-sm font-black uppercase text-gray-700">Định danh sản phẩm</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Tên món ăn *</label>
                  <Input
                    name="name"
                    value={product.name}
                    onChange={handleInputChange}
                    required
                    placeholder="VD: Bánh Tầm Bì Cô Đào"
                    className="bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Slug (URL)</label>
                  <Input
                    name="slug"
                    value={product.slug}
                    onChange={handleInputChange}
                    placeholder="banh-tam-bi-co-dao"
                    className="bg-white font-mono text-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Mô tả món ăn</label>
                  <textarea
                    name="description"
                    value={product.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Nhập mô tả hấp dẫn..."
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Hình ảnh */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <ImagePlus size={18} className="text-pink-500" />
                <span className="text-sm font-black uppercase text-gray-700">Hình ảnh món ăn</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div
                  className={`relative w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${dragOver ? 'border-pink-500 bg-pink-50' : 'border-gray-300 bg-white hover:border-pink-300'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageUpload(e.dataTransfer.files[0]); }}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button 
                          type="button"
                          onClick={() => document.getElementById('image-upload').click()}
                          className="w-10 h-10 rounded-xl bg-white text-gray-900 flex items-center justify-center shadow-lg"
                         >
                            <RefreshCw size={18} />
                         </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 p-4 text-center">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Upload size={20} className="text-pink-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-500">Kéo thả ảnh hoặc Click</p>
                        <p className="text-[9px] font-bold text-gray-400 mt-0.5">Tối đa 10MB</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => document.getElementById('image-upload').click()}
                        className="px-4 py-1.5 mt-1 bg-pink-50 text-pink-600 rounded-lg text-[10px] font-bold border border-pink-200"
                      >
                        Chọn ảnh
                      </button>
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                      <Loader2 size={24} className="text-pink-500 animate-spin mb-2" />
                      <span className="text-[10px] font-black uppercase text-pink-600">Đang tải lên...</span>
                    </div>
                  )}
                  <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Hoặc URL ảnh</label>
                  <Input
                    name="image_url"
                    value={product.image_url}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="bg-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải */}
          <div className="space-y-4 md:space-y-6">
            {/* Kinh doanh */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-emerald-500" />
                <span className="text-sm font-black uppercase text-gray-700">Thông số kinh doanh</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Giá gốc *</label>
                    <div className="relative">
                      <Input
                        name="price"
                        type="number"
                        value={product.price}
                        onChange={handleInputChange}
                        required
                        className="bg-white font-bold text-emerald-600 pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">VNĐ</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Giá khuyến mãi</label>
                    <div className="relative">
                      <Input
                        name="discount_price"
                        type="number"
                        value={product.discount_price}
                        onChange={handleInputChange}
                        className="bg-white font-bold text-red-600 pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">VNĐ</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Số lượng tồn kho</label>
                  <Input
                    name="inventory"
                    type="number"
                    value={product.inventory}
                    onChange={handleInputChange}
                    placeholder="Không giới hạn"
                    className="bg-white"
                  />
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Sản phẩm nổi bật</label>
                   <div 
                    onClick={() => handleInputChange({ target: { name: 'is_special', checked: !product.is_special, type: 'checkbox' } })}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${product.is_special ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}
                   >
                     <div className="flex items-center gap-2">
                        <Star size={16} className={product.is_special ? 'text-amber-500 fill-amber-500' : 'text-gray-400'} />
                        <span className={`text-[10px] font-black uppercase ${product.is_special ? 'text-amber-700' : 'text-gray-500'}`}>
                          Đánh dấu Bán Chạy/Hot
                        </span>
                     </div>
                     <div className={`w-4 h-4 rounded border flex items-center justify-center ${product.is_special ? 'border-amber-500 bg-amber-500' : 'border-gray-300'}`}>
                        {product.is_special && <CheckCircle size={10} className="text-white" />}
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Cấu hình hệ thống */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Settings size={18} className="text-purple-500" />
                <span className="text-sm font-black uppercase text-gray-700">Cấu hình hệ thống</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Danh mục *</label>
                  <select
                    name="category_id"
                    value={product.category_id}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    required
                  >
                    <option value="">-- CHỌN DANH MỤC --</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Trạng thái hiển thị</label>
                  <select
                    name="status"
                    value={product.status}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    <option value="active">Đang kinh doanh</option>
                    <option value="inactive">Tạm ngưng bán</option>
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
