'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Download, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt?: string;
  imageName?: string;
}

const ImagePreviewModal = ({ 
  isOpen, 
  onClose, 
  imageSrc, 
  imageAlt = '图片预览', 
  imageName = '图片' 
}: ImagePreviewModalProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${imageName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-w-[90vw] max-h-[90vh] w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部工具栏 */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-white font-medium bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                  {imageName}
                </h3>
              </div>
              
              {/* 工具按钮 */}
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  onClick={handleZoomOut}
                  className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                  title="缩小"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                
                <Button
                  size="icon"
                  onClick={resetTransform}
                  className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                  title="重置视图"
                >
                  <span className="text-xs font-medium">{Math.round(zoom * 100)}%</span>
                </Button>
                
                <Button
                  size="icon"
                  onClick={handleZoomIn}
                  className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                  title="放大"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                
                <Button
                  size="icon"
                  onClick={handleRotate}
                  className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                  title="旋转"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                
                <Button
                  size="icon"
                  onClick={handleDownload}
                  className="bg-amber-600/80 hover:bg-amber-600 text-white backdrop-blur-sm"
                  title="下载"
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                <Button
                  size="icon"
                  onClick={onClose}
                  className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                  title="关闭"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 图片容器 */}
            <div className="relative bg-black/20 rounded-xl overflow-hidden border border-amber-500/20">
              <div 
                className="flex items-center justify-center min-h-[400px] max-h-[80vh] overflow-hidden"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={1024}
                  height={1024}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3))'
                  }}
                />
              </div>
            </div>

            {/* 底部信息栏 */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between text-sm text-white">
                <span>点击空白处关闭 • 滚轮缩放 • 右键重置</span>
                <div className="flex items-center gap-4">
                  <span>缩放: {Math.round(zoom * 100)}%</span>
                  <span>旋转: {rotation}°</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImagePreviewModal;