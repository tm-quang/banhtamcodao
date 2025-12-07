/**
 * Customers API route handler
 * @file src/app/api/customers/route.js
 */
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
    try {
        const { data: rows, error } = await supabase
            .from('customers')
            .select(`
                id, full_name, phone_number, email, reward_points, created_at,
                accounts (username)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const customers = rows.map(c => ({
            id: c.id,
            full_name: c.full_name,
            phone_number: c.phone_number,
            email: c.email,
            username: c.accounts?.username,
            reward_points: c.reward_points,
            created_at: c.created_at
        }));

        return NextResponse.json({ success: true, customers });
    } catch (error) {
        console.error('API Error - /api/customers:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
    }
}