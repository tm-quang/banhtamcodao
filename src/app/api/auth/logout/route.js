// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    const cookieStore = await cookies();
    cookieStore.delete('sessionToken');
    return NextResponse.json({ success: true, message: 'Đăng xuất thành công.' });
}