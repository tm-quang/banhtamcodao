// src/components/RegisterForm.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, Users } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function RegisterForm({ onSwitchToLogin }) {
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Mật khẩu nhập lại không khớp.');
            return;
        }
        if (!agreedToTerms) {
            setError('Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
            return;
        }

        if (!email && !phoneNumber) {
            setError('Vui lòng nhập Email hoặc Số điện thoại.');
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, phoneNumber, password, email, gender }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Lỗi kết nối server' }));
                setError(errorData.message || `Lỗi ${res.status}: ${res.statusText}`);
                return;
            }

            const data = await res.json();

            if (data.success) {
                // Hiển thị toast thành công
                showToast('Đăng ký thành công!', 'success');
                
                // Hiển thị toast đang chuyển trang
                setTimeout(() => {
                    showToast('Đang chuyển trang về đăng nhập...', 'info');
                }, 500);
                
                // Chuyển trang sau 1.5 giây
                setTimeout(() => {
                    if (onSwitchToLogin) {
                        onSwitchToLogin();
                    } else {
                        router.push('/login');
                    }
                }, 1500);
            } else {
                setError(data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
                showToast(data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.', 'error');
            }
        } catch (error) {
            console.error('Register error:', error);
            const errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        }
    };

    return (
        <div className="w-full max-w-md space-y-5">
            <h2 className="text-3xl font-bold text-center text-secondary">
                Đăng ký tài khoản
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Họ tên */}
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <User className="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="Nhập họ tên"
                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50"
                    />
                </div>

                {/* Số điện thoại */}
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <Phone className="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        placeholder="Nhập số điện thoại"
                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50"
                    />
                </div>

                {/* Email */}
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email"
                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50"
                    />
                </div>

                {/* Giới tính */}
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <Users className="h-5 w-5 text-gray-400" />
                    </span>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 appearance-none"
                    >
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                    </select>
                </div>

                {/* Mật khẩu */}
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Nhập mật khẩu"
                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50"
                    />
                </div>

                {/* Nhập lại mật khẩu */}
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Nhập lại mật khẩu"
                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50"
                    />
                </div>

                {/* Điều khoản */}
                <div className="flex items-start gap-3">
                    <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="h-5 w-5 mt-0.5 text-primary focus:ring-primary border-gray-300 rounded-lg cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                        Tôi đã đọc và đồng ý với{' '}
                        <Link href="/terms" className="font-semibold text-primary hover:underline">
                            Điều khoản dịch vụ
                        </Link>{' '}và{' '}
                        <Link href="/privacy" className="font-semibold text-primary hover:underline">
                            Chính sách bảo mật
                        </Link>.
                    </label>
                </div>

                {error && <p className="text-sm text-red-600 text-center py-2 px-4 bg-red-50 rounded-xl">{error}</p>}
                {success && <p className="text-sm text-green-600 text-center py-2 px-4 bg-green-50 rounded-xl">{success}</p>}

                <div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-primary/90 transition-all text-lg shadow-lg shadow-primary/20"
                    >
                        Đăng ký
                    </button>
                </div>
            </form>
        </div>
    );
}