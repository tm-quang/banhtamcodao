/**
 * CustomerModal component với Tailwind CSS - Premium UI
 * @file src/components/tailwindcss/CustomerModal.js
 */
'use client';

import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { 
  User, Mail, Phone, Shield, CheckCircle, X, 
  Layout, ShieldCheck, Zap, Star, Loader2, Sparkles,
  Lock, UserCircle, Globe, Settings
} from 'lucide-react';

const SectionHeader = ({ icon: Icon, title, color = '#06b6d4', subtitle }) => (
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
    <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3 w-full">
      <Button
        onClick={onClose}
        className="flex-1 md:flex-none flex items-center justify-center h-10 md:h-11 !rounded-xl md:!rounded-2xl border border-gray-200 bg-gray-500 text-white hover:bg-gray-600 font-black uppercase text-[10px] md:text-[11px] tracking-widest px-2 md:px-6 transition-all whitespace-nowrap"
      >
        Hủy bỏ
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !data.full_name}
        startIcon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
        className="flex-1 md:flex-none flex items-center justify-center h-10 md:h-11 !rounded-xl md:!rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest px-2 md:px-8 shadow-md shadow-orange-100 transition-all whitespace-nowrap"
      >
        {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật ngay' : 'Tạo tài khoản')}
      </Button>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-3 md:gap-4 py-1">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg rotate-3 transition-transform hover:rotate-0 flex-shrink-0 ${isEditMode ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200/50' : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200/50'}`}>
            <UserCircle className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-black text-gray-900 text-lg md:text-2xl tracking-tight block uppercase truncate">
              {isEditMode ? 'Hồ sơ khách hàng' : 'Thêm thành viên mới'}
            </span>
            <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse flex-shrink-0 ${isEditMode ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <p className="text-[9px] md:text-[11px] text-gray-400 font-black uppercase tracking-widest md:tracking-[0.2em] truncate">
                {isEditMode ? `ĐANG CHỈNH SỬA ID: #${customerToEdit?.id}` : 'THIẾT LẬP TÀI KHOẢN MỚI'}
              </p>
            </div>
          </div>
        </div>
      }
      footer={footer}
    >
      <div className="space-y-6 md:space-y-10 pb-2 md:pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          
          {/* Cột trái: Thông tin định danh */}
          <div className="space-y-6 md:space-y-10">
            <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-gray-300 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <SectionHeader icon={User} title="Thông tin cá nhân" subtitle="Họ tên và định danh tài khoản" color="#2563eb" />
              <div className="space-y-6 relative z-10">
                <Input
                  label="Họ và tên khách hàng *"
                  name="full_name"
                  value={data.full_name}
                  onChange={handleChange}
                  error={errors.full_name}
                  required
                  placeholder="VD: Nguyễn Văn An"
                  className="!rounded-2xl border-gray-300 font-black bg-gray-50/30 py-4 shadow-inner text-lg"
                />
                <Input
                  label={isEditMode ? "Tên đăng nhập (Cố định)" : "Tên đăng nhập *"}
                  name="username"
                  value={data.username}
                  onChange={handleChange}
                  error={errors.username}
                  disabled={isEditMode}
                  required={!isEditMode}
                  placeholder="VD: an.nguyen"
                  className={`!rounded-2xl border-gray-300 font-bold bg-gray-50/30 py-4 shadow-inner font-mono text-blue-600 ${isEditMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-gray-300 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <SectionHeader icon={Lock} title="Bảo mật & Phân quyền" subtitle="Thiết lập mật khẩu và vai trò" color="#8b5cf6" />
              <div className="space-y-6 relative z-10">
                <Input
                  label={isEditMode ? "Mật khẩu mới (Nếu có)" : "Mật khẩu tài khoản *"}
                  name="password"
                  type="password"
                  value={data.password}
                  onChange={handleChange}
                  error={errors.password}
                  required={!isEditMode}
                  placeholder="••••••••"
                  className="!rounded-2xl border-gray-300 font-bold bg-gray-50/30 py-4 shadow-inner"
                  helperText={isEditMode ? "Để trống nếu không muốn thay đổi mật khẩu hiện tại" : "Mật khẩu tối thiểu 6 ký tự"}
                />
                <div>
                  <label className="block text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 ml-1">Vai trò hệ thống</label>
                  <select
                    name="role"
                    value={data.role}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-purple-50/50 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="customer">KHÁCH HÀNG (CUSTOMER)</option>
                    <option value="admin">QUẢN TRỊ VIÊN (ADMIN)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Liên lạc & Trạng thái */}
          <div className="space-y-6 md:space-y-10">
            <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-gray-300 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <SectionHeader icon={Globe} title="Thông tin liên lạc" subtitle="Email và số điện thoại liên hệ" color="#10b981" />
              <div className="space-y-6 relative z-10">
                <Input
                  label="Địa chỉ Email"
                  name="email"
                  type="email"
                  value={data.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="example@gmail.com"
                  className="!rounded-2xl border-gray-300 font-bold bg-gray-50/30 py-4 shadow-inner"
                  prefix={<Mail size={16} className="text-gray-400 ml-4 mr-2" />}
                />
                <Input
                  label="Số điện thoại"
                  name="phone_number"
                  value={data.phone_number}
                  onChange={handleChange}
                  error={errors.phone_number}
                  placeholder="09xxx..."
                  className="!rounded-2xl border-gray-300 font-bold bg-gray-50/30 py-4 shadow-inner"
                  prefix={<Phone size={16} className="text-gray-400 ml-4 mr-2" />}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-gray-300 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <SectionHeader icon={Settings} title="Cấu hình tài khoản" subtitle="Trạng thái và các thiết lập khác" color="#f59e0b" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative z-10">
                <div>
                  <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 ml-1">Trạng thái hoạt động</label>
                  <select
                    name="status"
                    value={data.status}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-amber-50/50 focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="active">ĐANG HOẠT ĐỘNG</option>
                    <option value="inactive">TẠM KHÓA / NGỪNG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 ml-1">Giới tính</label>
                  <select
                    name="gender"
                    value={data.gender}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-300 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="">CHƯA XÁC ĐỊNH</option>
                    <option value="male">NAM</option>
                    <option value="female">NỮ</option>
                    <option value="other">KHÁC</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-gradient-to-br from-indigo-50 to-blue-100 border border-blue-200 shadow-sm flex items-center gap-4 group hover:bg-blue-100 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Sparkles size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-black text-blue-800 uppercase tracking-wider">Hỗ trợ khách hàng</p>
                <p className="text-[11px] font-bold text-blue-600/70 uppercase tracking-tighter mt-0.5">Tài khoản này có thể tham gia tích điểm và nhận ưu đãi từ hệ thống.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Dialog>
  );
}
