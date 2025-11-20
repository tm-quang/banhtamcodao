// src/components/QuickLogin.js
'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function QuickLogin() {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 p-6 text-secondary animate-slideInRight" onClick={(e) => e.stopPropagation()}>
            {isLoginView ? (
                <>
                    <LoginForm />
                    <p className="text-center text-sm mt-4">
                        Chưa có tài khoản?{' '}
                        <button onClick={() => setIsLoginView(false)} className="font-semibold text-primary hover:underline">
                            Đăng ký ngay
                        </button>
                    </p>
                </>
            ) : (
                <>
                    <RegisterForm onSwitchToLogin={() => setIsLoginView(true)} />
                     <p className="text-center text-sm mt-4">
                        Đã có tài khoản?{' '}
                        <button onClick={() => setIsLoginView(true)} className="font-semibold text-primary hover:underline">
                            Đăng nhập
                        </button>
                    </p>
                </>
            )}
        </div>
    );
}