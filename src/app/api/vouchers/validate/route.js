// src/app/api/vouchers/validate/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const { code, subtotal } = await request.json();

        if (!code || !code.trim()) {
            return NextResponse.json(
                { success: false, message: 'Vui lòng nhập mã giảm giá' },
                { status: 400 }
            );
        }

        const voucherCode = code.trim().toUpperCase();

        // Kiểm tra voucher trong database
        const [vouchers] = await pool.execute(
            `SELECT * FROM promotions 
             WHERE promo_code = ? AND status = 'active'`,
            [voucherCode]
        );

        if (vouchers.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' },
                { status: 404 }
            );
        }

        const voucher = vouchers[0];
        const now = new Date();
        const startDate = new Date(voucher.start_date);
        const endDate = new Date(voucher.end_date);

        // Kiểm tra thời gian hiệu lực
        if (now < startDate) {
            return NextResponse.json(
                { success: false, message: 'Mã giảm giá chưa có hiệu lực' },
                { status: 400 }
            );
        }

        if (now > endDate) {
            return NextResponse.json(
                { success: false, message: 'Mã giảm giá đã hết hạn' },
                { status: 400 }
            );
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        const minOrderValue = voucher.min_order_value || 0;
        if (subtotal < minOrderValue) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minOrderValue)} để sử dụng mã này` 
                },
                { status: 400 }
            );
        }

        // Tính toán số tiền giảm
        let discountAmount = 0;
        if (voucher.discount_type === 'percentage') {
            // Giảm theo phần trăm
            discountAmount = Math.round((subtotal * voucher.discount_value) / 100);
        } else if (voucher.discount_type === 'fixed') {
            // Giảm số tiền cố định
            discountAmount = voucher.discount_value;
            // Đảm bảo không giảm quá số tiền đơn hàng
            if (discountAmount > subtotal) {
                discountAmount = subtotal;
            }
        }

        return NextResponse.json({
            success: true,
            voucher: {
                code: voucher.promo_code,
                title: voucher.title,
                discount_type: voucher.discount_type,
                discount_value: voucher.discount_value,
                discount_amount: discountAmount
            }
        });

    } catch (error) {
        console.error('Error validating voucher:', error);
        return NextResponse.json(
            { success: false, message: 'Có lỗi xảy ra khi kiểm tra mã giảm giá' },
            { status: 500 }
        );
    }
}

