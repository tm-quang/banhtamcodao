// src/app/api/categories/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// Lấy tất cả danh mục cho frontend
export async function GET() {
    try {
        const { data: rows, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }

        // Xử lý encoding và format dữ liệu
        const categories = rows.map(row => ({
            id: row.id,
            name: row.name || 'Danh mục',
            slug: row.slug || 'danh-muc',
            status: row.status || 'active'
        }));

        return NextResponse.json({ success: true, categories }, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
    } catch (error) {
        console.error('API Error - /api/categories:', error);
        return NextResponse.json({ success: false, message: error.message, categories: [] }, { status: 500 });
    }
}
