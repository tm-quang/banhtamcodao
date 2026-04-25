/**
 * src/app/api/admin/products/[id]/route.js
 * API routes cho cập nhật và xóa sản phẩm theo ID
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { slugify } from '@/lib/slugify';

export async function PUT(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const productData = await request.json();
        let { name, slug, description, image_url, price, discount_price, category_id, status, is_special, inventory } = productData;

        if (!id) {
            return NextResponse.json({ success: false, message: 'ID sản phẩm là bắt buộc.' }, { status: 400 });
        }

        // Kiểm tra nếu chỉ cập nhật is_special (toggle Hot)
        const isOnlyTogglingSpecial = Object.keys(productData).length === 1 && 'is_special' in productData;
        // Kiểm tra nếu chỉ cập nhật inventory
        const isOnlyUpdatingInventory = Object.keys(productData).length === 1 && 'inventory' in productData;

        if (isOnlyTogglingSpecial) {
            // Chỉ cập nhật is_special
            const finalIsSpecial = is_special ? true : false;
            const { error } = await supabaseAdmin
                .from('products')
                .update({ is_special: finalIsSpecial })
                .eq('id', id);

            if (error) throw error;
            return NextResponse.json({ success: true, message: 'Cập nhật món bán chạy thành công!' });
        }

        if (isOnlyUpdatingInventory) {
            // Chỉ cập nhật inventory
            const finalInventory = inventory !== null && inventory !== undefined ? parseInt(inventory, 10) : null;
            
            try {
                const { error } = await supabaseAdmin
                    .from('products')
                    .update({ inventory: finalInventory })
                    .eq('id', id);

                if (error) {
                    // Nếu lỗi do cột không tồn tại, bỏ qua
                    if (error.code === '42703' || error.message?.includes('does not exist')) {
                        console.log('Inventory column does not exist yet, skipping update');
                        return NextResponse.json({ 
                            success: true, 
                            message: 'Cập nhật tồn kho thành công! (Cột inventory chưa được tạo trong database)' 
                        });
                    }
                    throw error;
                }
                return NextResponse.json({ success: true, message: 'Cập nhật tồn kho thành công!' });
            } catch (updateError) {
                // Nếu lỗi do cột không tồn tại, bỏ qua
                if (updateError.code === '42703' || updateError.message?.includes('does not exist')) {
                    console.log('Inventory column does not exist yet, skipping update');
                    return NextResponse.json({ 
                        success: true, 
                        message: 'Cập nhật tồn kho thành công! (Cột inventory chưa được tạo trong database)' 
                    });
                }
                throw updateError;
            }
        }

        // Cập nhật đầy đủ - yêu cầu các trường bắt buộc
        if (!name || !price || !category_id) {
            return NextResponse.json({ success: false, message: 'Thông tin bắt buộc (Tên, Giá, Danh mục) bị thiếu.' }, { status: 400 });
        }

        // --- 2. TỰ ĐỘNG TẠO SLUG NẾU BỊ TRỐNG ---
        const finalSlug = slug ? slugify(slug) : slugify(name);

        const finalDescription = description || null;
        const finalImageUrl = image_url || null;
        const finalDiscountPrice = discount_price ? parseFloat(discount_price) : null;
        const finalIsSpecial = is_special !== undefined ? (is_special ? true : false) : undefined;
        const finalStatus = status || 'active';

        // Tạo object update chỉ với các trường được cung cấp
        const updateData = {
            name,
            slug: finalSlug,
            description: finalDescription,
            image_url: finalImageUrl,
            price: parseFloat(price),
            discount_price: finalDiscountPrice,
            category_id: parseInt(category_id, 10),
            status: finalStatus,
        };

        // Chỉ thêm is_special nếu được cung cấp
        if (finalIsSpecial !== undefined) {
            updateData.is_special = finalIsSpecial;
        }

        // Chỉ thêm inventory nếu được cung cấp
        if (inventory !== undefined) {
            updateData.inventory = inventory !== null ? parseInt(inventory, 10) : null;
        }

        const { error } = await supabaseAdmin
            .from('products')
            .update(updateData)
            .eq('id', id);

        // Nếu lỗi do cột inventory không tồn tại, bỏ qua và update các trường khác
        if (error) {
            if (error.code === '42703' && error.message?.includes('inventory')) {
                // Cột inventory không tồn tại, update lại không có inventory
                delete updateData.inventory;
                const { error: retryError } = await supabaseAdmin
                    .from('products')
                    .update(updateData)
                    .eq('id', id);
                if (retryError) throw retryError;
                console.log('Inventory column does not exist, updated without inventory field');
            } else {
                throw error;
            }
        }

        return NextResponse.json({ success: true, message: 'Cập nhật sản phẩm thành công!' });

    } catch (error) {
        console.error('API Error - PUT /api/admin/products/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server', error: error.message }, { status: 500 });
    }
}
/**
 * HÀM DELETE - Xóa sản phẩm (Giữ nguyên)
 * @param {Request} request - Request object
 * @param {Object} params - Route parameters
 * @returns {Promise<NextResponse>} Response
 */
export async function DELETE(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Xóa sản phẩm thành công!' });

    } catch (error) {
        console.error('API Error - DELETE /api/admin/products/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}