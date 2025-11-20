// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày

export async function POST(request) {
    const body = await request.json();
    // 1. Đổi tên biến để rõ nghĩa hơn
    const { identifier, password } = body;

    if (!identifier || !password) {
        return NextResponse.json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' }, { status: 400 });
    }

    try {
        // 2. Cập nhật câu truy vấn để tìm bằng username hoặc phone_number
        const [rows] = await pool.execute(
            `SELECT a.* FROM accounts a 
             LEFT JOIN customers c ON a.id = c.account_id
             WHERE a.username = ? OR c.phone_number = ?`,
            [identifier, identifier]
        );
        const user = rows[0];

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