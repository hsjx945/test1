'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "修改前",
  afterLabel = "修改后",
  className = ""
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取鼠标或触摸位置的百分比
  const getPercentage = useCallback((clientX: number) => {
    if (!containerRef.current) return 50;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    return percentage;
  }, []);

  // 处理拖拽移动
  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    setSliderPosition(getPercentage(clientX));
  }, [isDragging, getPercentage]);

  // 处理拖拽结束
  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 鼠标事件
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setSliderPosition(getPercentage(e.clientX));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // 触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setSliderPosition(getPercentage(e.touches[0].clientX));
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // 全局事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border border-amber-500/30 shadow-2xl ${className}`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        '--slider-pos': `${sliderPosition}%`
      } as React.CSSProperties}
    >
      {/* Before Image (Background) */}
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="object-cover"
          priority
        />
        
        {/* After Image (Overlay with clip) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ 
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` 
          }}
        >
          <Image
            src={afterImage}
            alt={afterLabel}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* 分隔线 - 使用CSS变量，保持简单 */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white z-10 cursor-ew-resize"
          style={{ 
            left: 'var(--slider-pos)',
            transform: 'translateX(-50%)',
            filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.9))'
          }}
        />

        {/* 手柄 - 确保transform永远不被覆盖 */}
        <motion.div 
          className="absolute w-8 h-8 bg-white rounded-full shadow-xl border-2 border-gray-300 z-20 cursor-ew-resize flex items-center justify-center"
          style={{
            top: '50%',
            left: 'var(--slider-pos)',
            transform: 'translate(-50%, -50%)'
          }}
          whileHover={{ 
            transform: 'translate(-50%, -50%) scale(1.1)' // 保持translate，只添加scale
          }}
          whileTap={{ 
            transform: 'translate(-50%, -50%) scale(0.95)' 
          }}
          animate={{ 
            transform: isDragging 
              ? 'translate(-50%, -50%) scale(1.1)' 
              : 'translate(-50%, -50%) scale(1)'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* 手柄内部指示器 */}
          <div className="flex items-center gap-0.5">
            <div className="w-0.5 h-4 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-4 bg-gray-500 rounded-full"></div>
          </div>
        </motion.div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
          {beforeLabel}
        </div>
        <div 
          className="absolute top-4 right-4 bg-amber-500/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
          style={{ 
            opacity: sliderPosition > 70 ? 1 : 0,
            transition: 'opacity 0.2s ease'
          }}
        >
          {afterLabel}
        </div>

        {/* Instruction Text */}
        {!isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-xs backdrop-blur-sm"
          >
            拖动滑块对比效果
          </motion.div>
        )}
      </div>
    </div>
  );
}