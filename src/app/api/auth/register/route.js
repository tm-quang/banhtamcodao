// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request) {
    try {
        // 1. Thêm phoneNumber vào danh sách các trường nhận được
        const { fullName, phoneNumber, username, password, email } = await request.json();

        if (!fullName || !username || !password || !phoneNumber) {
            return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ các trường bắt buộc.' }, { status: 400 });
        }

        // Kiểm tra xem username hoặc phoneNumber đã tồn tại chưa
        const [existingUsers] = await pool.execute(
            'SELECT a.id FROM accounts a LEFT JOIN customers c ON a.id = c.account_id WHERE a.username = ? OR c.phone_number = ?', 
            [username, phoneNumber]
        );
        if (existingUsers.length > 0) {
            return NextResponse.json({ success: false, message: 'Tên đăng nhập hoặc số điện thoại này đã tồn tại.' }, { status: 409 });
        }

        // 2. Tạo tài khoản trong bảng `accounts`
        const hashedPassword = await bcrypt.hash(password, 10);
        const [accountResult] = await pool.execute(
            'INSERT INTO accounts (username, password_hash, role, status) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, 'customer', 'active']
        );
        const accountId = accountResult.insertId;

        // 3. Cập nhật hồ sơ trong bảng `customers` với phoneNumber
        await pool.execute(
            'INSERT INTO customers (account_id, full_name, phone_number, email) VALUES (?, ?, ?, ?)',
            [accountId, fullName, phoneNumber, email || null]
        );

        return NextResponse.json({ success: true, message: 'Tạo tài khoản thành công!' });

    } catch (error) {
        console.error('API Error - Register:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server, không thể tạo tài khoản.' }, { status: 500 });
    }
}