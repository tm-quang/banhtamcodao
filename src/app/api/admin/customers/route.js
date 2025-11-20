// src/app/api/admin/customers/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
export async function GET() {
    try {
        // Câu lệnh SQL JOIN và GROUP BY để tính toán tổng đơn và tổng chi tiêu
        const [rows] = await pool.execute(`
            SELECT 
                c.id, 
                c.full_name, 
                c.phone_number, 
                c.email,
                a.username,
                a.role,
                a.status,
                c.created_at,
                COUNT(o.id) AS total_orders,
                SUM(o.total_amount) AS total_spent
            FROM customers c
            JOIN accounts a ON c.account_id = a.id
            LEFT JOIN orders o ON c.phone_number = o.phone_number AND c.phone_number IS NOT NULL
            GROUP BY c.id, c.full_name, c.phone_number, c.email, a.username, a.role, a.status, c.created_at
            ORDER BY c.created_at DESC
        `);
        return NextResponse.json({ success: true, customers: rows });
    } catch (error) {
        console.error('API Error - /api/admin/customers:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

// Thêm khách hàng mới
export async function POST(request) {
    try {
        const { username, password, full_name, phone_number, email, role, status } = await request.json();
        if (!username || !password || !full_name) {
            return NextResponse.json({ success: false, message: 'Tên đăng nhập, mật khẩu và họ tên là bắt buộc.' }, { status: 400 });
        }

        // 1. Tạo tài khoản trong bảng `accounts`
        const hashedPassword = await bcrypt.hash(password, 10);
        const [accountResult] = await pool.execute(
            'INSERT INTO accounts (username, password_hash, role, status) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role || 'customer', status || 'active']
        );
        const accountId = accountResult.insertId;

        // 2. Tạo hồ sơ trong bảng `customers`
        await pool.execute(
            'INSERT INTO customers (account_id, full_name, phone_number, email) VALUES (?, ?, ?, ?)',
            [accountId, full_name, phone_number || null, email || null]
        );

        return NextResponse.json({ success: true, message: 'Tạo khách hàng thành công!' });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server, có thể tên đăng nhập đã tồn tại.' }, { status: 500 });
    }
}