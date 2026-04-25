/**
 * src/app/api/admin/flash-sales/[id]/route.js
 * API routes cho cập nhật và xóa Flash Sale (Admin)
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy chi tiết Flash Sale theo ID
 */
export async function GET(request, { params }) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase client chưa được khởi tạo. Vui lòng kiểm tra biến môi trường.');
            return NextResponse.json({
                success: false,
                message: 'Database chưa được cấu hình. Vui lòng liên hệ quản trị viên.'
            }, { status: 500 });
        }

        const { id } = await params;

        const { data: flashSale, error } = await supabaseAdmin
            .from('flash_sales')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        if (!flashSale) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy Flash Sale'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, flashSale });
    } catch (error) {
        console.error('API Error - GET /api/admin/flash-sales/[id]:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi Server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * Cập nhật Flash Sale
 */
export async function PUT(request, { params }) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase client chưa được khởi tạo. Vui lòng kiểm tra biến môi trường.');
            return NextResponse.json({
                success: false,
                message: 'Database chưa được cấu hình. Vui lòng liên hệ quản trị viên.'
            }, { status: 500 });
        }

        const { id } = await params;
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

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description ? description.trim() : '';
        if (status !== undefined) updateData.status = status;
        
        // Map to old column names (required by database)
        if (start_date !== undefined) {
            updateData.start_time = start_date;
        }
        if (end_date !== undefined) {
            updateData.end_time = end_date;
        }
        if (image_url !== undefined) {
            updateData.banner_image = image_url.trim();
        }
        
        // Only add background_c if badge_color is provided (optional, may not exist)
        if (badge_color !== undefined && badge_color !== null && badge_color !== '') {
            // Try background_c first (old schema), but don't fail if it doesn't exist
            updateData.background_c = badge_color;
        }
        
        // Try to add new columns (if they exist)
        if (badge_text !== undefined) updateData.badge_text = badge_text ? badge_text.trim() : 'FLASH';
        if (badge_color !== undefined && badge_color !== null && badge_color !== '') {
            updateData.badge_color = badge_color;
        }
        if (discount_value !== undefined) updateData.discount_value = discount_value ? parseInt(discount_value) : 0;
        if (discount_type !== undefined) updateData.discount_type = discount_type;
        if (image_url !== undefined) updateData.image_url = image_url.trim();
        if (link_url !== undefined) updateData.link_url = link_url ? link_url.trim() : '/menu';
        if (start_date !== undefined) updateData.start_date = start_date;
        if (end_date !== undefined) updateData.end_date = end_date;
        if (priority !== undefined) updateData.priority = priority ? parseInt(priority) : 0;

        // Validate dates if both are provided
        if (updateData.start_date && updateData.end_date) {
            const startDate = new Date(updateData.start_date);
            const endDate = new Date(updateData.end_date);
            
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
        }

        // Try to update, if error about missing columns, retry with only confirmed columns
        let { data: updatedFlashSale, error } = await supabaseAdmin
            .from('flash_sales')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        // If error about missing columns, retry with only old schema columns
        if (error && error.message && (
            error.message.includes('column') || 
            error.message.includes('schema') ||
            error.message.includes('background_c') ||
            error.message.includes('badge_color') ||
            error.message.includes('badge_text') ||
            error.message.includes('discount_value') ||
            error.message.includes('image_url') ||
            error.message.includes('start_date') ||
            error.message.includes('end_date')
        )) {
            console.warn('Some columns not found, retrying with old schema only:', error.message);
            const oldSchemaUpdate = {
                name: updateData.name,
                description: updateData.description,
                status: updateData.status,
                start_time: updateData.start_time,
                end_time: updateData.end_time,
                banner_image: updateData.banner_image
            };
            // Only add background_c if it was in original updateData and no error about it
            if (updateData.background_c && !error.message.includes('background_c')) {
                oldSchemaUpdate.background_c = updateData.background_c;
            }
            
            const { data: retryData, error: retryError } = await supabaseAdmin
                .from('flash_sales')
                .update(oldSchemaUpdate)
                .eq('id', id)
                .select()
                .single();
            updatedFlashSale = retryData;
            error = retryError;
        }

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Cập nhật Flash Sale thành công!',
            flashSale: updatedFlashSale
        });
    } catch (error) {
        console.error('API Error - PUT /api/admin/flash-sales/[id]:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi Server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * Xóa Flash Sale
 */
export async function DELETE(request, { params }) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase client chưa được khởi tạo. Vui lòng kiểm tra biến môi trường.');
            return NextResponse.json({
                success: false,
                message: 'Database chưa được cấu hình. Vui lòng liên hệ quản trị viên.'
            }, { status: 500 });
        }

        const { id } = await params;

        const { error } = await supabaseAdmin
            .from('flash_sales')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Xóa Flash Sale thành công!'
        });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/flash-sales/[id]:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi Server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
