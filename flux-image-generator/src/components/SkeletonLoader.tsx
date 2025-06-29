'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'image' | 'gallery' | 'text' | 'button';
  count?: number;
  className?: string;
}

const SkeletonLoader = ({ variant = 'image', count = 1, className = '' }: SkeletonLoaderProps) => {
  const skeletonVariants = {
    image: 'aspect-square rounded-xl bg-gradient-to-r from-zinc-800/50 to-zinc-700/50',
    gallery: 'aspect-square rounded-lg bg-gradient-to-r from-zinc-800/40 to-zinc-700/40',
    text: 'h-4 rounded bg-gradient-to-r from-zinc-800/50 to-zinc-700/50',
    button: 'h-10 rounded-lg bg-gradient-to-r from-zinc-800/50 to-zinc-700/50'
  };

  // const shimmerAnimation = {
  //   initial: { backgroundPosition: '-200% 0' },
  //   animate: { backgroundPosition: '200% 0' },
  // };

  const SkeletonItem = ({ index }: { index: number }) => (
    <motion.div
      key={index}
      className={`${skeletonVariants[variant]} ${className} relative overflow-hidden`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* 发光效果 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent"
        style={{
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* 脉冲动画 */}
      <motion.div
        className="absolute inset-0 bg-zinc-600/20 rounded-inherit"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 图片骨架的特殊内容 */}
      {variant === 'image' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500/60 rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );

  if (count === 1) {
    return <SkeletonItem index={0} />;
  }

  return (
    <div className="grid gap-4">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonItem key={index} index={index} />
      ))}
    </div>
  );
};

// 专门的图片生成骨架屏组件
export const ImageGenerationSkeleton = ({ numImages = 1 }: { numImages?: number }) => {
  const getGridClass = () => {
    if (numImages === 1) return 'grid-cols-1 max-w-2xl mx-auto';
    if (numImages === 2) return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div className={`grid gap-8 ${getGridClass()}`}>
      {Array.from({ length: numImages }, (_, index) => (
        <motion.div
          key={index}
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <SkeletonLoader variant="image" className="border-2 border-amber-500/20" />
          
          {/* 生成提示 */}
          <motion.div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-amber-200 px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-amber-500/30"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            正在生成第 {index + 1} 张...
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

// 画廊骨架屏组件
export const GallerySkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="gallery-atelier">
    {Array.from({ length: count }, (_, index) => (
      <SkeletonLoader 
        key={index} 
        variant="gallery" 
        className="gallery-masterpiece"
      />
    ))}
  </div>
);

export default SkeletonLoader;