import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { 
  MessageSquare, Star, CheckCircle, Loader2, UserCircle,
  Quote, Settings
} from 'lucide-react';

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
        disabled={isSubmitting || !data.customer_name || !data.content}
        className={`flex items-center justify-center gap-2 h-9 !rounded-xl px-7 font-black text-[10px] uppercase tracking-widest text-white shadow-md transition-all ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
      >
        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
        {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Thêm đánh giá')}
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
            <MessageSquare size={22} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-gray-900 block">
              {isEditMode ? 'Sửa đánh giá' : 'Thêm đánh giá'}
            </span>
            <p className="text-xs text-gray-600 font-medium">
              {isEditMode ? `Đang cập nhật đánh giá` : 'Thiết lập nội dung phản hồi'}
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
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle size={18} className="text-blue-600" />
                <span className="text-sm font-black uppercase text-gray-700">Thông tin phản hồi</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Tên khách hàng *</label>
                  <Input
                    name="customer_name"
                    value={data.customer_name}
                    onChange={handleChange}
                    placeholder="VD: Nguyễn Văn A"
                    required
                    className="bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Xếp hạng đánh giá</label>
                  <select
                    name="rating"
                    value={data.rating}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Sao)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Sao)</option>
                    <option value="3">⭐⭐⭐ (3 Sao)</option>
                    <option value="2">⭐⭐ (2 Sao)</option>
                    <option value="1">⭐ (1 Sao)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Nội dung phản hồi *</label>
                  <textarea
                    name="content"
                    value={data.content}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Nhập nội dung đánh giá..."
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none italic"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải */}
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Settings size={18} className="text-emerald-500" />
                <span className="text-sm font-black uppercase text-gray-700">Cấu hình hiển thị</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Trạng thái</label>
                    <select
                      name="status"
                      value={data.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-emerald-500 outline-none"
                    >
                      <option value="active">Công khai</option>
                      <option value="inactive">Tạm ẩn</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Thứ tự hiển thị</label>
                    <Input
                      name="display_order"
                      type="number"
                      value={data.display_order}
                      onChange={handleChange}
                      placeholder="0"
                      className="bg-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Dialog>
  );
}
