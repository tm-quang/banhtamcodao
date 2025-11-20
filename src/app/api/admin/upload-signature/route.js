// src/app/api/admin/upload-signature/route.js
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    const body = await request.json();
    const { paramsToSign } = body;

    try {
        const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
        return NextResponse.json({ signature });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Lỗi tạo chữ ký' }, { status: 500 });
    }
}