/**
 * src/app/api/admin/flash-sales/route.js
 * API routes cho quản lý Flash Sale (Admin)
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy tất cả Flash Sales
 */
export async function GET() {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase client chưa được khởi tạo. Vui lòng kiểm tra biến môi trường.');
            return NextResponse.json({
                success: false,
                message: 'Database chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
                flashSales: []
            }, { status: 500 });
        }

        const { data: rows, error } = await supabaseAdmin
            .from('flash_sales')
            .select('*')
            .order('priority', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Map old column names to new ones for consistency
        const mappedRows = (rows || []).map(row => ({
            ...row,
            // Map old columns to new names if new columns don't exist
            start_date: row.start_date || row.start_time,
            end_date: row.end_date || row.end_time,
            image_url: row.image_url || row.banner_image,
            badge_color: row.badge_color || row.background_c
        }));

        return NextResponse.json({ success: true, flashSales: mappedRows });
    } catch (error) {
        console.error('API Error - GET /api/admin/flash-sales:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi Server',
            flashSales: [],
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * Thêm Flash Sale mới
 */
export async function POST(request) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase client chưa được khởi tạo. Vui lòng kiểm tra biến môi trường.');
            return NextResponse.json({
                success: false,
                message: 'Database chưa được cấu hình. Vui lòng liên hệ quản trị viên.'
            }, { status: 500 });
        }

        const data = await request.json();
        const {
            name,
            description,
            badge_text,
            badge_color,
            discount_value,
            discount_type,
            image_url,
            link_url,
            start_date,
            end_date,
            priority,
            status
        } = data;

        if (!name || !start_date || !end_date) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng điền đầy đủ các trường bắt buộc (tên, thời gian bắt đầu, thời gian kết thúc).'
            }, { status: 400 });
        }

        // Validate date format
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json({
                success: false,
                message: 'Định dạng ngày không hợp lệ.'
            }, { status: 400 });
        }

        if (endDate <= startDate) {
            return NextResponse.json({
                success: false,
                message: 'Thời gian kết thúc phải sau thời gian bắt đầu.'
            }, { status: 400 });
        }

        // Build insert data object - only use columns that definitely exist
        // Based on schema: id, name, description, start_time, end_time, banner_image, background_c, text_color, status, created_at, updated_at, created_by
        const insertData = {
            name: name.trim(),
            description: description ? description.trim() : '',
            status: status || 'active',
            // Required columns from old schema
            start_time: start_date,
            end_time: end_date,
            banner_image: image_url ? image_url.trim() : null
        };

        // Only add background_c if badge_color is provided (optional column)
        if (badge_color) {
            insertData.background_c = badge_color;
        }

        // Try to insert with new columns first (if they exist)
        let insertWithNewColumns = { ...insertData };
        if (badge_text) insertWithNewColumns.badge_text = badge_text.trim();
        if (discount_value !== undefined) insertWithNewColumns.discount_value = parseInt(discount_value);
        if (discount_type) insertWithNewColumns.discount_type = discount_type;
        if (image_url) insertWithNewColumns.image_url = image_url.trim();
        if (link_url) insertWithNewColumns.link_url = link_url.trim();
        if (start_date) insertWithNewColumns.start_date = start_date;
        if (end_date) insertWithNewColumns.end_date = end_date;
        if (priority !== undefined) insertWithNewColumns.priority = parseInt(priority);
        if (badge_color) insertWithNewColumns.badge_color = badge_color;

        let { data: newFlashSale, error } = await supabaseAdmin
            .from('flash_sales')
            .insert([insertWithNewColumns])
            .select()
            .single();

        // If error about missing columns, retry with only confirmed old schema columns
        if (error && error.message && (
            error.message.includes('column') || 
            error.message.includes('schema')
        )) {
            console.warn('Some columns not found, retrying with old schema only:', error.message);
            const { data: retryData, error: retryError } = await supabaseAdmin
                .from('flash_sales')
                .insert([insertData])
                .select()
                .single();
            newFlashSale = retryData;
            error = retryError;
        }

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Tạo Flash Sale thành công!',
            flashSale: newFlashSale
        });
    } catch (error) {
        console.error('API Error - POST /api/admin/flash-sales:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi Server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
