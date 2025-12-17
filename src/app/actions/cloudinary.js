/**
 * src/app/actions/cloudinary.js
 * Server Actions for secure Cloudinary operations
 * Uses private environment variables (CLOUDINARY_API_SECRET)
 */
'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with private env vars (server-side only)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Server Action: Upload image to Cloudinary securely
 * @param {FormData} formData - FormData containing the image file
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadImage(formData) {
    try {
        const file = formData.get('file');
        const uploadPreset = formData.get('upload_preset') || 'banhtamcodao';

        if (!file || !(file instanceof File)) {
            return {
                success: false,
                error: 'No file provided'
            };
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return {
                success: false,
                error: 'File must be an image'
            };
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return {
                success: false,
                error: 'File size must be less than 10MB'
            };
        }

        // Convert File to buffer for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using server-side credentials
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    upload_preset: uploadPreset,
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        return {
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload image'
        };
    }
}

/**
 * Server Action: Generate upload signature for client-side uploads (if needed)
 * This allows secure client-side uploads without exposing API secret
 * @param {Object} paramsToSign - Parameters to sign
 * @returns {Promise<{success: boolean, signature?: string, error?: string}>}
 */
export async function generateUploadSignature(paramsToSign) {
    try {
        if (!process.env.CLOUDINARY_API_SECRET) {
            return {
                success: false,
                error: 'Cloudinary API secret not configured'
            };
        }

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        return {
            success: true,
            signature
        };
    } catch (error) {
        console.error('Signature generation error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate signature'
        };
    }
}
