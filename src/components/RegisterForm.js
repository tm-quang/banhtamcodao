// src/components/RegisterForm.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone } from 'lucide-react'; // Thêm icon Phone
import Link from 'next/link';

export default function RegisterForm({ onSwitchToLogin }) {
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); // Thêm state cho SĐT
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

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

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Thêm phoneNumber vào body
            body: JSON.stringify({ fullName, phoneNumber, username, password, email }),
        });

        const data = await res.json();

        if (data.success) {
            setSuccess('Đăng ký thành công! Chuyển đến trang đăng nhập...');
            setTimeout(() => {
                if(onSwitchToLogin) {
                    onSwitchToLogin();
                } else {
                    router.push('/login');
                }
            }, 2000);
        } else {
            setError(data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    return (
        <div className="w-full max-w-md space-y-4">
            <h2 className="text-3xl font-bold text-center text-secondary">
                Đăng ký tài khoản
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Sắp xếp lại các trường theo yêu cầu */}
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><User className="h-5 w-5 text-gray-400" /></span>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Nhập họ tên"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-3 pl-10 pr-4 focus:ring-primary focus:border-primary" />
                </div>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Phone className="h-5 w-5 text-gray-400" /></span>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required placeholder="Nhập số điện thoại"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-3 pl-10 pr-4 focus:ring-primary focus:border-primary" />
                </div>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><User className="h-5 w-5 text-gray-400" /></span>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Nhập tên đăng nhập"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-3 pl-10 pr-4 focus:ring-primary focus:border-primary" />
                </div>
                <div className="relative">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-5 w-5 text-gray-400" /></span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email (không bắt buộc)"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-3 pl-10 pr-4 focus:ring-primary focus:border-primary" />
                </div>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-5 w-5 text-gray-400" /></span>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Nhập mật khẩu"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-3 pl-10 pr-4 focus:ring-primary focus:border-primary" />
                </div>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-5 w-5 text-gray-400" /></span>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Nhập lại mật khẩu"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-3 pl-10 pr-4 focus:ring-primary focus:border-primary" />
                </div>

                <div className="flex items-center">
                    <input id="terms" name="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                        Tôi đã đọc và đồng ý với 
                        <Link href="/terms" className="font-medium text-accent hover:underline"> Điều khoản dịch vụ</Link> và 
                        <Link href="/privacy" className="font-medium text-accent hover:underline"> Chính sách bảo mật</Link>.
                    </label>
                </div>

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                {success && <p className="text-sm text-green-600 text-center">{success}</p>}
                
                <div>
                    <button type="submit" className="w-full bg-white text-black border border-black font-semibold py-3 px-6 rounded-md hover:bg-primary hover:text-white hover:border-primary transition-colors text-lg">
                        Đăng ký
                    </button>
                </div>
            </form>
        </div>
    );
}