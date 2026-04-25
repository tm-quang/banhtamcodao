// src/components/LoginForm.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Lock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/context/ToastContext';

export default function LoginForm() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    useEffect(() => {
        const errorParam = searchParams?.get('error');
        if (errorParam) {
            setError(decodeURIComponent(errorParam));
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Lỗi kết nối server' }));
                setError(errorData.message || `Lỗi ${res.status}: ${res.statusText}`);
                return;
            }

            const data = await res.json();

            if (data.success) {
                // Hiển thị toast thành công
                showToast('Đăng nhập thành công!', 'success');
                
                // Lấy tham số 'next' từ URL để redirect sau khi đăng nhập
                const nextParam = searchParams?.get('next');
                const redirectTo = nextParam || '/';
                
                // Chờ một chút để toast hiển thị trước khi redirect
                setTimeout(() => {
                    window.location.href = redirectTo;
                }, 500);
            } else {
                const errorMessage = data.message || 'Có lỗi xảy ra, vui lòng thử lại.';
                setError(errorMessage);
                showToast(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider) => {
        setError('');
        setOauthLoading(provider);

        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseAnonKey) {
                setError('Cấu hình OAuth chưa đầy đủ. Vui lòng liên hệ quản trị viên.');
                setOauthLoading(null);
                return;
            }

            const supabase = createClient(supabaseUrl, supabaseAnonKey);
            
            // Lấy base URL: ưu tiên environment variable (production), fallback về window.location.origin
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
            const redirectTo = `${baseUrl}/auth/callback`;
            
            console.log('OAuth redirect URL:', redirectTo);

            const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: provider.toLowerCase(),
                options: {
                    redirectTo: redirectTo,
                    queryParams: provider.toLowerCase() === 'google' ? {
                        access_type: 'offline',
                        prompt: 'consent',
                    } : {}
                }
            });

            if (oauthError) {
                setError(`Không thể đăng nhập bằng ${provider}. ${oauthError.message || ''}`);
                setOauthLoading(null);
                return;
            }

            if (data?.url) {
                window.location.href = data.url;
            } else {
                setError(`Không thể lấy URL đăng nhập ${provider}.`);
                setOauthLoading(null);
            }
        } catch (err) {
            console.error('OAuth login error:', err);
            setError(`Lỗi khi đăng nhập bằng ${provider}. Vui lòng thử lại sau.`);
            setOauthLoading(null);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[50vh] md:min-h-0">
            <div className="w-full max-w-md p-0 space-y-6">
                <h2 className="text-3xl font-bold text-center text-secondary">
                    Đăng nhập
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                            <User className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            placeholder="Số điện thoại hoặc email"
                            className="block w-full border border-gray-200 rounded-xl shadow-sm py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50"
                        />
                    </div>
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
                    {error && <p className="text-md text-red-600 text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-primary/90 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>

                {/* OAuth Login Section */}
                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-gray-500">Hoặc đăng nhập bằng</span>
                        </div>
                    </div>

                    {/* Google Login Button */}
                    <button
                        type="button"
                        onClick={() => handleOAuthLogin('google')}
                        disabled={oauthLoading !== null}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                            {oauthLoading === 'google' ? 'Đang đăng nhập...' : 'Đăng nhập bằng Google'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}