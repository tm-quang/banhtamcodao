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
        const { id } = await params;
        
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

        // Lấy role từ customers table (nếu có), nếu không thì mặc định là 'customer'
        // Lấy status từ accounts table nếu có account_id
        let role = customers.role || 'customer';
        let status = 'active';
        let username = null;

        // Nếu có account_id, thử lấy thông tin từ accounts table
        if (customers.account_id) {
            try {
                const { data: account, error: accountError } = await supabaseAdmin
                    .from('accounts')
                    .select('role, status, username')
                    .eq('id', customers.account_id)
                    .maybeSingle();

                if (!accountError && account) {
                    role = account.role || role;
                    status = account.status || status;
                    username = account.username || null;
                }
            } catch (error) {
                console.warn('Error fetching account info:', error);
                // Tiếp tục với giá trị mặc định
            }
        }

        const customer = {
            ...customers,
            username: username,
            role: role,
            status: status
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
        const { id: customerId } = await params;
        const body = await request.json();
        const { full_name, phone_number, email, role, status, gender } = body;

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
        const updateData = {
            full_name,
            phone_number: phone_number || null,
            email: email || null
        };

        // Thêm gender nếu được cung cấp
        if (gender !== undefined) {
            updateData.gender = gender || null;
        }

        const { error: updateCustomerError } = await supabaseAdmin
            .from('customers')
            .update(updateData)
            .eq('id', customerId);

        if (updateCustomerError) {
            console.error('Error updating customers table:', updateCustomerError);
            // Nếu lỗi do column không tồn tại (gender), thử update lại không có gender
            if (updateCustomerError.message && updateCustomerError.message.includes('gender')) {
                delete updateData.gender;
                const { error: retryError } = await supabaseAdmin
                    .from('customers')
                    .update(updateData)
                    .eq('id', customerId);
                
                if (retryError) {
                    throw retryError;
                }
            } else {
                throw updateCustomerError;
            }
        }

        /**
         * Cập nhật bảng accounts (chỉ nếu có account_id và role/status được cung cấp)
         */
        if (accountId && (role !== undefined || status !== undefined)) {
            const accountUpdateData = {};
            if (role !== undefined) accountUpdateData.role = role;
            if (status !== undefined) accountUpdateData.status = status;

            // Kiểm tra xem accounts table có tồn tại không
            const { error: updateAccountError } = await supabaseAdmin
                .from('accounts')
                .update(accountUpdateData)
                .eq('id', accountId);

            // Nếu lỗi là do table không tồn tại hoặc không có quyền, chỉ log warning
            if (updateAccountError) {
                console.warn('Warning: Could not update accounts table:', updateAccountError.message);
                // Không throw error vì có thể accounts table không tồn tại hoặc không cần thiết
            }
        }

        return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        console.error('API Error - PUT /api/admin/customers/[id]:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi Server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * Xóa khách hàng
 */
export async function DELETE(request, { params }) {
    try {
        const { id: customerId } = await params;

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