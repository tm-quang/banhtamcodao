// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

// --- THÊM DÒNG NÀY ĐỂ VÔ HIỆU HÓA CACHING ---
export const dynamic = 'force-dynamic';

// Lấy thông tin người dùng đang đăng nhập
export async function GET(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken');

    if (!token) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);

        // Join customers and accounts
        const { data: customers, error } = await supabase
            .from('customers')
            .select(`
                id, full_name, phone_number, email, 
                shipping_address, city, district, reward_points, created_at,
                accounts (username, role)
            `)
            .eq('account_id', decoded.id);

        if (error) throw error;

        if (!customers || customers.length === 0) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        const customer = customers[0];
        const user = {
            id: customer.id,
            username: customer.accounts?.username,
            full_name: customer.full_name,
            phone_number: customer.phone_number,
            email: customer.email,
            shipping_address: customer.shipping_address,
            city: customer.city,
            district: customer.district,
            role: customer.accounts?.role,
            reward_points: customer.reward_points,
            created_at: customer.created_at
        };

        return NextResponse.json({ success: true, user });
    } catch (error) {
        // Nếu token không hợp lệ, xóa cookie để dọn dẹp
        cookieStore.delete('sessionToken');
        return NextResponse.json({ success: false, message: 'Invalid token.' }, { status: 401 });
    }
}

// Cập nhật thông tin người dùng
export async function PUT(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken');
    if (!token) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const body = await request.json();
        const { fullName, phone, email, address, city, district, newPassword } = body;

        // Cập nhật bảng customers
        const { error: updateCustomerError } = await supabase
            .from('customers')
            .update({
                full_name: fullName,
                phone_number: phone,
                email: email,
                shipping_address: address,
                city: city,
                district: district
            })
            .eq('account_id', decoded.id);

        if (updateCustomerError) throw updateCustomerError;

        // Nếu có mật khẩu mới, cập nhật bảng accounts
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const { error: updateAccountError } = await supabase
                .from('accounts')
                .update({ password_hash: hashedPassword })
                .eq('id', decoded.id);

            if (updateAccountError) throw updateAccountError;
        }

        return NextResponse.json({ success: true, message: 'Cập nhật thông tin thành công!' });
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}