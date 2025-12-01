import { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface ImageUploadProps {
    onImageSelected: (file: File | null, url: string) => void;
    currentUrl?: string;
    compact?: boolean;
}

export default function ImageUpload({ onImageSelected, currentUrl, compact = false }: ImageUploadProps) {
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
    const [imageUrl, setImageUrl] = useState(currentUrl || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                onImageSelected(file, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlChange = (url: string) => {
        setImageUrl(url);
        setPreview(url);
        onImageSelected(null, url);
    };

    const clearImage = () => {
        setSelectedFile(null);
        setImageUrl('');
        setPreview('');
        onImageSelected(null, '');
    };

    if (compact) {
        return (
            <label className="cursor-pointer">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="w-8 h-8 bg-forest-900 text-ivory rounded-full flex items-center justify-center hover:bg-forest-800 transition-colors shadow-lg">
                    <Camera className="w-4 h-4" />
                </div>
            </label>
        );
    }

    return (
        <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${uploadMode === 'file'
                        ? 'bg-forest-900 text-ivory'
                        : 'bg-forest-100 text-forest-700'
                        }`}
                >
                    <Camera className="w-4 h-4 inline mr-2" />
                    Upload Image
                </button>
                <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${uploadMode === 'url'
                        ? 'bg-forest-900 text-ivory'
                        : 'bg-forest-100 text-forest-700'
                        }`}
                >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Image URL
                </button>
            </div>

            {/* File Upload Mode */}
            {uploadMode === 'file' && (
                <div>
                    <label className="block">
                        <div className="border-2 border-dashed border-forest-300 rounded-xl p-8 text-center cursor-pointer hover:border-forest-500 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Camera className="w-12 h-12 text-forest-400 mx-auto mb-2" />
                            <p className="text-forest-700 font-medium">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-forest-500 mt-1">
                                PNG, JPG, GIF up to 10MB
                            </p>
                        </div>
                    </label>
                </div>
            )}

            {/* URL Input Mode */}
            {uploadMode === 'url' && (
                <div>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://example.com/food.jpg"
                        className="w-full px-4 py-3 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none text-black"
                    />
                </div>
            )}

            {/* Image Preview */}
            {preview && (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {selectedFile && (
                        <div className="mt-2 text-sm text-forest-600">
                            <p>File: {selectedFile.name}</p>
                            <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
