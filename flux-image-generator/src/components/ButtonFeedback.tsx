'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';

interface ButtonFeedbackProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  title?: string;
  hapticFeedback?: boolean;
  soundFeedback?: boolean;
}

const ButtonFeedback = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'default',
  size = 'default',
  className = '',
  title,
  hapticFeedback = true,
  soundFeedback = false
}: ButtonFeedbackProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const triggerHapticFeedback = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // 短暂震动反馈
    }
  };

  const triggerSoundFeedback = () => {
    if (soundFeedback) {
      // 创建简单的音频反馈
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || loading) return;

    setIsPressed(true);
    triggerHapticFeedback();
    
    // 创建涟漪效果
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { id: Date.now(), x, y };
      setRipples(prev => [...prev, newRipple]);
      
      // 300ms后清除涟漪
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (disabled || loading) return;
    
    triggerSoundFeedback();
    onClick?.();
  };

  const getVariantClasses = () => {
    const baseClasses = 'relative overflow-hidden transition-all duration-200 active:scale-95';
    const variantClasses = {
      default: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
      secondary: 'bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
      ghost: 'hover:bg-amber-500/10 text-amber-200 hover:text-amber-100 border border-transparent hover:border-amber-500/30',
      destructive: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
    };
    return `${baseClasses} ${variantClasses[variant]}`;
  };

  return (
    <motion.div
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Button
        ref={buttonRef}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsPressed(false)}
        disabled={disabled || loading}
        variant="ghost"
        size={size}
        title={title}
        className={`
          ${getVariantClasses()}
          ${isPressed ? 'brightness-110 scale-95' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${loading ? 'cursor-wait' : ''}
          ${className}
        `}
      >
        {/* 涟漪效果 */}
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0 }}
            animate={{ 
              width: 100, 
              height: 100, 
              x: -50, 
              y: -50,
              opacity: [0.5, 0]
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}

        {/* 加载状态 */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}

        {/* 按钮内容 */}
        <motion.div
          className="flex items-center justify-center gap-2"
          animate={{
            scale: isPressed ? 0.95 : 1,
            opacity: loading ? 0.7 : 1
          }}
          transition={{ duration: 0.1 }}
        >
          {children}
        </motion.div>

        {/* 光泽效果 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ pointerEvents: 'none' }}
        />
      </Button>
    </motion.div>
  );
};

// 专门的图标按钮组件
export const IconButtonFeedback = ({ 
  icon, 
  tooltip, 
  onClick, 
  disabled = false,
  className = '',
  variant = 'ghost' as const
}: { 
  icon: React.ReactNode;
  tooltip?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
}) => {
  return (
    <ButtonFeedback
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size="icon"
      className={className}
      title={tooltip}
    >
      {icon}
    </ButtonFeedback>
  );
};

// 主要动作按钮组件
export const PrimaryButtonFeedback = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) => {
  return (
    <ButtonFeedback
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      variant="default"
      size="lg"
      className={`font-semibold px-8 py-3 ${className}`}
      hapticFeedback={true}
      soundFeedback={true}
    >
      {children}
    </ButtonFeedback>
  );
};

export default ButtonFeedback;