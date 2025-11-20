// src/app/api/admin/customers/[id]/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Cập nhật khách hàng
export async function PUT(request, { params }) {
    try {
        const { id: customerId } = params;
        const { full_name, phone_number, email, role, status } = await request.json();

        // Lấy account_id từ customer_id
        const [customerRows] = await pool.execute('SELECT account_id FROM customers WHERE id = ?', [customerId]);
        if (customerRows.length === 0) {
            return NextResponse.json({ success: false, message: 'Không tìm thấy khách hàng.' }, { status: 404 });
        }
        const accountId = customerRows[0].account_id;

        // Cập nhật bảng customers
        await pool.execute(
            'UPDATE customers SET full_name = ?, phone_number = ?, email = ? WHERE id = ?',
            [full_name, phone_number || null, email || null, customerId]
        );
        // Cập nhật bảng accounts
        await pool.execute(
            'UPDATE accounts SET role = ?, status = ? WHERE id = ?',
            [role, status, accountId]
        );

        return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

// Xóa khách hàng
export async function DELETE(request, { params }) {
    const connection = await pool.getConnection();
    try {
        const { id: customerId } = params;

        await connection.beginTransaction();

        // 1. Lấy account_id từ customer
        const [customerRows] = await connection.execute('SELECT account_id FROM customers WHERE id = ?', [customerId]);
        if (customerRows.length === 0) {
            await connection.rollback();
            return NextResponse.json({ success: false, message: 'Không tìm thấy khách hàng.' }, { status: 404 });
        }
        const accountId = customerRows[0].account_id;

        // 2. Xóa record trong bảng customers trước
        const [deleteCustomerResult] = await connection.execute('DELETE FROM customers WHERE id = ?', [customerId]);
        if (deleteCustomerResult.affectedRows === 0) {
             await connection.rollback();
             return NextResponse.json({ success: false, message: 'Không tìm thấy khách hàng để xóa.' }, { status: 404 });
        }

        // 3. Xóa record trong bảng accounts
        await connection.execute('DELETE FROM accounts WHERE id = ?', [accountId]);

        await connection.commit();
        
        return NextResponse.json({ success: true, message: 'Xóa khách hàng thành công!' });
    } catch (error) {
        await connection.rollback();
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server, không thể xóa khách hàng.' }, { status: 500 });
    } finally {
        connection.release();
    }
}
export async function GET(request, { params }) {
    try {
        const { id } = params;
        const [rows] = await pool.execute(
            `SELECT c.*, a.username, a.role, a.status 
             FROM customers c JOIN accounts a ON c.account_id = a.id 
             WHERE c.id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Không tìm thấy khách hàng.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, customer: rows[0] });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}