'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Camera, Edit3, X } from 'lucide-react';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  editedPreview?: string;
}

interface ImageUploadProps {
  onImagesChange?: (images: UploadedImage[]) => void;
  onEditImage?: (id: string) => void;
  maxImages?: number;
  className?: string;
}

export default function ImageUpload({ 
  onImagesChange, 
  onEditImage,
  maxImages = 4,
  className = ""
}: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          const newImage: UploadedImage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            file,
            preview,
            name: file.name
          };
          
          const updatedImages = [...uploadedImages, newImage].slice(0, maxImages);
          setUploadedImages(updatedImages);
          onImagesChange?.(updatedImages);
        };
        reader.readAsDataURL(file);
      }
    });
  }, [uploadedImages, maxImages, onImagesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleImageUpload(e.dataTransfer.files);
  }, [handleImageUpload]);

  const removeImage = (id: string) => {
    const updatedImages = uploadedImages.filter(img => img.id !== id);
    setUploadedImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  return (
    <div
      className={`atelier-upload p-4 text-center cursor-pointer transition-all duration-300 min-h-[160px] ${
        isDragOver ? 'dragover' : ''
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('image-upload')?.click()}
    >
      <input
        id="image-upload"
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleImageUpload(e.target.files)}
        className="hidden"
      />
      
      {uploadedImages.length === 0 ? (
        <>
          <Camera className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <p className="text-sm text-amber-300/70">
            拖拽图像到此处<br />
            或点击上传
          </p>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {uploadedImages.map((img) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="aspect-square rounded-lg overflow-hidden border border-amber-500/30">
                <Image
                  src={img.editedPreview || img.preview}
                  alt={img.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditImage?.(img.id);
                }}
                className="absolute -top-1 -left-1 bg-amber-500 hover:bg-amber-600 text-black rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(img.id);
                }}
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}