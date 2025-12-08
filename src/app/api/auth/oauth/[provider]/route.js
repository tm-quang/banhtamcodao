/**
 * src/app/api/auth/oauth/[provider]/route.js
 * API route để khởi tạo OAuth flow cho Google và Facebook
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request, { params }) {
    try {
        const { provider } = params;
        
        // Chỉ cho phép Google và Facebook
        const allowedProviders = ['google', 'facebook'];
        const providerLower = provider.toLowerCase();
        
        if (!allowedProviders.includes(providerLower)) {
            return NextResponse.json({ 
                success: false, 
                message: 'Provider không được hỗ trợ.' 
            }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Missing Supabase configuration');
            return NextResponse.json({ 
                success: false, 
                message: 'Cấu hình server chưa đầy đủ.' 
            }, { status: 500 });
        }

        // Lấy URL callback từ request
        const { searchParams } = new URL(request.url);
        const redirectTo = searchParams.get('redirect_to') || `${request.nextUrl.origin}/api/auth/callback`;

        // Tạo Supabase client
        // Lưu ý: signInWithOAuth cần được gọi từ client-side hoặc với cấu hình đặc biệt
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Khởi tạo OAuth flow
        // signInWithOAuth trả về URL để redirect đến OAuth provider
        const oauthOptions = {
            provider: providerLower,
            options: {
                redirectTo: redirectTo
            }
        };

        // Thêm query params cho Google
        if (providerLower === 'google') {
            oauthOptions.options.queryParams = {
                access_type: 'offline',
                prompt: 'consent',
            };
        }

        const { data, error } = await supabase.auth.signInWithOAuth(oauthOptions);

        if (error) {
            console.error('OAuth initiation error:', {
                message: error.message,
                status: error.status,
                provider: providerLower,
                supabaseUrl: supabaseUrl ? 'configured' : 'missing'
            });
            
            // Kiểm tra nếu lỗi do provider chưa được cấu hình
            if (error.message?.includes('not enabled') || error.message?.includes('not configured')) {
                return NextResponse.json({ 
                    success: false, 
                    message: `OAuth provider ${providerLower} chưa được cấu hình trong Supabase Dashboard. Vui lòng vào Authentication > Providers và cấu hình ${providerLower}.`
                }, { status: 400 });
            }
            
            return NextResponse.json({ 
                success: false, 
                message: `Không thể khởi tạo đăng nhập ${providerLower}. ${error.message || 'Vui lòng kiểm tra cấu hình OAuth trong Supabase Dashboard.'}`,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            }, { status: 500 });
        }

        // Redirect đến OAuth provider
        if (data?.url) {
            return NextResponse.redirect(data.url);
        }

        console.error('OAuth data missing URL:', { 
            hasData: !!data, 
            dataKeys: data ? Object.keys(data) : null,
            provider: providerLower 
        });
        
        return NextResponse.json({ 
            success: false, 
            message: 'Không thể lấy URL đăng nhập. Vui lòng kiểm tra cấu hình OAuth provider trong Supabase Dashboard.' 
        }, { status: 500 });

    } catch (error) {
        console.error('OAuth API Error:', {
            message: error.message,
            stack: error.stack,
            provider: params?.provider
        });
        return NextResponse.json({ 
            success: false, 
            message: 'Lỗi server. Vui lòng thử lại sau.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}



