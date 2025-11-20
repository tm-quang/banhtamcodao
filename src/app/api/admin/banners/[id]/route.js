import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { title, image_url, link_url, position, sort_order, active, display_seconds, start_date, end_date, show_once } = body;
        const fields = [];
        const values = [];
        if (title !== undefined) { fields.push('title = ?'); values.push(title); }
        if (image_url !== undefined) { fields.push('image_url = ?'); values.push(image_url); }
        if (link_url !== undefined) { fields.push('link_url = ?'); values.push(link_url); }
        if (position !== undefined) { fields.push('position = ?'); values.push(position); }
        if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
        if (active !== undefined) { fields.push('active = ?'); values.push(active ? 1 : 0); }
        if (display_seconds !== undefined) { fields.push('display_seconds = ?'); values.push(display_seconds); }
        if (start_date !== undefined) { fields.push('start_date = ?'); values.push(start_date); }
        if (end_date !== undefined) { fields.push('end_date = ?'); values.push(end_date); }
        if (show_once !== undefined) { fields.push('show_once = ?'); values.push(show_once ? 1 : 0); }
        if (fields.length === 0) return NextResponse.json({ success: false, message: 'No changes' }, { status: 400 });
        const sql = `UPDATE banners SET ${fields.join(', ')} WHERE id = ?`;
        values.push(params.id);
        await pool.execute(sql, values);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error - PUT /api/admin/banners/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        await pool.execute('DELETE FROM banners WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/banners/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}


