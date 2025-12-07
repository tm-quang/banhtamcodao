/**
 * src/app/api/auth/login/route.js
 * API route cho đăng nhập sử dụng Supabase Authentication
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request) {
    let identifier;
    let password;

    try {
        const body = await request.json();
        identifier = body?.identifier;
        password = body?.password;

        if (!identifier || !password) {
            return NextResponse.json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' }, { status: 400 });
        }
    } catch (parseError) {
        console.error('Parse request body error:', parseError);
        return NextResponse.json({ success: false, message: 'Dữ liệu không hợp lệ.' }, { status: 400 });
    }

    try {
        /**
         * Tạo Supabase client với anon key để dùng auth
         */
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Missing Supabase configuration:', {
                hasUrl: !!supabaseUrl,
                hasAnonKey: !!supabaseAnonKey
            });
            return NextResponse.json({ 
                success: false, 
                message: 'Cấu hình server chưa đầy đủ. Vui lòng liên hệ quản trị viên.' 
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: false
            }
        });

        /**
         * Xác định identifier là email hay phone
         * Thử đăng nhập với email trước, nếu không được thì thử với phone
         */
        let authResponse;
        const isEmail = identifier.includes('@');

        if (isEmail) {
            /**
             * Đăng nhập bằng email
             */
            authResponse = await supabase.auth.signInWithPassword({
                email: identifier,
                password: password
            });
        } else {
            /**
             * Nếu không phải email, có thể là phone hoặc username
             * Tìm email từ customers table bằng phone_number hoặc username
             */
            const supabaseAdmin = (await import('@/lib/supabase-helper')).getSupabaseAdmin();
            
            let email = null;
            let customerByPhone = null;
            let account = null;
            
            /**
             * Tìm trong customers bằng phone_number
             */
            const phoneResult = await supabaseAdmin
                .from('customers')
                .select('email, account_id')
                .eq('phone_number', identifier)
                .maybeSingle();
            
            customerByPhone = phoneResult.data;

            if (customerByPhone?.email) {
                email = customerByPhone.email;
            } else {
                /**
                 * Tìm trong accounts bằng username
                 * Lưu ý: accounts.id có thể là BIGINT (old system) hoặc UUID (new system)
                 * Nếu là UUID, account_id trong customers sẽ trùng với accounts.id
                 * Nếu là BIGINT, cần tìm customer bằng account_id = accounts.id
                 */
                const accountResult = await supabaseAdmin
                    .from('accounts')
                    .select('id')
                    .eq('username', identifier)
                    .maybeSingle();
                
                account = accountResult.data;

                if (account) {
                    // Thử tìm customer với account_id = account.id (có thể là BIGINT hoặc UUID)
                    const { data: customerByAccount } = await supabaseAdmin
                        .from('customers')
                        .select('email')
                        .eq('account_id', account.id)
                        .maybeSingle();

                    if (customerByAccount?.email) {
                        email = customerByAccount.email;
                    } else {
                        // Nếu không tìm thấy, có thể account.id là BIGINT nhưng customer.account_id là UUID
                        // Thử tìm trong Supabase Auth users bằng metadata username
                        // Hoặc trả về lỗi
                        console.warn(`Found account with username ${identifier} but could not find matching customer email`);
                    }
                }
            }

            if (!email) {
                console.warn(`Could not find email for identifier: ${identifier}`, {
                    foundByPhone: !!customerByPhone,
                    foundAccount: !!account
                });
                return NextResponse.json({ 
                    success: false, 
                    message: 'Tên đăng nhập hoặc số điện thoại không tồn tại. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.' 
                }, { status: 401 });
            }
            
            console.log(`Found email for identifier ${identifier}: ${email.substring(0, 3)}***`);

            /**
             * Đăng nhập bằng email tìm được
             */
            authResponse = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
        }

        if (authResponse.error) {
            /**
             * Hiển thị lỗi chi tiết hơn trong development
             */
            console.error('Supabase Auth login error:', {
                message: authResponse.error.message,
                status: authResponse.error.status,
                identifier: identifier,
                isEmail: isEmail
            });
            
            const errorMessage = process.env.NODE_ENV === 'development' 
                ? authResponse.error.message || 'Thông tin đăng nhập không chính xác.'
                : 'Thông tin đăng nhập không chính xác.';
            
            // Cung cấp thông tin hữu ích hơn cho user
            let userFriendlyMessage = errorMessage;
            if (authResponse.error.message?.includes('Invalid login credentials')) {
                userFriendlyMessage = 'Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
            } else if (authResponse.error.message?.includes('Email not confirmed')) {
                userFriendlyMessage = 'Email chưa được xác nhận. Vui lòng kiểm tra email của bạn.';
            } else if (authResponse.error.message?.includes('User not found')) {
                userFriendlyMessage = 'Tài khoản không tồn tại. Vui lòng đăng ký tài khoản mới.';
            }
            
            return NextResponse.json({ 
                success: false, 
                message: userFriendlyMessage,
                ...(process.env.NODE_ENV === 'development' && { 
                    error: authResponse.error.message,
                    status: authResponse.error.status,
                    hint: authResponse.error.message?.includes('Invalid login credentials') 
                        ? 'Email hoặc mật khẩu không đúng. Nếu bạn là user cũ, vui lòng đăng ký lại hoặc liên hệ admin để reset password.'
                        : null
                })
            }, { status: 401 });
        }

        /**
         * Lấy session và set cookie
         */
        const { data: { session } } = authResponse;

        if (!session) {
            return NextResponse.json({ 
                success: false, 
                message: 'Không thể tạo session.' 
            }, { status: 500 });
        }

        /**
         * Set Supabase session cookies
         */
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

        /**
         * Lấy thông tin user từ customers table để trả về role
         * account_id trong customers table là UUID từ Supabase Auth
         */
        const supabaseAdmin = (await import('@/lib/supabase-helper')).getSupabaseAdmin();
        
        // Lấy customer với account_id = Supabase Auth user ID (UUID)
        let customer = null;
        let role = 'customer'; // Default role
        
        try {
            const { data: customerData, error: customerError } = await supabaseAdmin
                .from('customers')
                .select('id, full_name, email, phone_number, role')
                .eq('account_id', session.user.id)
                .maybeSingle();

            if (customerError) {
                console.warn('Error fetching customer:', customerError);
            } else {
                customer = customerData;
                // Lấy role từ customers table
                if (customerData?.role) {
                    role = customerData.role;
                }
            }
        } catch (error) {
            console.warn('Error fetching user profile:', error);
            // Tiếp tục với role mặc định
        }

        return NextResponse.json({
            success: true,
            message: 'Đăng nhập thành công.',
            role: role,
            user: {
                id: session.user.id,
                email: session.user.email,
                phone: session.user.phone
            }
        });

    } catch (error) {
        console.error('Login API Error:', error);
        const errorMessage = process.env.NODE_ENV === 'development' 
            ? error.message || 'Lỗi server.'
            : 'Lỗi server. Vui lòng thử lại sau.';
        return NextResponse.json({ 
            success: false, 
            message: errorMessage,
            ...(process.env.NODE_ENV === 'development' && { error: error.stack })
        }, { status: 500 });
    }
}