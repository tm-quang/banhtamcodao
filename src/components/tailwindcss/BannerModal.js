import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { 
  Image as ImageIcon, CheckCircle, Loader2, Link as LinkIcon, 
  Type, Hash, Zap, Layout
} from 'lucide-react';

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
        disabled={isSubmitting}
        className={`flex items-center justify-center gap-2 h-9 !rounded-xl px-7 font-black text-[10px] uppercase tracking-widest text-white shadow-md transition-all ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
      >
        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
        {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo Banner')}
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
            <ImageIcon size={22} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-gray-900 block">
              {isEditMode ? 'Sửa nội dung Banner' : 'Thêm Banner mới'}
            </span>
            <p className="text-xs text-gray-600 font-medium">
              {isEditMode ? `Đang cập nhật: #${bannerToEdit?.id}` : 'Thiết lập quảng cáo mới'}
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
                <Type size={18} className="text-blue-600" />
                <span className="text-sm font-black uppercase text-gray-700">Thông tin nội dung</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Tiêu đề Banner</label>
                  <Input
                    name="title"
                    value={data.title || ''}
                    onChange={handleChange}
                    placeholder="VD: Khuyến mãi mùa hè"
                    className="bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Đường dẫn ảnh (URL) *</label>
                  <Input
                    name="image_url"
                    value={data.image_url || ''}
                    onChange={handleChange}
                    placeholder="https://..."
                    required
                    className="bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Đường dẫn khi click (Link)</label>
                  <Input
                    name="link"
                    value={data.link || ''}
                    onChange={handleChange}
                    placeholder="/menu hoặc https://..."
                    className="bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Layout size={18} className="text-pink-500" />
                <span className="text-sm font-black uppercase text-gray-700">Xem trước hình ảnh</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-white flex items-center justify-center">
                  {data.image_url ? (
                    <img src={data.image_url} alt="Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                      <span className="text-[10px] font-black uppercase">Chưa có hình ảnh</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải */}
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-purple-500" />
                <span className="text-sm font-black uppercase text-gray-700">Cấu hình hiển thị</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Thiết bị hiển thị</label>
                  <select
                    name="device"
                    value={data.device || 'all'}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-purple-500 outline-none"
                  >
                    <option value="all">Tất cả thiết bị</option>
                    <option value="desktop">Chỉ Máy tính (Desktop)</option>
                    <option value="mobile">Chỉ Điện thoại (Mobile)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Thứ tự ưu tiên</label>
                    <Input
                      name="display_order"
                      type="number"
                      value={data.display_order || 0}
                      onChange={handleChange}
                      className="bg-white font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Trạng thái</label>
                    <select
                      name="is_active"
                      value={data.is_active === false ? "false" : "true"}
                      onChange={(e) => setData(prev => ({ ...prev, is_active: e.target.value === "true" }))}
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-purple-500 outline-none"
                    >
                      <option value="true">Kích hoạt</option>
                      <option value="false">Tạm ngưng</option>
                    </select>
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
