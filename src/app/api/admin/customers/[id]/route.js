/**
 * src/app/api/admin/customers/[id]/route.js
 * API routes cho quản lý khách hàng theo ID
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Lấy thông tin chi tiết khách hàng
 */
export async function GET(request, { params }) {
    try {
        const { id } = params;
        
        // Lưu ý: Không join accounts vì accounts.id là BIGINT, không match với customers.account_id (UUID)
        const { data: customers, error } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !customers) {
            return NextResponse.json({ 
                success: false, 
                message: 'Không tìm thấy khách hàng.' 
            }, { status: 404 });
        }

        // Lấy username và role từ user_metadata hoặc để null
        // Có thể query riêng từ accounts nếu cần (nhưng cần cách link khác)
        const customer = {
            ...customers,
            username: null, // Có thể lấy từ user_metadata nếu cần
            role: 'customer', // Default role
            status: 'active' // Default status
        };

        return NextResponse.json({ success: true, customer });
    } catch (error) {
        console.error('API Error - GET /api/admin/customers/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Cập nhật thông tin khách hàng
 */
export async function PUT(request, { params }) {
    try {
        const { id: customerId } = params;
        const { full_name, phone_number, email, role, status } = await request.json();

        /**
         * Lấy account_id từ customer_id
         */
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('account_id')
            .eq('id', customerId)
            .single();

        if (customerError || !customer) {
            return NextResponse.json({ 
                success: false, 
                message: 'Không tìm thấy khách hàng.' 
            }, { status: 404 });
        }

        const accountId = customer.account_id;

        /**
         * Cập nhật bảng customers
         */
        const { error: updateCustomerError } = await supabaseAdmin
            .from('customers')
            .update({
                full_name,
                phone_number: phone_number || null,
                email: email || null
            })
            .eq('id', customerId);

        if (updateCustomerError) throw updateCustomerError;

        /**
         * Cập nhật bảng accounts
         */
        const { error: updateAccountError } = await supabaseAdmin
            .from('accounts')
            .update({
                role,
                status
            })
            .eq('id', accountId);

        if (updateAccountError) throw updateAccountError;

        return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        console.error('API Error - PUT /api/admin/customers/[id]:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}

/**
 * Xóa khách hàng
 */
export async function DELETE(request, { params }) {
    try {
        const { id: customerId } = params;

        /**
         * Lấy account_id từ customer
         */
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('account_id')
            .eq('id', customerId)
            .single();

        if (customerError || !customer) {
            return NextResponse.json({ 
                success: false, 
                message: 'Không tìm thấy khách hàng.' 
            }, { status: 404 });
        }

        const accountId = customer.account_id;

        /**
         * Xóa record trong bảng customers trước
         */
        const { error: deleteCustomerError } = await supabaseAdmin
            .from('customers')
            .delete()
            .eq('id', customerId);

        if (deleteCustomerError) throw deleteCustomerError;

        /**
         * Xóa record trong bảng accounts
         */
        const { error: deleteAccountError } = await supabaseAdmin
            .from('accounts')
            .delete()
            .eq('id', accountId);

        if (deleteAccountError) throw deleteAccountError;

        return NextResponse.json({ success: true, message: 'Xóa khách hàng thành công!' });
    } catch (error) {
        console.error('API Error - DELETE /api/admin/customers/[id]:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Lỗi Server, không thể xóa khách hàng.' 
        }, { status: 500 });
    }
}