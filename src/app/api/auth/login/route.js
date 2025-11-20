// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày

export async function POST(request) {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
        return NextResponse.json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' }, { status: 400 });
    }

    try {
        // Tìm user trong bảng accounts bằng username
        let { data: accounts, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('username', identifier);

        let user = accounts && accounts.length > 0 ? accounts[0] : null;

        // Nếu không tìm thấy bằng username, tìm trong bảng customers bằng phone_number
        if (!user) {
            const { data: customers } = await supabase
                .from('customers')
                .select('account_id')
                .eq('phone_number', identifier);

            if (customers && customers.length > 0) {
                const accountId = customers[0].account_id;
                const { data: accountsByPhone } = await supabase
                    .from('accounts')
                    .select('*')
                    .eq('id', accountId);

                if (accountsByPhone && accountsByPhone.length > 0) {
                    user = accountsByPhone[0];
                }
            }
        }

        if (!user) {
            return NextResponse.json({ success: false, message: 'Thông tin đăng nhập không chính xác.' }, { status: 401 });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return NextResponse.json({ success: false, message: 'Thông tin đăng nhập không chính xác.' }, { status: 401 });
        }

        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            secret,
            { expiresIn: MAX_AGE }
        );

        const serialized = serialize('sessionToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: MAX_AGE,
            path: '/',
        });

        return new Response(JSON.stringify({
            success: true,
            message: 'Đăng nhập thành công.',
            role: user.role,
        }), {
            status: 200,
            headers: { 'Set-Cookie': serialized }
        });

    } catch (error) {
        console.error('Login API Error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi server.' }, { status: 500 });
    }
}