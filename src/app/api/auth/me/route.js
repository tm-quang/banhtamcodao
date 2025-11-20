// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

// --- THÊM DÒNG NÀY ĐỂ VÔ HIỆU HÓA CACHING ---
export const dynamic = 'force-dynamic';

// Lấy thông tin người dùng đang đăng nhập
export async function GET(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken');

    if (!token) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const [rows] = await pool.execute(
            `SELECT c.id, a.username, c.full_name, c.phone_number, c.email, 
             c.shipping_address, c.city, c.district, a.role, c.reward_points, c.created_at
             FROM customers c 
             JOIN accounts a ON c.account_id = a.id 
             WHERE a.id = ?`,
            [decoded.id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: rows[0] });
    } catch (error) {
        // Nếu token không hợp lệ, xóa cookie để dọn dẹp
        cookieStore.delete('sessionToken');
        return NextResponse.json({ success: false, message: 'Invalid token.' }, { status: 401 });
    }
}

// Cập nhật thông tin người dùng
export async function PUT(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken');
    if (!token) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const body = await request.json();
        const { fullName, phone, email, address, city, district, newPassword } = body;

        // Cập nhật bảng customers
        await pool.execute(
            `UPDATE customers SET full_name = ?, phone_number = ?, email = ?, 
             shipping_address = ?, city = ?, district = ?
             WHERE account_id = ?`,
            [fullName, phone, email, address, city, district, decoded.id]
        );

        // Nếu có mật khẩu mới, cập nhật bảng accounts
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await pool.execute(
                'UPDATE accounts SET password_hash = ? WHERE id = ?',
                [hashedPassword, decoded.id]
            );
        }

        return NextResponse.json({ success: true, message: 'Cập nhật thông tin thành công!' });
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}