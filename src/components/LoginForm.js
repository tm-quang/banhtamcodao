// src/components/LoginForm.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock } from 'lucide-react';

export default function LoginForm() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
        });

        const data = await res.json();

        if (data.success) {
            // Sửa logic: Luôn chuyển hướng về trang chủ
            // và sau đó tải lại toàn bộ trang để đảm bảo mọi Context được cập nhật
            window.location.href = '/';
        } else {
            setError(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh] md:min-h-0">
            <div className="w-full max-w-md p-0 space-y-8 bg-white rounded-2xl">
                <h2 className="text-3xl font-bold text-center text-secondary">
                    Đăng nhập
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <User className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            placeholder="Tên đăng nhập hoặc số điện thoại"
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-3 pl-10 pr-4 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Nhập mật khẩu"
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-3 pl-10 pr-4 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-black text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-800 transition-colors text-lg"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}