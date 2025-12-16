/**
 * src/app/api/auth/callback/route.js
 * API route để xử lý OAuth callback từ Google/Facebook
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase-helper';

export async function POST(request) {
    try {
        const { access_token, refresh_token } = await request.json();

        if (!access_token || !refresh_token) {
            return NextResponse.json({ 
                success: false, 
                message: 'Thiếu thông tin xác thực.' 
            }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({ 
                success: false, 
                message: 'Cấu hình server chưa đầy đủ.' 
            }, { status: 500 });
        }

        // Tạo Supabase client và set session
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token
        });

        if (sessionError || !session) {
            return NextResponse.json({ 
                success: false, 
                message: 'Không thể tạo session.' 
            }, { status: 401 });
        }

        const { user } = session;

        // Set cookies
        const cookieStore = await cookies();
        const maxAge = 60 * 60 * 24 * 30; // 30 ngày

        cookieStore.set('sb-access-token', session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: maxAge,
            path: '/',
        });

        cookieStore.set('sb-refresh-token', session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: maxAge,
            path: '/',
        });

        // Kiểm tra và tạo customer record
        const supabaseAdmin = getSupabaseAdmin();
        
        try {
            const { data: existingCustomer, error: checkError } = await supabaseAdmin
                .from('customers')
                .select('id, role')
                .eq('account_id', user.id)
                .maybeSingle();

            if (checkError) {
                console.error('Error checking existing customer:', checkError);
                // Tiếp tục tạo customer mới nếu có lỗi khi check
            }

            if (!existingCustomer) {
                const fullName = user.user_metadata?.full_name 
                    || user.user_metadata?.name 
                    || user.user_metadata?.display_name
                    || user.email?.split('@')[0] 
                    || 'Khách hàng';
                
                const email = user.email;
                const phoneNumber = user.phone || user.user_metadata?.phone_number || null;

                console.log('Creating customer record:', {
                    account_id: user.id,
                    full_name: fullName,
                    email: email,
                    phone_number: phoneNumber
                });

                const { data: newCustomer, error: customerError } = await supabaseAdmin
                    .from('customers')
                    .insert([
                        {
                            account_id: user.id,
                            full_name: fullName,
                            email: email,
                            phone_number: phoneNumber,
                            role: 'customer'
                        }
                    ])
                    .select();

                if (customerError) {
                    console.error('Error creating customer record:', {
                        error: customerError,
                        message: customerError.message,
                        details: customerError.details,
                        hint: customerError.hint,
                        code: customerError.code
                    });
                    
                    // Trả về lỗi chi tiết để debug
                    return NextResponse.json({ 
                        success: false, 
                        message: 'Không thể tạo thông tin khách hàng.',
                        error: process.env.NODE_ENV === 'development' ? {
                            message: customerError.message,
                            details: customerError.details,
                            hint: customerError.hint,
                            code: customerError.code
                        } : undefined
                    }, { status: 500 });
                }

                console.log('Customer record created successfully:', newCustomer);
            } else {
                console.log('Customer record already exists:', existingCustomer);
            }
        } catch (customerError) {
            console.error('Unexpected error in customer creation:', customerError);
            return NextResponse.json({ 
                success: false, 
                message: 'Lỗi khi xử lý thông tin khách hàng.',
                error: process.env.NODE_ENV === 'development' ? customerError.message : undefined
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Đăng nhập thành công.' 
        });

    } catch (error) {
        console.error('OAuth callback POST error:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi server.' 
        }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.redirect(new URL('/login?error=config', request.url));
        }

        // Tạo Supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Lấy code từ query params
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Nếu có lỗi từ OAuth provider
        if (error) {
            console.error('OAuth error:', error, errorDescription);
            return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url));
        }

        // Nếu không có code, redirect về login
        if (!code) {
            return NextResponse.redirect(new URL('/login?error=no_code', request.url));
        }

        // Exchange code for session
        const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

        if (authError) {
            console.error('Exchange code error:', authError);
            return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(authError.message)}`, request.url));
        }

        if (!authData.session) {
            return NextResponse.redirect(new URL('/login?error=no_session', request.url));
        }

        const { session, user } = authData;

        // Set cookies
        const cookieStore = await cookies();
        const maxAge = 60 * 60 * 24 * 30; // 30 ngày

        cookieStore.set('sb-access-token', session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: maxAge,
            path: '/',
        });

        cookieStore.set('sb-refresh-token', session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: maxAge,
            path: '/',
        });

        // Kiểm tra xem customer record đã tồn tại chưa
        const supabaseAdmin = getSupabaseAdmin();
        const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('id, role')
            .eq('account_id', user.id)
            .maybeSingle();

        // Nếu chưa có customer record, tạo mới
        if (!existingCustomer) {
            // Lấy thông tin từ user metadata hoặc user object
            const fullName = user.user_metadata?.full_name 
                || user.user_metadata?.name 
                || user.user_metadata?.display_name
                || user.email?.split('@')[0] 
                || 'Khách hàng';
            
            const email = user.email;
            const phoneNumber = user.phone || user.user_metadata?.phone_number || null;

            // Tạo customer record
            console.log('Creating customer record (GET):', {
                account_id: user.id,
                full_name: fullName,
                email: email,
                phone_number: phoneNumber
            });

            const { data: newCustomer, error: customerError } = await supabaseAdmin
                .from('customers')
                .insert([
                    {
                        account_id: user.id,
                        full_name: fullName,
                        email: email,
                        phone_number: phoneNumber,
                        role: 'customer' // Role mặc định
                    }
                ])
                .select();

            if (customerError) {
                console.error('Error creating customer record (GET):', {
                    error: customerError,
                    message: customerError.message,
                    details: customerError.details,
                    hint: customerError.hint,
                    code: customerError.code
                });
                // Log lỗi nhưng vẫn redirect về trang chủ vì user đã đăng nhập thành công
                // Có thể tạo customer record sau bằng cách khác
            } else {
                console.log('Customer record created successfully (GET):', newCustomer);
            }
        }

        // Redirect về trang chủ hoặc trang được chỉ định
        const redirectTo = searchParams.get('redirect_to') || '/';
        return NextResponse.redirect(new URL(redirectTo, request.url));

    } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
    }
}




