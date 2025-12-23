import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadApi } from '../api/upload';
import { cn } from '../utils/cn';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export function ImageUpload({
  value,
  onChange,
  className,
  disabled,
  label,
  aspectRatio = 'square',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('ไฟล์ต้องมีขนาดไม่เกิน 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadApi.uploadImage(file);
      if (response.success && response.data) {
        onChange(response.data.url);
      } else {
        setError(response.error?.message || 'อัปโหลดไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  };

  return (
    <div className={cn('w-full', className)}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg overflow-hidden transition-colors',
          value ? 'border-gray-300' : 'border-gray-300 hover:border-primary-400',
          aspectClasses[aspectRatio],
          !aspectRatio && 'min-h-[200px]'
        )}
      >
        {value ? (
          <>
            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            ) : (
              <>
                <div className="p-3 bg-gray-100 rounded-full mb-2">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">คลิกเพื่ออัปโหลดรูปภาพ</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF ไม่เกิน 5MB</p>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface MultiImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export function MultiImageUpload({
  value = [],
  onChange,
  maxImages = 10,
  className,
  disabled,
  label,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if max images exceeded
    if (value.length + files.length > maxImages) {
      setError(`สามารถอัปโหลดได้สูงสุด ${maxImages} รูป`);
      return;
    }

    // Validate file types and sizes
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('แต่ละไฟล์ต้องมีขนาดไม่เกิน 5MB');
        return;
      }
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadApi.uploadImages(files);
      if (response.success && response.data) {
        const newUrls = response.data.files.map((f) => f.url);
        onChange([...value, ...newUrls]);
      } else {
        setError(response.error?.message || 'อัปโหลดไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} ({value.length}/{maxImages})
        </label>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {value.map((url, index) => (
          <div
            key={url}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
          >
            <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        {value.length < maxImages && !disabled && (
          <div
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">เพิ่มรูป</span>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        disabled={disabled || isUploading}
        className="hidden"
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
