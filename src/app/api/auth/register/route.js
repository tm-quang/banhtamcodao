// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import bcrypt from 'bcrypt';

export async function POST(request) {
    try {
        const { fullName, phoneNumber, username, password, email } = await request.json();

        if (!fullName || !username || !password || !phoneNumber) {
            return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ các trường bắt buộc.' }, { status: 400 });
        }

        // Kiểm tra xem username đã tồn tại chưa
        const { data: existingAccount } = await supabase
            .from('accounts')
            .select('id')
            .eq('username', username)
            .maybeSingle();

        if (existingAccount) {
            return NextResponse.json({ success: false, message: 'Tên đăng nhập này đã tồn tại.' }, { status: 409 });
        }

        // Kiểm tra xem phoneNumber đã tồn tại chưa
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('phone_number', phoneNumber)
            .maybeSingle();

        if (existingCustomer) {
            return NextResponse.json({ success: false, message: 'Số điện thoại này đã được sử dụng.' }, { status: 409 });
        }

        // 2. Tạo tài khoản trong bảng `accounts`
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data: newAccount, error: accountError } = await supabase
            .from('accounts')
            .insert([
                { username, password_hash: hashedPassword, role: 'customer', status: 'active' }
            ])
            .select();

        if (accountError) {
            throw accountError;
        }

        const accountId = newAccount[0].id;

        // 3. Cập nhật hồ sơ trong bảng `customers` với phoneNumber
        const { error: customerError } = await supabase
            .from('customers')
            .insert([
                {
                    account_id: accountId,
                    full_name: fullName,
                    phone_number: phoneNumber,
                    email: email || null
                }
            ]);

        if (customerError) {
            // Nếu lỗi tạo customer, có thể nên xóa account vừa tạo để tránh rác (manual rollback)
            await supabase.from('accounts').delete().eq('id', accountId);
            throw customerError;
        }

        return NextResponse.json({ success: true, message: 'Tạo tài khoản thành công!' });

    } catch (error) {
        console.error('API Error - Register:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server, không thể tạo tài khoản.' }, { status: 500 });
    }
}