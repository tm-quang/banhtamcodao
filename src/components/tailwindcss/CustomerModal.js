/**
 * CustomerModal component với Tailwind CSS
 */
'use client';
import { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { User, Mail, Phone, Shield, CheckCircle, X } from 'lucide-react';

const SectionHeader = ({ icon: Icon, title, color = '#06b6d4' }) => (
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
    
    if (!data.full_name.trim()) {
      newErrors.full_name = 'Vui lòng nhập họ tên';
    }
    
    if (!isEditMode && !data.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (data.password && data.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!isEditMode && !data.username?.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (data.phone_number && !/^[0-9]{10,11}$/.test(data.phone_number.replace(/\s/g, ''))) {
      newErrors.phone_number = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

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
      
      // Chỉ thêm username và password khi tạo mới
      if (!isEditMode) {
        if (data.username) submitData.username = data.username;
        if (data.password) submitData.password = data.password;
      }
      
      // Thêm id nếu là edit mode
      if (isEditMode && customerToEdit?.id) {
        submitData.id = customerToEdit.id;
      }
      
      await onSave(submitData);
    } catch (error) {
      console.error('Error saving customer:', error);
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <User size={22} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-black text-gray-900 block">
              {isEditMode ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
            </span>
            <p className="text-xs text-gray-500 font-medium truncate">
              {isEditMode ? `ID: #${customerToEdit?.id}` : 'Tạo tài khoản mới cho khách hàng'}
            </p>
          </div>
        </div>
      }
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Thông tin cơ bản */}
        <div>
          <SectionHeader icon={User} title="Thông tin cá nhân" color="#0ea5e9" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Họ và tên *"
              name="full_name"
              value={data.full_name}
              onChange={handleChange}
              error={errors.full_name}
              required
              placeholder="VD: Nguyễn Văn A"
              className="font-bold"
            />
            <Input
              label={isEditMode ? "Tên đăng nhập (Khóa)" : "Tên đăng nhập *"}
              name="username"
              value={data.username}
              onChange={handleChange}
              error={errors.username}
              disabled={isEditMode}
              required={!isEditMode}
              placeholder="username"
              className="bg-gray-50 font-mono text-blue-600"
            />
            <Input
              label="Địa chỉ Email"
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
              error={errors.email}
              startIcon={<Mail size={16} />}
              placeholder="example@gmail.com"
            />
            <Input
              label="Số điện thoại"
              name="phone_number"
              value={data.phone_number}
              onChange={handleChange}
              error={errors.phone_number}
              startIcon={<Phone size={16} />}
              placeholder="09xxx..."
            />
          </div>
        </div>

        {/* Mật khẩu */}
        <div>
          <SectionHeader icon={Shield} title="Bảo mật tài khoản" color="#8b5cf6" />
          <div className="p-5 bg-purple-50/30 rounded-2xl border border-purple-100">
            <Input
              label={isEditMode ? "Mật khẩu mới (Nếu có)" : "Thiết lập mật khẩu *"}
              name="password"
              type="password"
              value={data.password}
              onChange={handleChange}
              error={errors.password}
              required={!isEditMode}
              helperText={isEditMode ? 'Để trống nếu không muốn thay đổi mật khẩu hiện tại' : 'Tối thiểu 6 ký tự để đảm bảo an toàn'}
            />
          </div>
        </div>

        {/* Cài đặt */}
        <div>
          <SectionHeader icon={Shield} title="Phân quyền & Trạng thái" color="#10b981" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700">
                Vai trò hệ thống
              </label>
              <select
                name="role"
                value={data.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-md font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
                <option value="customer">Khách hàng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700">
                Trạng thái hoạt động
              </label>
              <select
                name="status"
                value={data.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-md font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm khóa</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700">
                Giới tính
              </label>
              <select
                name="gender"
                value={data.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-md font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
                <option value="">Chưa xác định</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

