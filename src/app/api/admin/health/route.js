/**
 * src/app/api/admin/health/route.js
 * API route để kiểm tra kết nối database
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Kiểm tra kết nối Supabase
 */
export async function GET() {
    try {
        /**
         * Thực hiện query đơn giản để kiểm tra kết nối
         */
        const { error } = await supabaseAdmin
            .from('categories')
            .select('id')
            .limit(1);

        if (error) throw error;

        return NextResponse.json({ success: true, db: true });
    } catch (error) {
        console.error('Health check error:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message,
            db: false 
        }, { status: 500 });
    }
}


