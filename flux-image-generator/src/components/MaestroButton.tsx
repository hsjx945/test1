'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Wand, Sparkles, Star } from 'lucide-react';
import { useState } from 'react';

interface MaestroButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}

export default function MaestroButton({
  onClick,
  disabled = false,
  loading = false,
  children,
  className = '',
  size = 'lg',
  variant = 'primary'
}: MaestroButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm min-w-32 min-h-12',
    md: 'py-4 px-8 text-lg min-w-48 min-h-16',
    lg: 'py-6 px-12 text-xl min-w-72 min-h-24'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white font-bold shadow-2xl border-0',
    secondary: 'bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30'
  };

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
    onClick();
  };

  // 魔法粒子生成器 - 使用确定性动画避免hydration问题
  const generateParticles = (count: number) => {
    const positions = [
      { x: -80, y: -60 }, { x: 80, y: -60 }, { x: -100, y: 0 }, { x: 100, y: 0 },
      { x: -60, y: 80 }, { x: 60, y: 80 }, { x: -40, y: -100 }, { x: 40, y: -100 },
      { x: -120, y: -40 }, { x: 120, y: -40 }, { x: -80, y: 100 }, { x: 80, y: 100 }
    ];
    const rotations = [0, 45, 90, 135, 180, 225, 270, 315, 30, 60, 120, 150];
    const delays = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.15, 0.25, 0.35, 0.45, 0.05, 0.55];
    
    return Array.from({ length: count }, (_, i) => (
      <motion.div
        key={i}
        initial={{ 
          opacity: 0, 
          scale: 0,
          x: 0,
          y: 0,
          rotate: 0
        }}
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
          x: positions[i % positions.length].x,
          y: positions[i % positions.length].y,
          rotate: rotations[i % rotations.length]
        }}
        transition={{
          duration: 1.5,
          delay: delays[i % delays.length],
          ease: "easeOut"
        }}
        className="absolute pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
        }}
      >
        {i % 2 === 0 ? (
          <Sparkles className="w-3 h-3 text-amber-300" />
        ) : (
          <Star className="w-2 h-2 text-amber-400" />
        )}
      </motion.div>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="text-center relative"
    >
      <motion.button
        onClick={handleClick}
        disabled={disabled || loading}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 0 40px rgba(251, 191, 36, 0.8), 0 0 80px rgba(251, 191, 36, 0.4)"
        }}
        whileTap={{ scale: 0.95 }}
        className={`group relative overflow-hidden rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        style={{
          background: variant === 'primary' ? 
            'linear-gradient(45deg, #f59e0b, #d97706, #92400e, #f59e0b)' : undefined,
          backgroundSize: variant === 'primary' ? '400% 400%' : undefined,
          animation: variant === 'primary' ? 'gradient-shift 3s ease infinite' : undefined,
        }}
      >
        {/* 魔法光环效果 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: isHovered 
              ? ["0 0 20px rgba(251, 191, 36, 0.3)", "0 0 40px rgba(251, 191, 36, 0.6)", "0 0 20px rgba(251, 191, 36, 0.3)"]
              : "0 0 0px rgba(251, 191, 36, 0)"
          }}
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
            ease: "easeInOut"
          }}
        />

        {/* 按钮内容 */}
        <div className="relative z-10 flex items-center justify-center">
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-6 h-6 mr-3" />
              </motion.div>
              <span>创作中...</span>
            </>
          ) : (
            <>
              <motion.div
                animate={{ 
                  rotate: isHovered ? 12 : 0,
                  scale: isClicked ? [1, 1.2, 1] : 1
                }}
                transition={{ 
                  duration: 0.3,
                  scale: { duration: 0.6 }
                }}
              >
                <Wand className="w-6 h-6 mr-3" />
              </motion.div>
              <span>{children || '开始创作'}</span>
            </>
          )}
        </div>

        {/* 魔法粒子效果 */}
        <AnimatePresence>
          {(isClicked || isHovered) && (
            <div className="absolute inset-0 pointer-events-none">
              {generateParticles(isClicked ? 12 : 6)}
            </div>
          )}
        </AnimatePresence>

        {/* 点击波纹效果 */}
        <AnimatePresence>
          {isClicked && (
            <motion.div
              initial={{ opacity: 0.6, scale: 0 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full border-2 border-amber-400"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}