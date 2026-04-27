import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { 
  Users, Info, Award, TrendingUp, Settings, 
  CheckCircle, Loader2, Sparkles, Layout, Zap, Hash
} from 'lucide-react';

export default function CustomerGroupModal({ open, onClose, onSave, groupToEdit }) {
    const [group, setGroup] = useState({
        name: '',
        description: '',
        min_points: 0,
        points_per_amount: 1000,
        display_order: 0,
        is_active: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = Boolean(groupToEdit);

    useEffect(() => {
        if (open) {
            setGroup(groupToEdit
                ? { ...groupToEdit }
                : {
                    name: '',
                    description: '',
                    min_points: 0,
                    points_per_amount: 1000,
                    display_order: 0,
                    is_active: true
                }
            );
        }
    }, [open, groupToEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGroup(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
        }));
    };

    const handleSave = async () => {
        if (!group.name) return;
        setIsSubmitting(true);
        try {
          await onSave(group);
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
          disabled={isSubmitting || !group.name}
          className={`flex items-center justify-center gap-2 h-9 !rounded-xl px-7 font-black text-[10px] uppercase tracking-widest text-white shadow-md transition-all ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo nhóm')}
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
                    <Users size={22} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-gray-900 block">
                      {isEditMode ? 'Sửa nhóm khách' : 'Thêm nhóm khách'}
                    </span>
                    <p className="text-xs text-gray-600 font-medium">
                      {isEditMode ? `Đang cập nhật: ${groupToEdit?.name}` : 'Thiết lập phân hạng thành viên'}
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
                        <Layout size={18} className="text-blue-600" />
                        <span className="text-sm font-black uppercase text-gray-700">Thông tin định danh</span>
                      </div>
                      <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Tên nhóm khách hàng *</label>
                          <Input
                            name="name"
                            value={group.name}
                            onChange={handleChange}
                            placeholder="VD: VIP, Thành viên..."
                            required
                            className="bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Mô tả đặc quyền</label>
                          <textarea
                            name="description"
                            value={group.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Quyền lợi đặc biệt..."
                            className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cột phải */}
                  <div className="space-y-4 md:space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={18} className="text-amber-500" />
                        <span className="text-sm font-black uppercase text-gray-700">Chính sách tích lũy</span>
                      </div>
                      <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Điểm tích lũy tối thiểu *</label>
                          <Input
                            name="min_points"
                            type="number"
                            value={group.min_points}
                            onChange={handleChange}
                            required
                            className="bg-white font-bold text-amber-600"
                            startIcon={<Award size={14} className="text-amber-500" />}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Tỷ lệ tích điểm *</label>
                            <Input
                              name="points_per_amount"
                              type="number"
                              value={group.points_per_amount}
                              onChange={handleChange}
                              required
                              className="bg-white font-bold"
                              startIcon={<Zap size={14} className="text-blue-500" />}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Thứ tự hiển thị</label>
                            <Input
                              name="display_order"
                              type="number"
                              value={group.display_order}
                              onChange={handleChange}
                              className="bg-white font-bold"
                              startIcon={<Hash size={14} className="text-gray-400" />}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings size={18} className="text-emerald-500" />
                        <span className="text-sm font-black uppercase text-gray-700">Trạng thái</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${group.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'} transition-colors`}>
                                <CheckCircle size={16} />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-gray-800 uppercase">Đang hoạt động</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="is_active"
                                checked={group.is_active}
                                onChange={handleChange}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
            </div>
        </Dialog>
    );
}
