'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import KontextShowcase from '@/components/KontextShowcase';
import PricingSection from '@/components/PricingSection';
import ProfessionalGenerator from '@/components/ProfessionalGenerator';
import { ImageGenerationSkeleton, GallerySkeleton } from '@/components/SkeletonLoader';
import { useErrorHandler } from '@/components/ErrorNotification';
import { IconButtonFeedback } from '@/components/ButtonFeedback';
import { 
  Download, 
  Copy,
  Moon,
  Sun,
  Wand,
  X,
  Mail,
  Twitter,
  Github,
  Cpu,
  Trash2,
  RotateCcw,
  Palette,
  Menu
} from 'lucide-react';

const STYLE_PRESETS = [
  { 
    id: 'realistic', 
    name: '写实摄影', 
    prompt: 'photorealistic, professional photography, high quality, detailed, masterpiece',
    description: '专业级摄影效果，细腻逼真'
  },
  { 
    id: 'artistic', 
    name: '艺术绘画', 
    prompt: 'oil painting, artistic style, fine art, masterpiece, detailed brushwork, classical',
    description: '古典油画风格，笔触细腻'
  },
  { 
    id: 'anime', 
    name: '动漫风格', 
    prompt: 'anime style, manga art, japanese animation, vibrant colors, detailed, high quality',
    description: '日系动漫风格，色彩鲜艳'
  },
  { 
    id: 'cinematic', 
    name: '电影质感', 
    prompt: 'cinematic lighting, movie scene, dramatic composition, film grain, atmospheric',
    description: '电影级画面质感，戏剧化构图'
  },
  { 
    id: 'minimalist', 
    name: '极简风格', 
    prompt: 'minimalist style, clean design, simple composition, modern art, elegant',
    description: '简约现代设计，优雅线条'
  },
  {
    id: 'fantasy',
    name: '奇幻风格',
    prompt: 'fantasy art, magical, ethereal, mystical atmosphere, epic fantasy, enchanting',
    description: '魔幻奇幻世界，神秘氛围'
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    prompt: 'cyberpunk style, neon lights, futuristic, high tech, sci-fi, digital art',
    description: '未来科技感，霓虹灯效果'
  },
  {
    id: 'vintage',
    name: '复古风格',
    prompt: 'vintage style, retro aesthetic, aged photo, nostalgic atmosphere, classic',
    description: '怀旧复古风情，经典美学'
  }
];



const MAX_DAILY_USAGE = 9999; // 测试阶段无限额度

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  style: string;
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  editedPreview?: string;
}

