/**
 * src/app/auth/callback/page.js
 * Page để xử lý OAuth callback từ Supabase (khi redirect về với hash fragment)
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

                if (!supabaseUrl || !supabaseAnonKey) {
                    throw new Error('Cấu hình Supabase chưa đầy đủ');
                }

                const supabase = createClient(supabaseUrl, supabaseAnonKey, {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true
                    }
                });

                // Kiểm tra hash fragment trước
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const errorParam = hashParams.get('error');
                const errorDescription = hashParams.get('error_description');

                if (errorParam) {
                    throw new Error(errorDescription || errorParam);
                }

                // Nếu có access_token trong hash, xử lý trực tiếp
                if (accessToken) {
                    const refreshToken = hashParams.get('refresh_token');
                    
                    if (refreshToken) {
                        // Set session từ hash fragment
                        const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        });
                        
                        if (setSessionError) {
                            console.error('Set session error:', setSessionError);
                            throw setSessionError;
                        }
                        
                        if (sessionData.session) {
                            // Có session rồi, tiếp tục xử lý
                            await processSession(sessionData.session);
                            return;
                        }
                    }
                }

                // Lấy session (nếu Supabase đã tự động xử lý)
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    throw sessionError;
                }

                if (!session) {
                    // Không có session và không có token, redirect về login
                    console.warn('No session found after processing hash fragment');
                    router.push('/login?error=no_session');
                    return;
                }

                // Có session, xử lý
                await processSession(session);

                async function processSession(session) {

                    // Có session, gửi đến server để tạo customer record và set cookies
                    try {
                        const response = await fetch('/api/auth/callback', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                access_token: session.access_token,
                                refresh_token: session.refresh_token,
                            }),
                        });

                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({}));
                            console.error('Callback API error:', errorData);
                            
                            // Nếu lỗi là về customer creation, vẫn cho phép đăng nhập
                            // nhưng hiển thị warning
                            if (errorData.message?.includes('khách hàng') || errorData.message?.includes('customer')) {
                                console.warn('Customer record creation failed, but user is logged in');
                                // Vẫn redirect về trang chủ
                                redirectToHome();
                                return;
                            }
                            
                            throw new Error(errorData.message || 'Không thể tạo session');
                        }

                        const result = await response.json();
                        console.log('Callback API success:', result);

                        // Redirect về trang chủ
                        redirectToHome();
                    } catch (fetchError) {
                        console.error('Error calling callback API:', fetchError);
                        // Nếu API call fail, vẫn redirect về trang chủ
                        // Session đã được lưu trong Supabase client
                        redirectToHome();
                    }
                }

                function redirectToHome() {
                    // Xóa hash fragment để tránh reload lại
                    window.history.replaceState(null, '', window.location.pathname);
                    // Redirect về trang chủ
                    window.location.href = '/';
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                setError(err.message || 'Có lỗi xảy ra khi xử lý đăng nhập');
                setLoading(false);
            }
        };

        handleAuthCallback();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang xử lý đăng nhập...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                    >
                        Quay lại đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
