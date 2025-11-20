import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await pool.execute(`
            SELECT id, title, image_url, link_url, position, sort_order, active,
                   display_seconds, start_date, end_date, show_once
            FROM banners
            ORDER BY position ASC, sort_order ASC, id DESC
        `);
        return NextResponse.json({ success: true, banners: rows });
    } catch (error) {
        console.error('API Error - GET /api/admin/banners:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, image_url, link_url, position, sort_order, active, display_seconds, start_date, end_date, show_once } = body;
        if (!image_url) {
            return NextResponse.json({ success: false, message: 'Thiếu ảnh banner.' }, { status: 400 });
        }
        const [result] = await pool.execute(
            `INSERT INTO banners (title, image_url, link_url, position, sort_order, active, display_seconds, start_date, end_date, show_once)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title || null, image_url, link_url || null, position || 'home', sort_order || 0, active ? 1 : 0, display_seconds || null, start_date || null, end_date || null, show_once ? 1 : 0]
        );
        return NextResponse.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('API Error - POST /api/admin/banners:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}


