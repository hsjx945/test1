'use client';

import { useState, useRef, useCallback } from 'react';
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

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, [isDragging]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, [isDragging]);

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border border-amber-500/30 shadow-2xl ${className}`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
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

        {/* Slider Line */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-lg cursor-ew-resize z-10"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* Slider Handle */}
          <motion.div 
            className="absolute top-1/2 left-1/2 w-8 h-8 bg-amber-400 rounded-full shadow-xl cursor-ew-resize border-2 border-white"
            style={{ transform: 'translate(-50%, -50%)' }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-4 bg-white rounded-full mx-0.5"></div>
              <div className="w-1 h-4 bg-white rounded-full mx-0.5"></div>
            </div>
          </motion.div>
        </div>

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