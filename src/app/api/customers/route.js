// src/app/api/admin/customers/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                c.id, 
                c.full_name, 
                c.phone_number, 
                c.email,
                a.username,
                c.reward_points,
                c.created_at
            FROM customers c
            JOIN accounts a ON c.account_id = a.id
            ORDER BY c.created_at DESC
        `);
        return NextResponse.json({ success: true, customers: rows });
    } catch (error) {
        console.error('API Error - /api/admin/customers:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}