import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import * as azureStorage from './azureStorage.js';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Upload image buffer to Cloudinary or Azure
 * @param fileBuffer - Image file buffer
 * @param folder - Folder name (default: 'ecobite')
 * @param publicId - Optional public ID
 * @returns Promise with result
 */
export async function uploadImage(
    fileBuffer: Buffer,
    folder: string = 'ecobite',
    publicId?: string
): Promise<{ secure_url: string; public_id: string }> {
    // PREFER AZURE IF CONFIGURED
    if (azureStorage.isAzureConfigured()) {
        try {
            const result = await azureStorage.uploadToAzure(fileBuffer, undefined, folder);
            return {
                secure_url: result.url,
                public_id: result.publicId
            };
        } catch (error) {
            console.error('Azure upload failed, trying Cloudinary...', error);
        }
    }

    return new Promise((resolve, reject) => {
        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET) {
            console.log('⚠️ No cloud storage configured. Falling back to Data URI for Demo Mode.');
            // For demo mode, we return the image back as a data URI if possible
            // Note: In real scenarios, you'd save to local /uploads/ folder
            // But for a fast demo, returning the Base64/Buffer as a source works
            const base64 = fileBuffer.toString('base64');
            const dataUri = `data:image/jpeg;base64,${base64}`;
            resolve({
                secure_url: dataUri,
                public_id: `demo-${Date.now()}`
            });
            return;
        }

        const uploadOptions: any = {
            folder,
            resource_type: 'image',
            transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else if (result) {
                    console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id
                    });
                } else {
                    reject(new Error('Upload failed: No result from Cloudinary'));
                }
            }
        );

        // Convert buffer to stream
        const stream = Readable.from(fileBuffer);
        stream.pipe(uploadStream);
    });
}

/**
 * Upload image from URL
 */
export async function uploadImageFromUrl(
    imageUrl: string,
    folder: string = 'ecobite'
): Promise<{ secure_url: string; public_id: string }> {
    // Azure doesn't have a direct "upload from URL" as simple as Cloudinary, 
    // but we can fetch and upload buffer. For now, Cloudinary fallback is fine.

    if (azureStorage.isAzureConfigured()) {
        // Just return original URL if it's already a cloud URL, or fetch/upload if needed
        // For simplicity in prototype, we'll keep Cloudinary as the primary mapper for URLs
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET) {
        return {
            secure_url: imageUrl,
            public_id: ''
        };
    }

    try {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder,
            resource_type: 'image',
            transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        return {
            secure_url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Error uploading image from URL:', error);
        return {
            secure_url: imageUrl,
            public_id: ''
        };
    }
}

/**
 * Delete image
 */
export async function deleteImage(publicId: string): Promise<void> {
    if (azureStorage.isAzureConfigured()) {
        try {
            await azureStorage.deleteFromAzure(publicId);
            return;
        } catch (e) { }
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) return;

    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image:', error);
    }
}

/**
 * Check if storage is configured
 */
export function isCloudinaryConfigured(): boolean {
    return azureStorage.isAzureConfigured() || !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
}

export default {
    uploadImage,
    uploadImageFromUrl,
    deleteImage,
    isCloudinaryConfigured
};

