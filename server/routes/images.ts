import { Router } from 'express';
import multer, { FileFilterCallback } from 'multer';
import * as imageStorage from '../services/imageStorage.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Configure multer for temporary file storage (before uploading to Cloudinary)
const storage = multer.memoryStorage(); // Store in memory instead of disk

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_req, file, cb: FileFilterCallback) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(file.originalname.split('.').pop()?.toLowerCase() || '');
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
        }
    }
});

/**
 * Upload image to Cloudinary
 * POST /api/images/upload
 */
router.post('/upload', authenticateToken, upload.single('image'), async (req: AuthRequest, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const folder = req.body.folder || 'ecobite';
        const publicId = req.body.publicId;

        // Upload to Cloudinary
        const result = await imageStorage.uploadImage(req.file.buffer, folder, publicId);

        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            message: 'Image uploaded successfully'
        });
    } catch (error: any) {
        console.error('Image upload error:', error);

        // If Cloudinary not configured, return error
        if (error.message === 'Cloudinary not configured') {
            return res.status(503).json({
                error: 'Image storage not configured',
                message: 'Please configure Cloudinary or use image URLs directly'
            });
        }

        res.status(500).json({
            error: 'Failed to upload image',
            message: error.message
        });
    }
});

/**
 * Upload image from URL to Cloudinary
 * POST /api/images/upload-url
 */
router.post('/upload-url', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { imageUrl, folder } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        const result = await imageStorage.uploadImageFromUrl(imageUrl, folder || 'ecobite');

        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            message: 'Image uploaded successfully'
        });
    } catch (error: any) {
        console.error('Image upload from URL error:', error);
        res.status(500).json({
            error: 'Failed to upload image from URL',
            message: error.message
        });
    }
});

/**
 * Delete image from Cloudinary
 * DELETE /api/images/:publicId
 */
router.delete('/:publicId', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { publicId } = req.params;

        if (!publicId) {
            return res.status(400).json({ error: 'Public ID is required' });
        }

        await imageStorage.deleteImage(publicId);

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error: any) {
        console.error('Image deletion error:', error);
        res.status(500).json({
            error: 'Failed to delete image',
            message: error.message
        });
    }
});

/**
 * Check if Cloudinary is configured
 * GET /api/images/config
 */
router.get('/config', (_req, res) => {
    const isConfigured = imageStorage.isCloudinaryConfigured();
    res.json({
        cloudinaryConfigured: isConfigured,
        message: isConfigured
            ? 'Cloudinary is configured and ready to use'
            : 'Cloudinary is not configured. Add CLOUDINARY_* environment variables.'
    });
});

export default router;

