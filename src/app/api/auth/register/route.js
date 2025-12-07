/**
 * src/app/api/auth/register/route.js
 * API route cho đăng ký tài khoản sử dụng Supabase Authentication
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helper';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
    try {
        let { fullName, phoneNumber, username, password, email } = await request.json();

        /**
         * Email hoặc phoneNumber là bắt buộc để tạo Supabase Auth user
         */
        if (!fullName || !password || (!email && !phoneNumber)) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng điền đầy đủ các trường bắt buộc (Họ tên, Email hoặc Số điện thoại, Mật khẩu).'
            }, { status: 400 });
        }

        /**
         * Format số điện thoại sang E.164 (yêu cầu bởi Supabase Auth)
         * Ví dụ: 0933960788 -> +84933960788
         */
        const formatPhoneToE164 = (phone) => {
            if (!phone) return null;
            // Loại bỏ khoảng trắng và ký tự đặc biệt
            let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
            // Nếu đã có + ở đầu, giữ nguyên
            if (cleaned.startsWith('+')) return cleaned;
            // Nếu bắt đầu bằng 0, thay bằng +84 (Vietnam)
            if (cleaned.startsWith('0')) {
                return '+84' + cleaned.substring(1);
            }
            // Nếu bắt đầu bằng 84, thêm +
            if (cleaned.startsWith('84')) {
                return '+' + cleaned;
            }
            // Mặc định thêm +84
            return '+84' + cleaned;
        };

        // Lưu số gốc để hiển thị và tìm kiếm
        const originalPhoneNumber = phoneNumber;
        // Format cho Supabase Auth
        const formattedPhone = formatPhoneToE164(phoneNumber);

        const supabaseAdmin = getSupabaseAdmin();

        /**
         * Kiểm tra xem email đã tồn tại trong Supabase Auth chưa
         */
        if (email) {
            try {
                let existingUser = null;

                // Thử dùng getUserByEmail nếu có
                if (supabaseAdmin.auth.admin.getUserByEmail) {
                    const result = await supabaseAdmin.auth.admin.getUserByEmail(email);
                    if (result?.data?.user) {
                        existingUser = result.data;
                    }
                } else {
                    // Nếu không có, dùng listUsers và filter
                    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                    if (!listError && usersData?.users) {
                        const foundUser = usersData.users.find(u => u.email === email);
                        if (foundUser) {
                            existingUser = { user: foundUser };
                        }
                    }
                }

                if (existingUser?.user) {
                    return NextResponse.json({
                        success: false,
                        message: 'Email này đã được sử dụng.'
                    }, { status: 409 });
                }
            } catch (checkError) {
                // Nếu có lỗi khi kiểm tra, log nhưng tiếp tục (có thể tạo user mới)
                console.warn('Error checking existing user:', checkError.message);
            }
        }

        /**
         * Kiểm tra xem phoneNumber đã tồn tại trong customers chưa
         */
        if (phoneNumber) {
            const { data: existingCustomer } = await supabaseAdmin
                .from('customers')
                .select('id')
                .eq('phone_number', phoneNumber)
                .maybeSingle();

            if (existingCustomer) {
                return NextResponse.json({
                    success: false,
                    message: 'Số điện thoại này đã được sử dụng.'
                }, { status: 409 });
            }
        }

        /**
         * Tạo user trong Supabase Auth
         * Sử dụng email làm identifier chính, nếu không có email thì dùng phone
         */
        const authIdentifier = email || formattedPhone;
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email || `${originalPhoneNumber}@temp.banhtamcodao.com`,
            phone: formattedPhone || undefined,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                phone_number: originalPhoneNumber, // Lưu số gốc để hiển thị
                username: username || null
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                return NextResponse.json({
                    success: false,
                    message: 'Email hoặc số điện thoại này đã được sử dụng.'
                }, { status: 409 });
            }
            throw authError;
        }

        const authUserId = authData.user.id;

        /**
         * Tạo hồ sơ trong bảng customers với account_id = UUID từ Supabase Auth
         * Role mặc định là 'customer' cho user đăng ký mới
         */
        const { error: customerError } = await supabaseAdmin
            .from('customers')
            .insert([
                {
                    account_id: authUserId, // UUID từ Supabase Auth
                    full_name: fullName,
                    phone_number: originalPhoneNumber, // Lưu số gốc dạng 0933960788 để dễ tìm kiếm
                    email: email || null,
                    role: 'customer' // Role mặc định cho user mới đăng ký
                }
            ]);

        if (customerError) {
            /**
             * Nếu lỗi tạo customer, xóa user trong Supabase Auth để rollback
             */
            await supabaseAdmin.auth.admin.deleteUser(authUserId);
            throw customerError;
        }

        /**
         * Lưu username vào user_metadata của Supabase Auth (nếu có)
         * Để dễ dàng truy xuất sau này
         */
        if (username) {
            try {
                await supabaseAdmin.auth.admin.updateUserById(authUserId, {
                    user_metadata: {
                        ...authData.user.user_metadata,
                        username: username
                    }
                });
            } catch (metadataError) {
                // Không throw error vì đây không phải bước bắt buộc
                console.warn('Could not update user metadata:', metadataError.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Tạo tài khoản thành công!'
        });

    } catch (error) {
        console.error('API Error - Register:', error);
        const errorMessage = process.env.NODE_ENV === 'development'
            ? error.message || 'Lỗi server.'
            : 'Lỗi Server, không thể tạo tài khoản.';
        return NextResponse.json({
            success: false,
            message: errorMessage
        }, { status: 500 });
    }
}