interface ImageEditState {
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export default function AtelierAI() {
  // 状态管理
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  // Flux Kontext 专用参数
  const [guidance, setGuidance] = useState(2.5);
  const [numInferenceSteps, setNumInferenceSteps] = useState(28);
  const [outputQuality, setOutputQuality] = useState(80);
  const [outputFormat] = useState('webp');
  const [goFast] = useState(true);
  const [seed] = useState('');
  const [numImages, setNumImages] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentGeneratedPrompt, setCurrentGeneratedPrompt] = useState(''); // 存储当前生成的提示词
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [usageToday, setUsageToday] = useState(0);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 新增：图像上传相关状态
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedUploadedImage, setSelectedUploadedImage] = useState<string | null>(null);
  const [useKontext, setUseKontext] = useState(false);
  
  // 图像编辑相关状态
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  
  // 错误处理
  const {
    showNetworkError,
    showApiError,
    showQuotaError,
    showUserError
    // showTimeoutError,
  } = useErrorHandler();
  const [imageEditState, setImageEditState] = useState<ImageEditState>({
    rotation: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    scale: 100,
    offsetX: 0,
    offsetY: 0
  });

  // 加载历史记录和使用次数
  useEffect(() => {
    const today = new Date().toDateString();
    const storedUsage = localStorage.getItem(`flux_usage_${today}`);
    if (storedUsage) {
      setUsageToday(parseInt(storedUsage));
    }

    const storedHistory = localStorage.getItem('flux_history');
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error('Failed to parse history:', error);
      }
    }
    
    // 模拟加载时间，然后设置加载完成
    setTimeout(() => {
      setIsHistoryLoading(false);
    }, 800);
  }, []);

  // 简单的中英词典（本地翻译备用）
  const simpleTranslateDict: Record<string, string> = {
    '美丽': 'beautiful', '漂亮': 'pretty', '女孩': 'girl', '男孩': 'boy',
    '女人': 'woman', '男人': 'man', '猫': 'cat', '狗': 'dog', '花': 'flower',
    '树': 'tree', '山': 'mountain', '海': 'sea', '天空': 'sky', '云': 'cloud',
    '太阳': 'sun', '月亮': 'moon', '星星': 'star', '站起来': 'stood up',
    '跳舞': 'danced', '这个': 'this', '女孩子': 'girl', '舞蹈': 'dance'
  };

  // 本地简单翻译
  const localTranslate = (text: string) => {
    let result = text;
    Object.entries(simpleTranslateDict).forEach(([zh, en]) => {
      result = result.replace(new RegExp(zh, 'g'), en);
    });
    return result;
  };

  // 构建最终提示词
  const buildPrompt = async () => {
    let finalPrompt = prompt.trim();
    
    if (!finalPrompt) {
      return '';
    }

    // 检测是否为中文并翻译
    const isChineseText = /[\u4e00-\u9fff]/.test(finalPrompt);
    if (isChineseText) {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: finalPrompt }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.translatedText) {
          finalPrompt = data.translatedText;
        } else {
          // 如果API翻译失败，使用本地翻译
          finalPrompt = localTranslate(finalPrompt);
        }
      } catch (error) {
        console.error('Translation failed:', error);
        // 网络错误时使用本地翻译
        finalPrompt = localTranslate(finalPrompt);
      }
    }

    // 添加选择的风格（仅当用户选择了风格时）
    if (selectedStyle) {
      const selectedStyleData = STYLE_PRESETS.find(s => s.id === selectedStyle);
      if (selectedStyleData) {
        finalPrompt = `${finalPrompt}, ${selectedStyleData.prompt}`;
      }
    }

    return finalPrompt;
  };


  // 图像上传处理（上传参考图片用于Kontext编辑）
  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    // 处理多张图片上传
    const newImages: UploadedImage[] = [];
    let processedCount = 0;
    const totalFiles = Math.min(files.length, 4); // 最多4张图片

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          const newImage: UploadedImage = {
            id: Date.now().toString() + '_' + i + '_' + file.name.replace(/[^a-zA-Z0-9]/g, '_'),
            file,
            preview,
            name: file.name
          };
          newImages.push(newImage);
          processedCount++;
          
          // 当所有图片都处理完成时，更新状态
          if (processedCount === totalFiles) {
            setUploadedImages(newImages);
            // 只有上传单张图片时才自动启用Kontext模式
            if (newImages.length === 1) {
              setUseKontext(true);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);


  // 删除上传的图像
  const removeUploadedImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    if (selectedUploadedImage === id) {
      setSelectedUploadedImage(null);
    }
    if (editingImageId === id) {
      setEditingImageId(null);
    }
  };


  // 应用图像编辑
  const applyImageEdit = async () => {
    if (!editingImageId) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const image = uploadedImages.find(img => img.id === editingImageId);
    if (!image) return;
    
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 应用变换
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((imageEditState.rotation * Math.PI) / 180);
      ctx.scale(imageEditState.scale / 100, imageEditState.scale / 100);
      ctx.translate(-canvas.width / 2 + imageEditState.offsetX, -canvas.height / 2 + imageEditState.offsetY);
      
      // 应用滤镜
      ctx.filter = `brightness(${imageEditState.brightness}%) contrast(${imageEditState.contrast}%) saturate(${imageEditState.saturation}%)`;
      
      ctx.drawImage(img, 0, 0);
      ctx.restore();
      
      const editedPreview = canvas.toDataURL('image/png');
      
      // 更新图像预览
      setUploadedImages(prev => prev.map(uploadedImg => 
        uploadedImg.id === editingImageId 
          ? { ...uploadedImg, editedPreview }
          : uploadedImg
      ));
      
      setEditingImageId(null);
    };
    img.src = image.preview;
  };

  // 取消编辑
  const cancelImageEdit = () => {
    setEditingImageId(null);
    setImageEditState({
      rotation: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      scale: 100,
      offsetX: 0,
      offsetY: 0
    });
  };

  // 安全存储管理
  const safeStorageWrite = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`存储 ${key} 失败:`, error);
      
      // 尝试清理存储空间
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.log('存储空间不足，正在清理...');
        
        // 清理旧的使用记录
        const now = new Date();
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
          if (k.startsWith('flux_usage_')) {
            const dateStr = k.replace('flux_usage_', '');
            const date = new Date(dateStr);
            const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
            if (daysDiff > 7) { // 清理7天前的使用记录
              localStorage.removeItem(k);
            }
          }
        });
        
        // 如果是历史记录，减少数量
        if (key === 'flux_history') {
          try {
            const history = JSON.parse(value);
            const reduced = history.slice(0, 5); // 只保留最新5条
            localStorage.setItem(key, JSON.stringify(reduced));
            return true;
          } catch {
            localStorage.removeItem(key);
            return false;
          }
        }
        
        // 再次尝试存储
        try {
          localStorage.setItem(key, value);
          return true;
        } catch {
          console.error('清理后仍无法存储');
          return false;
        }
      }
      return false;
    }
  };

  // 清空历史记录
  const clearHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
      setHistory([]);
      localStorage.removeItem('flux_history');
      console.log('历史记录已清空');
    }
  };

  // 滚动到生成器并填入提示词
  const scrollToGeneratorWithPrompt = (promptText: string) => {
    setPrompt(promptText);
    setSelectedImage(null); // 关闭模态框
    
    // 滚动到生成器位置
    setTimeout(() => {
      const generatorElement = document.querySelector('[data-generator]');
      if (generatorElement) {
        generatorElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // 聚焦到提示词输入框
        setTimeout(() => {
          const textareaElement = generatorElement.querySelector('textarea');
          if (textareaElement) {
            textareaElement.focus();
          }
        }, 500);
      }
    }, 100);
  };

  // 专业生成器数据处理
  const handleProfessionalGenerate = async (data: {
    prompt: string;
    aspectRatio: string;
    numImages: number;
    style?: string;
    colorScheme?: string;
    lighting?: string;
    composition?: string;
    guidance?: number;
    steps?: number;
    quality?: number;
  }) => {
    // 更新状态
    setPrompt(data.prompt);
    setAspectRatio(data.aspectRatio);
    setNumImages(data.numImages);
    if (data.guidance) setGuidance(data.guidance);
    if (data.steps) setNumInferenceSteps(data.steps);
    if (data.quality) setOutputQuality(data.quality);
    
    // 如果有风格选择，设置风格
    if (data.style) setSelectedStyle(data.style);
    
    // 直接使用传入的数据调用生成函数，避免状态更新延迟问题
    await executeGenerationWithData(data.prompt, data.prompt, data);
  };

  // 使用指定prompt生成图像（解决状态更新延迟问题）
  // const handleGenerateWithPrompt = async (inputPrompt: string) => {
  //   try {
  //     let finalPrompt = inputPrompt.trim();
  //     if (!finalPrompt) {
  //       alert('请输入创作描述');
  //       return;
  //     }

  //     // 检测是否为中文并翻译
  //     const isChineseText = /[\u4e00-\u9fff]/.test(finalPrompt);
  //     if (isChineseText) {
  //       try {
  //         const response = await fetch('/api/translate', {
  //           method: 'POST',
  //           headers: { 'Content-Type': 'application/json' },
  //           body: JSON.stringify({ text: finalPrompt }),
  //         });
          
  //         if (response.ok) {
  //           const data = await response.json();
  //           if (data.translatedText) {
  //             finalPrompt = data.translatedText;
  //           }
  //         }
  //       } catch (error) {
  //         console.error('Translation failed:', error);
  //         // 继续使用原始prompt
  //       }
  //     }

  //     return await executeGeneration(finalPrompt, inputPrompt);
  //   } catch (error) {
  //     console.error('Generation error:', error);
  //     if (error instanceof Error && error.message.includes('网络')) {
  //       showNetworkError();
  //     } else {
  //       showApiError('生成失败，请重试', {
  //         label: '重新生成',
  //         handler: () => handleGenerateFromData(generationData)
  //       });
  //     }
  //     setIsGenerating(false);
  //     setProgress(0);
  //   }
  // };

  // 生成图像
  const handleGenerate = async () => {
    try {
      const finalPrompt = await buildPrompt();
      if (!finalPrompt.trim()) {
        showUserError('请输入创作描述', '描述您想要生成的图像内容，例如："一个美丽的风景"');
        return;
      }

      return await executeGeneration(finalPrompt, prompt);
    } catch (error) {
      console.error('Generation error:', error);
      if (error instanceof Error && error.message.includes('网络')) {
        showNetworkError();
      } else {
        showApiError('图像生成失败，请稍后重试', {
          label: '重新生成',
          handler: () => handleGenerate()
        });
      }
      setIsGenerating(false);
      setProgress(0);
    }
  };

  // 执行具体的生成逻辑（带数据参数版本）
  const executeGenerationWithData = async (finalPrompt: string, originalPrompt: string, generationData?: Record<string, unknown>) => {
    try {
      if (usageToday >= MAX_DAILY_USAGE) {
        showQuotaError(`今日剩余次数不足，剩余 ${MAX_DAILY_USAGE - usageToday} 次`);
        return;
      }

      const effectiveNumImages = generationData?.numImages || numImages;
      const effectiveAspectRatio = generationData?.aspectRatio || aspectRatio;
      const effectiveGuidance = generationData?.guidance || guidance;
      const effectiveSteps = generationData?.steps || numInferenceSteps;
      const effectiveQuality = generationData?.quality || outputQuality;

      // 立即显示进度条状态
      setIsGenerating(true);
      setProgress(1); // 立即设置为1%而不是0%
      setGeneratedImages([]);
      setCurrentGeneratedPrompt(originalPrompt); // 设置当前生成的提示词

      console.log('开始生成图像，提示词:', finalPrompt, '数量:', effectiveNumImages);
      // 改进进度条：1%间隔更新，避免重复从0开始
      let currentProgress = 1; // 从1%开始
      const progressInterval = setInterval(() => {
        currentProgress += 1;
        if (currentProgress <= 90) {
          setProgress(currentProgress);
        } else {
          clearInterval(progressInterval);
        }
      }, 100); // 每100ms增加1%

      // 使用新的API一次性生成多张图片
      const requestData = {
        prompt: finalPrompt,
        inputImage: uploadedImages.length > 0 ? uploadedImages[0].editedPreview || uploadedImages[0].preview : undefined,
        aspectRatio: effectiveAspectRatio,
        guidance: effectiveGuidance,
        numInferenceSteps: effectiveSteps,
        outputQuality: effectiveQuality,
        outputFormat: outputFormat,
        goFast: goFast,
        seed: seed,
        useKontext: useKontext,
        numOutputs: uploadedImages.length > 0 ? 1 : effectiveNumImages
      };

      console.log('发送生成请求数据:', requestData);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '生成失败');
      }

      clearInterval(progressInterval);
      setProgress(100);

      // 处理API返回的多张图片
      const imageUrls = data.imageUrls || [data.imageUrl]; // 兼容旧版本
      console.log('生成成功，图片数量:', imageUrls.length);

      // 显示生成的图像
      setGeneratedImages(imageUrls);

      // 将所有图像添加到历史记录，使用原始中文提示词
      const newImages = imageUrls.map((imageUrl: string, index: number) => ({
        id: `${Date.now()}-${index}`,
        url: imageUrl,
        prompt: originalPrompt, // 使用原始提示词而非翻译后的
        timestamp: Date.now(),
        style: selectedStyle
      }));
      
      const newHistory = [...newImages, ...history.slice(0, 20 - newImages.length)];
      setHistory(newHistory);
      
      // 使用安全存储
      const success = safeStorageWrite('flux_history', JSON.stringify(newHistory));
      if (!success) {
        setHistory(newImages);
      }
      
      const today = new Date().toDateString();
      const newUsage = usageToday + imageUrls.length;
      safeStorageWrite(`flux_usage_${today}`, newUsage.toString());
      setUsageToday(newUsage);
      
      console.log('图像生成成功，数量:', imageUrls.length);
        
    } catch (error) {
      console.error('Generation error:', error);
      if (error instanceof Error && error.message.includes('网络')) {
        showNetworkError();
      } else if (error instanceof Error && error.message.includes('quota')) {
        showQuotaError();
      } else {
        const errorMessage = error instanceof Error ? error.message : '生成失败，请重试';
        showApiError(errorMessage, {
          label: '重新生成',
          handler: () => executeGenerationWithData(finalPrompt, originalPrompt, generationData)
        });
      }
    } finally {
      setTimeout(() => setIsGenerating(false), 500);
      setProgress(0);
    }
  };

  // 执行具体的生成逻辑
  const executeGeneration = async (finalPrompt: string, originalPrompt: string) => {
    return executeGenerationWithData(finalPrompt, originalPrompt);
  };

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `atelier-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('提示词已复制');
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      setCopyStatus('复制失败');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  // const copyImageToClipboard = async (imageUrl: string) => {
  //   try {
  //     const response = await fetch(imageUrl);
  //     const blob = await response.blob();
  //     await navigator.clipboard.write([
  //       new ClipboardItem({
  //         [blob.type]: blob
  //       })
  //     ]);
  //     setCopyStatus('图片已复制');
  //     setTimeout(() => setCopyStatus(null), 2000);
  //   } catch (error) {
  //     console.error('Copy image failed:', error);
  //     setCopyStatus('图片复制失败');
  //     setTimeout(() => setCopyStatus(null), 2000);
  //   }
  // };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen studio-bg">
      {/* 艺术工作室导航栏 */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 nav-atelier"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* 艺术工作室Logo */}
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Cpu className="w-10 h-10 text-amber-400" />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full opacity-20 blur-xl"></div>
              </div>
              <div>
                <h1 className="renaissance-title text-3xl tracking-wide">
                  Atelier AI Pro
                </h1>
                <p className="text-xs text-amber-300/70 font-light tracking-widest">
                  PROFESSIONAL AI STUDIO
                </p>
              </div>
            </motion.div>

            {/* 导航菜单 */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#create" className="text-amber-200 hover:text-amber-100 transition-colors font-medium">
                AI创作
              </a>
              <a href="#gallery" className="text-amber-200 hover:text-amber-100 transition-colors font-medium">
                作品展示
              </a>
              <a href="#kontext-showcase" className="text-amber-200 hover:text-amber-100 transition-colors font-medium">
                核心技术
              </a>
              <a href="#pricing" className="text-amber-200 hover:text-amber-100 transition-colors font-medium">
                升级专业版
              </a>
            </nav>

            {/* 右侧控件区 */}
            <div className="flex items-center space-x-4">
              {/* 使用计数器 - 桌面端显示 */}
              <div className="hidden sm:block atelier-panel px-4 py-2">
                <span className="text-sm text-amber-200">
                  今日剩余: <span className="text-amber-400 font-bold">{MAX_DAILY_USAGE - usageToday}</span>
                </span>
              </div>
              
              {/* 主题切换按钮 */}
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="icon"
                className="text-amber-200 hover:text-amber-100 hover:bg-amber-500/10"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {/* 移动端汉堡菜单按钮 */}
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="icon"
                className="md:hidden text-amber-200 hover:text-amber-100 hover:bg-amber-500/10"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* 移动端菜单 */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden bg-black/95 backdrop-blur-xl border-t border-amber-500/20"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <nav className="flex flex-col space-y-4">
                    <a 
                      href="#create" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-amber-200 hover:text-amber-100 transition-colors font-medium py-2 border-b border-amber-500/10"
                    >
                      AI创作
                    </a>
                    <a 
                      href="#gallery" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-amber-200 hover:text-amber-100 transition-colors font-medium py-2 border-b border-amber-500/10"
                    >
                      作品展示
                    </a>
                    <a 
                      href="#kontext-showcase" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-amber-200 hover:text-amber-100 transition-colors font-medium py-2 border-b border-amber-500/10"
                    >
                      核心技术
                    </a>
                    <a 
                      href="#pricing" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-amber-200 hover:text-amber-100 transition-colors font-medium py-2 border-b border-amber-500/10"
                    >
                      升级专业版
                    </a>
                    
                    {/* 移动端使用计数器 */}
                    <div className="pt-4 border-t border-amber-500/20">
                      <div className="atelier-panel px-4 py-3 text-center">
                        <span className="text-sm text-amber-200">
                          今日额度: <span className="text-amber-400 font-bold">{MAX_DAILY_USAGE - usageToday}</span> 次专业创作
                        </span>
                      </div>
                    </div>
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* 主创作区域 */}
      <section id="create" className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="renaissance-title text-5xl lg:text-6xl mb-6">
              专业级AI视觉创作平台
            </h2>
            <p className="text-xl text-amber-200/80 max-w-3xl mx-auto leading-relaxed">
              节省90%设计时间，零基础创作商业级视觉作品。
              <span className="block mt-2 text-lg text-amber-300">
                超过10万+创作者选择，每天生成百万张专业图像
              </span>
            </p>
          </motion.div>

          {/* 专业AI生成器界面 */}
          <div data-generator>
            <ProfessionalGenerator
              onGenerate={handleProfessionalGenerate}
              isGenerating={isGenerating}
              disabled={usageToday >= MAX_DAILY_USAGE}
              uploadedImages={uploadedImages}
              onImageUpload={handleImageUpload}
              onRemoveImage={removeUploadedImage}
            />
          </div>

          {/* 生成进度显示 - 骨架屏 */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12"
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div className="atelier-card p-8">
                  <div className="text-center mb-8">
                    <h2 className="renaissance-title text-3xl mb-4">
                      AI正在为您创作专业级作品
                    </h2>
                    <p className="text-amber-200/80 mb-4">
                      企业级AI算法正在将您的创意转化为商业价值作品
                    </p>
                    
                    {/* 精美的进度条 */}
                    <div className="max-w-md mx-auto mb-6">
                      <div className="progress-atelier">
                        <div 
                          className="progress-gold"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-amber-300 mt-2 text-lg font-medium">
                        专业创作进度: {progress}%
                      </p>
                    </div>
                  </div>
                  
                  {/* 图片生成骨架屏 */}
                  <ImageGenerationSkeleton numImages={numImages} />
                </motion.div>
              </div>
            </motion.div>
          )}

        </div>
      </section>

      {/* 生成结果展示 */}
      <AnimatePresence>
        {generatedImages.length > 0 && (
          <motion.section
            className="py-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div className="atelier-card p-8">
                <div className="text-center mb-8">
                  <h2 className="renaissance-title text-3xl mb-4">
                    专业级创作成果
                  </h2>
                  <p className="text-amber-200/80 mb-4">
                    🎉 您的创意已转化为商业级视觉作品，可直接用于商业用途
                  </p>
                  {/* 价值提示 */}
                  <p className="text-amber-200/80 mb-6 text-center">
                    高分辨率专业格式，支持商用授权 | 点击查看大图
                  </p>
                </div>
                
                <div className={`grid gap-8 ${generatedImages.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : generatedImages.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {generatedImages.map((imageUrl, index) => (
                    <motion.div
                      key={index}
                      className="gallery-masterpiece group cursor-pointer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      onClick={() => setSelectedImage({
                        id: `current-${index}`,
                        url: imageUrl,
                        prompt: currentGeneratedPrompt || '当前生成的图像',
                        timestamp: Date.now(),
                        style: selectedStyle
                      })}
                    >
                      <div className={`${generatedImages.length === 1 ? 'aspect-square' : 'aspect-square'} rounded-xl overflow-hidden border-2 border-amber-500/20 group-hover:border-amber-500/40 transition-colors`}>
                        <Image
                          src={imageUrl}
                          alt={`Generated artwork ${index + 1}`}
                          width={generatedImages.length === 1 ? 600 : 400}
                          height={generatedImages.length === 1 ? 600 : 400}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      
                      {/* 简化的悬停提示 */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium">点击放大</p>
                        </div>
                      </div>
                      
                      <motion.div 
                        className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <IconButtonFeedback
                          icon={<Download className="w-5 h-5" />}
                          tooltip="下载图片"
                          onClick={() => {
                            downloadImage(imageUrl);
                          }}
                          className="gold-glow text-black"
                          variant="default"
                        />
                        <IconButtonFeedback
                          icon={<Copy className="w-5 h-5" />}
                          tooltip="复制图片"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(imageUrl);
                          }}
                          className="gold-glow text-black"
                          variant="default"
                        />
                      </motion.div>
                      
                      {/* 图片下方的提示词和操作按钮 */}
                      <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
                        <p className="text-amber-100 text-sm mb-3 line-clamp-2">
                          {currentGeneratedPrompt}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(currentGeneratedPrompt);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs"
                          >
                            复制专业模板
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrompt(currentGeneratedPrompt);
                              handleGenerate();
                            }}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 text-xs"
                          >
                            立即重做
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 作品画廊 */}
      <AnimatePresence>
        {(history.length > 0 || isHistoryLoading) && (
          <motion.section id="gallery" className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div className="atelier-card p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="renaissance-title text-3xl mb-4">专业作品库</h2>
                    <p className="text-amber-200/80">
                      {isHistoryLoading ? '正在加载您的专业作品集...' : '您的商业级创作档案，价值不断增长'}
                    </p>
                  </div>
                  {!isHistoryLoading && history.length > 0 && (
                    <IconButtonFeedback
                      icon={<><Trash2 className="w-4 h-4 mr-2" />管理作品集</>}
                      tooltip="管理您的专业作品集"
                      onClick={clearHistory}
                      className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10 px-4 py-2 rounded-lg border"
                      variant="ghost"
                    />
                  )}
                </div>
                
                {isHistoryLoading ? (
                  <GallerySkeleton count={8} />
                ) : (
                  <div className="gallery-atelier">
                  {history.slice(0, 12).map((item, index) => (
                    <motion.div 
                      key={item.id}
                      className="gallery-masterpiece cursor-pointer"
                      onClick={() => setSelectedImage(item)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={item.url}
                          alt="Artwork from gallery"
                          width={250}
                          height={250}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-amber-300/80 line-clamp-2 mb-2">
                          {item.prompt || '未知提示词'}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-amber-400/60">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrompt(item.prompt);
                                handleGenerate();
                              }}
                              className="text-amber-400 hover:text-amber-300 transition-colors"
                              title="重新生成"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(item.prompt, '提示词已复制到剪贴板');
                              }}
                              className="text-amber-400 hover:text-amber-300 transition-colors"
                              title="复制提示词"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 图像灯箱 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              className="relative max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {/* 关闭按钮 */}
                <Button
                  size="icon"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm rounded-full"
                  title="关闭"
                >
                  <X className="w-5 h-5" />
                </Button>
                
                {/* 图片 */}
                <div className="relative bg-black rounded-xl overflow-hidden">
                  <Image
                    src={selectedImage.url}
                    alt="Selected artwork"
                    width={1024}
                    height={1024}
                    className="w-full h-auto max-h-[60vh] object-contain"
                  />
                </div>
                
                {/* 图片下方的提示词和操作区域 - 确保始终可见 */}
                <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border border-amber-500/40 rounded-xl p-6 mt-4 backdrop-blur-sm">
                  <div className="mb-4">
                    <h3 className="text-amber-200 font-semibold mb-3 flex items-center">
                      <Wand className="w-5 h-5 mr-2" />
                      创作提示词
                    </h3>
                    <p className="text-amber-100 text-base leading-relaxed bg-black/20 rounded-lg p-4 border border-amber-500/20 min-h-[60px]">
                      {selectedImage.prompt || '暂无提示词'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-amber-300/70">
                      <span>风格: {STYLE_PRESETS.find(s => s.id === selectedImage.style)?.name || '无风格'}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(selectedImage.timestamp).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(selectedImage.prompt)}
                        className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/30"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        复制提示词
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => scrollToGeneratorWithPrompt(selectedImage.prompt)}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-amber-500/25"
                      >
                        <Wand className="w-4 h-4 mr-2" />
                        制作
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => downloadImage(selectedImage.url)}
                        className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/30"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flux Kontext Dev 技术展示 */}
      <KontextShowcase />

      {/* 会员计划定价 */}
      <PricingSection />

      {/* 艺术工作室页脚 */}
      <footer className="bg-gradient-to-t from-zinc-900/50 to-transparent py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* 品牌信息 */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <Cpu className="w-10 h-10 text-amber-400" />
                <div>
                  <h3 className="renaissance-title text-2xl">Atelier AI Pro</h3>
                  <p className="text-amber-300/70 text-sm">Professional AI Studio</p>
                </div>
              </div>
              <p className="text-amber-200/70 leading-relaxed max-w-md">
                专业级AI视觉创作平台，服务超过10万+企业和创作者。
                <span className="block mt-2 text-amber-300">
                  节省90%设计成本，提升200%创作效率。
                </span>
              </p>
            </div>

            {/* 产品链接 */}
            <div>
              <h4 className="text-amber-100 font-bold mb-4">专业功能</h4>
              <ul className="space-y-2 text-amber-200/70">
                <li><a href="#create" className="hover:text-amber-100 transition-colors">专业级AI创作</a></li>
                <li><a href="#gallery" className="hover:text-amber-100 transition-colors">商业作品库</a></li>
                <li><a href="#styles" className="hover:text-amber-100 transition-colors">多种专业风格</a></li>
                <li><a href="#tools" className="hover:text-amber-100 transition-colors">高级编辑工具</a></li>
              </ul>
            </div>

            {/* 支持链接 */}
            <div>
              <h4 className="text-amber-100 font-bold mb-4">专业服务</h4>
              <ul className="space-y-2 text-amber-200/70">
                <li><a href="#faq" className="hover:text-amber-100 transition-colors">企业解决方案</a></li>
                <li><a href="#guide" className="hover:text-amber-100 transition-colors">专业教程</a></li>
                <li><a href="#contact" className="hover:text-amber-100 transition-colors">24/7技术支持</a></li>
                <li><a href="#feedback" className="hover:text-amber-100 transition-colors">定制开发</a></li>
              </ul>
            </div>
          </div>

          <Separator className="bg-amber-500/20 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-amber-300/60 text-sm">
              © 2024 Atelier AI Pro. 全球领先的专业级AI视觉创作平台。
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Button variant="ghost" size="icon" className="text-amber-300/60 hover:text-amber-200">
                <Mail className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-amber-300/60 hover:text-amber-200">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-amber-300/60 hover:text-amber-200">
                <Github className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* 图像编辑模态框 */}
      <AnimatePresence>
        {editingImageId && (
          <motion.div 
            className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelImageEdit}
          >
            <motion.div 
              className="atelier-card p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="renaissance-title text-2xl">图像编辑工作室</h2>
                <Button
                  onClick={cancelImageEdit}
                  variant="ghost"
                  size="icon"
                  className="text-amber-200 hover:text-amber-100"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* 图像预览区域 */}
                <div className="space-y-4">
                  <div className="aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-amber-500/30 relative">
                    {uploadedImages.find(img => img.id === editingImageId) && (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          transform: `
                            rotate(${imageEditState.rotation}deg) 
                            scale(${imageEditState.scale / 100}) 
                            translate(${imageEditState.offsetX}px, ${imageEditState.offsetY}px)
                          `,
                          filter: `
                            brightness(${imageEditState.brightness}%) 
                            contrast(${imageEditState.contrast}%) 
                            saturate(${imageEditState.saturation}%)
                          `
                        }}
                      >
                        <Image
                          src={uploadedImages.find(img => img.id === editingImageId)!.preview}
                          alt="编辑中的图像"
                          width={400}
                          height={400}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={applyImageEdit}
                      className="maestro-button text-base px-8"
                    >
                      应用编辑
                    </Button>
                    <Button
                      onClick={cancelImageEdit}
                      variant="outline"
                      className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10 px-8"
                    >
                      取消
                    </Button>
                  </div>
                </div>

                {/* 编辑控制面板 */}
                <div className="space-y-6">
                  {/* 基础变换 */}
                  <div className="atelier-panel p-6">
                    <h3 className="text-lg font-bold text-amber-100 mb-4 flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-amber-400" />
                      基础变换
                    </h3>
                    
                    <div className="space-y-4">
                      {/* 旋转 */}
                      <div>
                        <label className="block text-amber-200 mb-2 font-medium">
                          旋转: {imageEditState.rotation}°
                        </label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={imageEditState.rotation}
                          onChange={(e) => setImageEditState(prev => ({ ...prev, rotation: Number(e.target.value) }))}
                          className="maestro-slider w-full"
                        />
                      </div>

                      {/* 缩放 */}
                      <div>
                        <label className="block text-amber-200 mb-2 font-medium">
                          缩放: {imageEditState.scale}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          value={imageEditState.scale}
                          onChange={(e) => setImageEditState(prev => ({ ...prev, scale: Number(e.target.value) }))}
                          className="maestro-slider w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 颜色调整 */}
                  <div className="atelier-panel p-6">
                    <h3 className="text-lg font-bold text-amber-100 mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-amber-400" />
                      颜色调整
                    </h3>
                    
                    <div className="space-y-4">
                      {/* 亮度 */}
                      <div>
                        <label className="block text-amber-200 mb-2 font-medium">
                          亮度: {imageEditState.brightness}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={imageEditState.brightness}
                          onChange={(e) => setImageEditState(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                          className="maestro-slider w-full"
                        />
                      </div>

                      {/* 对比度 */}
                      <div>
                        <label className="block text-amber-200 mb-2 font-medium">
                          对比度: {imageEditState.contrast}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={imageEditState.contrast}
                          onChange={(e) => setImageEditState(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                          className="maestro-slider w-full"
                        />
                      </div>

                      {/* 饱和度 */}
                      <div>
                        <label className="block text-amber-200 mb-2 font-medium">
                          饱和度: {imageEditState.saturation}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={imageEditState.saturation}
                          onChange={(e) => setImageEditState(prev => ({ ...prev, saturation: Number(e.target.value) }))}
                          className="maestro-slider w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 快速重置 */}
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => setImageEditState({
                        rotation: 0,
                        brightness: 100,
                        contrast: 100,
                        saturation: 100,
                        scale: 100,
                        offsetX: 0,
                        offsetY: 0
                      })}
                      variant="outline"
                      className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10 flex-1"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      重置所有
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 复制状态提示 */}
      <AnimatePresence>
        {copyStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="atelier-card px-6 py-3 border border-amber-500/30">
              <p className="text-amber-200 font-medium">{copyStatus}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}