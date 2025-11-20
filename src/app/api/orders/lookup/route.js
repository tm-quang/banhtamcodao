// src/app/api/orders/lookup/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request) {
    try {
        const { phoneNumber } = await request.json();

        if (!phoneNumber) {
            return NextResponse.json({ success: false, message: 'Vui lòng nhập số điện thoại.' }, { status: 400 });
        }

        const { data: rows, error } = await supabase
            .from('orders')
            .select('*')
            .eq('phone_number', phoneNumber)
            .order('order_time', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, orders: rows });

    } catch (error) {
        console.error('API Error - /api/orders/lookup:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}