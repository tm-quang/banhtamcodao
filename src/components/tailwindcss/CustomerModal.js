import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { 
  User, Mail, Phone, CheckCircle, 
  Layout, Lock, UserCircle, Globe, Settings, Loader2
} from 'lucide-react';

export default function CustomerModal({ open, onClose, onSave, customerToEdit }) {
  const [data, setData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    role: 'customer',
    status: 'active',
    gender: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(customerToEdit);

  useEffect(() => {
    if (open) {
      if (customerToEdit) {
        setData({
          full_name: customerToEdit.full_name || '',
          username: customerToEdit.username || '',
          email: customerToEdit.email || '',
          phone_number: customerToEdit.phone_number || '',
          password: '',
          role: customerToEdit.role || 'customer',
          status: customerToEdit.status || 'active',
          gender: customerToEdit.gender || ''
        });
      } else {
        setData({
          full_name: '',
          username: '',
          email: '',
          phone_number: '',
          password: '',
          role: 'customer',
          status: 'active',
          gender: ''
        });
      }
      setErrors({});
    }
  }, [open, customerToEdit]);

  const validate = () => {
    const newErrors = {};
    if (!data.full_name.trim()) newErrors.full_name = 'Vui lòng nhập họ tên';
    if (!isEditMode && !data.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (data.password && data.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!isEditMode && !data.username?.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'Email không hợp lệ';
    if (data.phone_number && !/^[0-9]{10,11}$/.test(data.phone_number.replace(/\s/g, ''))) newErrors.phone_number = 'Số điện thoại không hợp lệ';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        full_name: data.full_name,
        email: data.email || null,
        phone_number: data.phone_number || null,
        gender: data.gender || null,
        role: data.role || 'customer',
        status: data.status || 'active'
      };
      if (!isEditMode) {
        if (data.username) submitData.username = data.username;
        if (data.password) submitData.password = data.password;
      }
      if (isEditMode && customerToEdit?.id) submitData.id = customerToEdit.id;
      await onSave(submitData);
    } catch (error) {
      console.error('Error saving customer:', error);
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
        disabled={isSubmitting || !data.full_name}
        className={`flex items-center justify-center gap-2 h-9 !rounded-xl px-7 font-black text-[10px] uppercase tracking-widest text-white shadow-md transition-all ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
      >
        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
        {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo tài khoản')}
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
            <UserCircle size={22} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-gray-900 block">
              {isEditMode ? 'Hồ sơ khách hàng' : 'Thêm thành viên mới'}
            </span>
            <p className="text-xs text-gray-600 font-medium">
              {isEditMode ? `Đang cập nhật: #${customerToEdit?.id}` : 'Thiết lập tài khoản hệ thống'}
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
                <span className="text-sm font-black uppercase text-gray-700">Thông tin cá nhân</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Họ và tên *</label>
                  <Input
                    name="full_name"
                    value={data.full_name}
                    onChange={handleChange}
                    error={errors.full_name}
                    required
                    placeholder="VD: Nguyễn Văn An"
                    className="bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">{isEditMode ? 'Tên đăng nhập (Cố định)' : 'Tên đăng nhập *'}</label>
                  <Input
                    name="username"
                    value={data.username}
                    onChange={handleChange}
                    error={errors.username}
                    disabled={isEditMode}
                    required={!isEditMode}
                    placeholder="VD: an.nguyen"
                    className={`bg-white font-mono text-blue-600 ${isEditMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={18} className="text-purple-500" />
                <span className="text-sm font-black uppercase text-gray-700">Bảo mật & Phân quyền</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">{isEditMode ? 'Mật khẩu mới' : 'Mật khẩu *'}</label>
                  <Input
                    name="password"
                    type="password"
                    value={data.password}
                    onChange={handleChange}
                    error={errors.password}
                    required={!isEditMode}
                    placeholder="••••••••"
                    className="bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Vai trò hệ thống</label>
                  <select
                    name="role"
                    value={data.role}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-purple-500 outline-none"
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải */}
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={18} className="text-emerald-500" />
                <span className="text-sm font-black uppercase text-gray-700">Thông tin liên lạc</span>
              </div>
              <div className="space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="example@gmail.com"
                    className="bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Số điện thoại</label>
                  <Input
                    name="phone_number"
                    value={data.phone_number}
                    onChange={handleChange}
                    error={errors.phone_number}
                    placeholder="09..."
                    className="bg-white font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Settings size={18} className="text-amber-500" />
                <span className="text-sm font-black uppercase text-gray-700">Cấu hình</span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-300">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Trạng thái</label>
                  <select
                    name="status"
                    value={data.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-amber-500 outline-none"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Tạm khóa</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Giới tính</label>
                  <select
                    name="gender"
                    value={data.gender}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold bg-white focus:border-amber-500 outline-none"
                  >
                    <option value="">Chưa xác định</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
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
