import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'donation-images';

/**
 * Upload image buffer to Azure Blob Storage
 * @param fileBuffer - Image file buffer
 * @param fileName - Optional file name
 * @returns Promise with blob URL
 */
export async function uploadToAzure(
    fileBuffer: Buffer,
    fileName?: string
): Promise<{ url: string; publicId: string }> {
    if (!connectionString) {
        throw new Error('Azure Storage Connection String not configured');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container if it doesn't exist
    await containerClient.createIfNotExists({ access: 'blob' });

    const id = uuidv4();
    const finalFileName = fileName || `${id}.jpg`;
    const blockBlobClient = containerClient.getBlockBlobClient(finalFileName);

    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: { blobContentType: 'image/jpeg' }
    });

    console.log(`✅ Image uploaded to Azure: ${blockBlobClient.url}`);

    return {
        url: blockBlobClient.url,
        publicId: finalFileName
    };
}

export async function deleteFromAzure(publicId: string): Promise<void> {
    if (!connectionString) return;

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(publicId);

    await blockBlobClient.deleteIfExists();
    console.log(`✅ Image deleted from Azure: ${publicId}`);
}

export function isAzureConfigured(): boolean {
    return !!connectionString;
}
