import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Upload image buffer to Cloudinary
 * @param fileBuffer - Image file buffer
 * @param folder - Folder name in Cloudinary (default: 'ecobite')
 * @param publicId - Optional public ID for the image
 * @returns Promise with Cloudinary upload result
 */
export async function uploadImage(
    fileBuffer: Buffer,
    folder: string = 'ecobite',
    publicId?: string
): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || 
            !process.env.CLOUDINARY_API_KEY || 
            !process.env.CLOUDINARY_API_SECRET) {
            console.log('⚠️ Cloudinary not configured. Using local storage fallback.');
            reject(new Error('Cloudinary not configured'));
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
 * Upload image from URL to Cloudinary
 * @param imageUrl - URL of the image to upload
 * @param folder - Folder name in Cloudinary
 * @returns Promise with Cloudinary upload result
 */
export async function uploadImageFromUrl(
    imageUrl: string,
    folder: string = 'ecobite'
): Promise<{ secure_url: string; public_id: string }> {
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
        console.log('⚠️ Cloudinary not configured. Returning original URL.');
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

        console.log('✅ Image uploaded from URL to Cloudinary:', result.secure_url);
        return {
            secure_url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Error uploading image from URL:', error);
        // Return original URL if upload fails
        return {
            secure_url: imageUrl,
            public_id: ''
        };
    }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Promise with deletion result
 */
export async function deleteImage(publicId: string): Promise<void> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        console.log('⚠️ Cloudinary not configured. Skipping deletion.');
        return;
    }

    try {
        await cloudinary.uploader.destroy(publicId);
        console.log('✅ Image deleted from Cloudinary:', publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
    return !!(
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

