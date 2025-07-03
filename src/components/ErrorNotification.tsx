'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Wifi, Clock, Settings, Lightbulb } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

export interface ErrorInfo {
  id: string;
  type: 'network' | 'api' | 'user' | 'timeout' | 'quota' | 'unknown';
  title: string;
  message: string;
  suggestion?: string;
  action?: {
    label: string;
    handler: () => void;
  };
  autoClose?: boolean;
  duration?: number;
}

interface ErrorNotificationProps {
  errors: ErrorInfo[];
  onRemoveError: (id: string) => void;
}

const ErrorNotification = ({ errors, onRemoveError }: ErrorNotificationProps) => {
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set());

  const getErrorIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'network':
        return <Wifi className="w-5 h-5" />;
      case 'timeout':
        return <Clock className="w-5 h-5" />;
      case 'api':
        return <Settings className="w-5 h-5" />;
      case 'quota':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getErrorColor = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'network':
        return 'border-blue-500/30 bg-blue-900/20';
      case 'timeout':
        return 'border-orange-500/30 bg-orange-900/20';
      case 'api':
        return 'border-purple-500/30 bg-purple-900/20';
      case 'quota':
        return 'border-yellow-500/30 bg-yellow-900/20';
      case 'user':
        return 'border-amber-500/30 bg-amber-900/20';
      default:
        return 'border-red-500/30 bg-red-900/20';
    }
  };

  const handleDismiss = useCallback((errorId: string) => {
    setDismissedErrors(prev => new Set([...prev, errorId]));
    setTimeout(() => {
      onRemoveError(errorId);
      setDismissedErrors(prev => {
        const newSet = new Set(prev);
        newSet.delete(errorId);
        return newSet;
      });
    }, 300);
  }, [onRemoveError]);

  // 自动关闭错误
  useEffect(() => {
    errors.forEach(error => {
      if (error.autoClose && error.duration) {
        const timer = setTimeout(() => {
          handleDismiss(error.id);
        }, error.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [errors, handleDismiss]);

  const visibleErrors = errors.filter(error => !dismissedErrors.has(error.id));

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md">
      <AnimatePresence>
        {visibleErrors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`
              ${getErrorColor(error.type)}
              border rounded-xl p-4 backdrop-blur-xl shadow-2xl
              transform transition-all duration-300
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 text-white">
                  {getErrorIcon(error.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm mb-1">
                    {error.title}
                  </h4>
                  <p className="text-white/80 text-sm leading-relaxed mb-2">
                    {error.message}
                  </p>
                  
                  {error.suggestion && (
                    <div className="flex items-start space-x-2 mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
                      <Lightbulb className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                      <p className="text-amber-200 text-xs leading-relaxed">
                        {error.suggestion}
                      </p>
                    </div>
                  )}
                  
                  {error.action && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        onClick={error.action.handler}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs"
                      >
                        {error.action.label}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDismiss(error.id)}
                className="flex-shrink-0 w-6 h-6 text-white/60 hover:text-white hover:bg-white/20 ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// 错误管理 Hook
export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const addError = (errorInfo: Omit<ErrorInfo, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setErrors(prev => [...prev, { ...errorInfo, id }]);
  };

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  // 预定义的错误类型
  const showNetworkError = (message?: string) => {
    addError({
      type: 'network',
      title: '网络连接异常',
      message: message || '无法连接到服务器，请检查您的网络连接',
      suggestion: '请检查网络连接或稍后重试',
      autoClose: true,
      duration: 5000
    });
  };

  const showApiError = (message?: string, action?: ErrorInfo['action']) => {
    addError({
      type: 'api',
      title: '服务器错误',
      message: message || '服务器遇到了一些问题',
      suggestion: '这通常是临时性问题，请稍后重试',
      action,
      autoClose: true,
      duration: 8000
    });
  };

  const showQuotaError = (message?: string) => {
    addError({
      type: 'quota',
      title: '使用额度不足',
      message: message || '今日免费额度已用完',
      suggestion: '升级到会员计划获得更多额度',
      action: {
        label: '查看会员计划',
        handler: () => {
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  };

  const showUserError = (message: string, suggestion?: string) => {
    addError({
      type: 'user',
      title: '输入错误',
      message,
      suggestion,
      autoClose: true,
      duration: 4000
    });
  };

  const showTimeoutError = () => {
    addError({
      type: 'timeout',
      title: '请求超时',
      message: '图像生成时间过长，请稍后重试',
      suggestion: '可以尝试使用更简单的提示词或减少生成数量',
      autoClose: true,
      duration: 6000
    });
  };

  return {
    errors,
    addError,
    removeError,
    clearAllErrors,
    showNetworkError,
    showApiError,
    showQuotaError,
    showUserError,
    showTimeoutError,
    ErrorNotificationComponent: () => (
      <ErrorNotification errors={errors} onRemoveError={removeError} />
    )
  };
};

export default ErrorNotification;