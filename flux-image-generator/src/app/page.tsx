'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import MaestroButton from '@/components/MaestroButton';
import KontextShowcase from '@/components/KontextShowcase';
import { 
  Download, 
  Copy,
  Heart,
  Palette,
  Zap,
  Moon,
  Sun,
  Wand,
  X,
  Settings,
  Mail,
  Twitter,
  Github,
  Cpu,
  Upload,
  Camera,
  Trash2,
  Edit3,
  RotateCcw
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

const ASPECT_RATIOS = [
  { id: '1:1', name: '正方形 (1:1)', value: '1:1', icon: '□' },
  { id: '16:9', name: '宽屏 (16:9)', value: '16:9', icon: '▬' },
  { id: '9:16', name: '竖屏 (9:16)', value: '9:16', icon: '▮' },
  { id: '4:3', name: '标准 (4:3)', value: '4:3', icon: '▭' },
  { id: '3:4', name: '竖版 (3:4)', value: '3:4', icon: '▯' },
  { id: '21:9', name: '超宽 (21:9)', value: '21:9', icon: '▬' },
];


const MAX_DAILY_USAGE = 10;

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
  const [outputFormat, setOutputFormat] = useState('webp');
  const [goFast, setGoFast] = useState(true);
  const [seed, setSeed] = useState('');
  const [numImages, setNumImages] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [usageToday, setUsageToday] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  
  // 新增：图像上传相关状态
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedUploadedImage, setSelectedUploadedImage] = useState<string | null>(null);
  const [useKontext, setUseKontext] = useState(false);
  
  // 图像编辑相关状态
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
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

    const file = files[0]; // 只取第一张图片
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        const newImage: UploadedImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          preview,
          name: file.name
        };
        setUploadedImages([newImage]); // 替换现有图片
        setUseKontext(true); // 上传图片后自动启用Kontext模式
      };
      reader.readAsDataURL(file);
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

  // 生成图像
  const handleGenerate = async () => {
    try {
      const finalPrompt = await buildPrompt();
      if (!finalPrompt.trim()) {
        alert('请输入创作描述');
        return;
      }
      
      if (usageToday >= MAX_DAILY_USAGE) {
        alert(`今日剩余次数不足，剩余 ${MAX_DAILY_USAGE - usageToday} 次`);
        return;
      }

      setIsGenerating(true);
      setProgress(0);
      setGeneratedImages([]);

      console.log('开始生成图像，提示词:', finalPrompt, '数量:', numImages);
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 1000);

      // 批量生成图像
      const promises = [];
      
      for (let i = 0; i < numImages; i++) {
        const requestData = {
          prompt: finalPrompt,
          inputImage: uploadedImages.length > 0 ? uploadedImages[0].editedPreview || uploadedImages[0].preview : undefined,
          aspectRatio: aspectRatio,
          guidance: guidance,
          numInferenceSteps: numInferenceSteps,
          outputQuality: outputQuality,
          outputFormat: outputFormat,
          goFast: goFast,
          seed: seed ? (parseInt(seed) + i).toString() : undefined, // 每张图使用不同的seed
          useKontext: useKontext || uploadedImages.length > 0,
        };

        console.log(`发送第${i + 1}张图请求数据:`, requestData);

        const promise = fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        }).then(response => {
          if (!response.ok) {
            throw new Error(`请求失败: ${response.status} ${response.statusText}`);
          }
          return response.json();
        });

        promises.push(promise);
      }

      // 等待所有图像生成完成
      const results = await Promise.all(promises);
      clearInterval(progressInterval);

      // 处理结果
      const successResults = results.filter(data => data.success);
      if (successResults.length > 0) {
        const imageUrls = successResults.map(data => data.imageUrl);
        setGeneratedImages(imageUrls);
        
        // 将所有成功的图像添加到历史记录
        const newImages = successResults.map((data, index) => ({
          id: `${Date.now()}-${index}`,
          url: data.imageUrl,
          prompt: finalPrompt,
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
        const newUsage = usageToday + successResults.length;
        safeStorageWrite(`flux_usage_${today}`, newUsage.toString());
        setUsageToday(newUsage);
        
        setProgress(100);
      } else {
        throw new Error('所有图像生成失败');
      }

    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : '生成失败，请重试';
      alert(errorMessage);
    } finally {
      setTimeout(() => setIsGenerating(false), 500);
      setProgress(0);
    }
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

  const copyImageToClipboard = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopyStatus('图片已复制');
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error) {
      console.error('Copy image failed:', error);
      setCopyStatus('图片复制失败');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

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
                  Atelier AI
                </h1>
                <p className="text-xs text-amber-300/70 font-light tracking-widest">
                  DIGITAL RENAISSANCE
                </p>
              </div>
            </motion.div>

            {/* 导航菜单 */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#create" className="text-amber-200 hover:text-amber-100 transition-colors font-medium">
                创作工作室
              </a>
              <a href="#gallery" className="text-amber-200 hover:text-amber-100 transition-colors font-medium">
                作品画廊
              </a>
              <a href="#kontext-showcase" className="text-amber-200 hover:text-amber-100 transition-colors font-medium">
                技术展示
              </a>
              <a href="#pricing" className="text-amber-200 hover:text-amber-100 transition-colors font-medium">
                会员计划
              </a>
            </nav>

            {/* 使用计数器 */}
            <div className="flex items-center space-x-4">
              <div className="atelier-panel px-4 py-2">
                <span className="text-sm text-amber-200">
                  今日剩余: <span className="text-amber-400 font-bold">{MAX_DAILY_USAGE - usageToday}</span>
                </span>
              </div>
              
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="icon"
                className="text-amber-200 hover:text-amber-100 hover:bg-amber-500/10"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
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
              艺术创作工作室
            </h2>
            <p className="text-xl text-amber-200/80 max-w-3xl mx-auto leading-relaxed">
              在这里，您的想象力与AI技术完美融合，创造出独一无二的数字艺术作品。
              每一次创作都是一场艺术的探索之旅。
            </p>
          </motion.div>

          {/* 简洁AI生成器界面 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="atelier-card p-8 max-w-4xl mx-auto"
          >
            {/* 标题区域 */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-amber-100 mb-2">AI 图像生成器</h2>
              <p className="text-amber-200/70 text-sm">请用英文输入提示词以获得最佳效果</p>
            </div>

            {/* 主输入区域 */}
            <div className="space-y-6">
              <div>
                <label className="block text-amber-200 mb-3 font-medium">描述提示词</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="您想看到什么？"
                  className="atelier-input min-h-[120px] text-lg resize-none"
                  maxLength={2000}
                />
              </div>

              {/* 简洁控制面板 */}
              <div className="grid grid-cols-5 gap-4 items-center">
                {/* 方形比例 */}
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="square-ratio"
                    checked={aspectRatio === '1:1'}
                    onChange={() => setAspectRatio(aspectRatio === '1:1' ? '16:9' : '1:1')}
                    className="w-4 h-4 text-amber-400 border-amber-500/30 rounded focus:ring-amber-400"
                  />
                  <label htmlFor="square-ratio" className="ml-2 text-sm text-amber-200">方形比例</label>
                </div>

                {/* 生成数量 */}
                <div>
                  <label className="block text-xs text-amber-300/70 mb-1">数量</label>
                  <Select value={numImages.toString()} onValueChange={(value) => setNumImages(Number(value))}>
                    <SelectTrigger className="atelier-select h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1张</SelectItem>
                      <SelectItem value="2">2张</SelectItem>
                      <SelectItem value="3">3张</SelectItem>
                      <SelectItem value="4">4张</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 默认选项显示 */}
                <div className="text-xs text-amber-300/50 space-y-1">
                  <div>无风格</div>
                  <div>无色彩</div>
                </div>
                <div className="text-xs text-amber-300/50 space-y-1">
                  <div>无光照</div>
                  <div>无构图</div>
                </div>

                {/* 开关控制 */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-xs text-amber-300/70 mr-2">负面提示词</span>
                    <input type="checkbox" className="w-3 h-3 rounded" />
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-amber-300/70 mr-2">高质量</span>
                    <input type="checkbox" defaultChecked className="w-3 h-3 rounded" />
                  </div>
                </div>
              </div>

              {/* 操作按钮行 */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="flex gap-3">
                  <Button
                    onClick={() => setPrompt('')}
                    variant="outline"
                    size="sm"
                    className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
                  >
                    清除
                  </Button>
                  <Button
                    onClick={() => {
                      const randomPrompts = [
                        "A majestic dragon soaring through clouds at sunset, highly detailed, fantasy art, cinematic lighting",
                        "Beautiful woman with flowing hair in an elegant dress, portrait photography, soft lighting, detailed",
                        "Futuristic cityscape at night with neon lights, cyberpunk style, rain-soaked streets, atmospheric",
                        "Ancient forest with mystical creatures, magical atmosphere, ethereal lighting, fantasy landscape",
                        "Steampunk mechanical bird with intricate gears, brass and copper materials, Victorian era design"
                      ];
                      setPrompt(randomPrompts[Math.floor(Math.random() * randomPrompts.length)]);
                    }}
                    variant="outline"
                    size="sm"
                    className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
                  >
                    随机
                  </Button>
                </div>

                {/* 参考图像上传 */}
                <div className="text-center">
                  <label className="text-xs text-amber-300/70 mb-1 block">替换图像</label>
                  <div 
                    className="h-10 border border-dashed border-amber-500/30 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-amber-500/5"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-amber-300">
                        {uploadedImages.length > 0 ? '上传新图像' : '上传参考图像'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 生成按钮 */}
                <div className="text-center">
                  <MaestroButton
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim() || usageToday >= MAX_DAILY_USAGE}
                    loading={isGenerating}
                    size="md"
                    variant="primary"
                  >
                    生成
                  </MaestroButton>
                </div>
              </div>
            </div>

            {/* 参考图像区域 */}
            {uploadedImages.length > 0 && (
              <div className="mt-8 p-6 border border-amber-500/30 rounded-lg bg-amber-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-amber-100">参考图像</h4>
                  <span className="text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded">
                    Kontext模式
                  </span>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* 图像预览 */}
                  <div className="space-y-3">
                    <div className="aspect-square rounded-lg overflow-hidden border border-amber-500/30 bg-zinc-900">
                      <Image
                        src={uploadedImages[0].editedPreview || uploadedImages[0].preview}
                        alt="参考图像"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingImageId(uploadedImages[0].id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        编辑
                      </Button>
                      <Button
                        onClick={() => removeUploadedImage(uploadedImages[0].id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-200 hover:bg-red-500/10"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Kontext参数控制 */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-amber-200 font-medium">引导强度</label>
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={guidance}
                          onChange={(e) => setGuidance(Number(e.target.value))}
                          className="maestro-slider w-full"
                        />
                        <span className="text-xs text-amber-300">{guidance}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-amber-200 font-medium">推理步数</label>
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="4"
                          max="50"
                          value={numInferenceSteps}
                          onChange={(e) => setNumInferenceSteps(Number(e.target.value))}
                          className="maestro-slider w-full"
                        />
                        <span className="text-xs text-amber-300">{numInferenceSteps}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-amber-200 font-medium">输出质量</label>
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={outputQuality}
                          onChange={(e) => setOutputQuality(Number(e.target.value))}
                          className="maestro-slider w-full"
                        />
                        <span className="text-xs text-amber-300">{outputQuality}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-amber-200 font-medium">输出格式</label>
                      <Select value={outputFormat} onValueChange={setOutputFormat}>
                        <SelectTrigger className="atelier-select h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="webp">WebP</SelectItem>
                          <SelectItem value="jpg">JPG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-amber-200 font-medium">随机种子</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(e.target.value)}
                          placeholder="随机"
                          className="atelier-input h-8 text-sm flex-1"
                        />
                        <Button
                          onClick={() => setSeed(Math.floor(Math.random() * 1000000).toString())}
                          variant="outline"
                          size="sm"
                          className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10 px-2"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-amber-200 font-medium">生成模式</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={goFast}
                          onChange={(e) => setGoFast(e.target.checked)}
                          className="rounded border-amber-500/30"
                        />
                        <span className="text-sm text-amber-300">快速模式</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 基础设置行 */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* 艺术风格选择 */}
              <div className="space-y-2">
                <label className="text-sm text-amber-200 font-medium">艺术风格</label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="atelier-select h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLE_PRESETS.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 画面比例（仅在无参考图像时显示） */}
              {uploadedImages.length === 0 && (
                <div className="space-y-2">
                  <label className="text-sm text-amber-200 font-medium">画面比例</label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="atelier-select h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((ratio) => (
                        <SelectItem key={ratio.id} value={ratio.value}>
                          {ratio.icon} {ratio.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 参考图像上传 */}
              <div className="space-y-2">
                <label className="text-sm text-amber-200 font-medium">
                  {uploadedImages.length > 0 ? '替换图像' : '参考图像'}
                </label>
                <div 
                  className="h-10 border border-dashed border-amber-500/30 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-amber-500/5"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                  
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-300">
                      {uploadedImages.length > 0 ? '上传新图像' : '上传参考图像'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 大师级创作按钮 - 居中放置 */}
          <div className="text-center mt-12">
            <MaestroButton
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || usageToday >= MAX_DAILY_USAGE}
              loading={isGenerating}
              size="lg"
              variant="primary"
            >
              开始创作
            </MaestroButton>
            
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 max-w-md mx-auto"
              >
                <div className="progress-atelier">
                  <div 
                    className="progress-gold"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-amber-300 mt-4 text-xl font-medium">
                  艺术创作中... {progress}%
                </p>
              </motion.div>
            )}
          </div>

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
                    您的艺术杰作
                  </h2>
                  <p className="text-amber-200/80">
                    恭喜！您的创意已经转化为独特的数字艺术作品
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
                        prompt: prompt || '当前生成的图像',
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
                      
                      {/* 图像信息覆盖层 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white text-sm font-medium mb-2 line-clamp-2">
                            {prompt || '当前生成的图像'}
                          </p>
                          <div className="flex items-center justify-between text-xs text-white/80">
                            <span>风格: {selectedStyle || '无风格'}</span>
                            <span>#{index + 1}</span>
                          </div>
                        </div>
                      </div>
                      
                      <motion.div 
                        className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <Button
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(imageUrl);
                          }}
                          className="gold-glow text-black hover:scale-110 transition-transform"
                        >
                          <Download className="w-5 h-5" />
                        </Button>
                        <Button
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(imageUrl);
                          }}
                          className="gold-glow text-black hover:scale-110 transition-transform"
                        >
                          <Copy className="w-5 h-5" />
                        </Button>
                      </motion.div>
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
        {history.length > 0 && (
          <motion.section id="gallery" className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div className="atelier-card p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="renaissance-title text-3xl mb-4">创作画廊</h2>
                    <p className="text-amber-200/80">您的艺术创作历程</p>
                  </div>
                  <Button
                    onClick={clearHistory}
                    variant="outline"
                    className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    清空画廊
                  </Button>
                </div>
                
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
                        <p className="text-sm text-amber-300/80 truncate">
                          {item.prompt.slice(0, 50)}...
                        </p>
                        <p className="text-xs text-amber-400/60 mt-1">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
              className="relative max-w-5xl max-h-full w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="atelier-card p-6">
                <Image
                  src={selectedImage.url}
                  alt="Selected artwork"
                  width={1024}
                  height={1024}
                  className="w-full h-auto rounded-xl mb-6"
                />
                
                {/* 提示词信息区域 */}
                <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                  <h3 className="text-amber-200 font-semibold mb-2 flex items-center">
                    <Wand className="w-4 h-4 mr-2" />
                    创作提示词
                  </h3>
                  <p className="text-amber-100/80 text-sm leading-relaxed mb-3">
                    {selectedImage.prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-amber-300/60">
                    <span>风格: {STYLE_PRESETS.find(s => s.id === selectedImage.style)?.name || '无风格'}</span>
                    <span>{new Date(selectedImage.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="absolute top-8 right-8 flex space-x-3">
                  <Button
                    size="icon"
                    onClick={() => copyToClipboard(selectedImage.prompt)}
                    className="gold-glow text-black hover:scale-110 transition-transform"
                    title="复制提示词"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => copyImageToClipboard(selectedImage.url)}
                    className="gold-glow text-black hover:scale-110 transition-transform"
                    title="复制图片"
                  >
                    <Camera className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => downloadImage(selectedImage.url)}
                    className="gold-glow text-black hover:scale-110 transition-transform"
                    title="下载图像"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => setSelectedImage(null)}
                    className="bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-sm"
                    title="关闭"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 会员计划定价 */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-transparent to-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="renaissance-title text-4xl lg:text-5xl mb-6">
              会员计划
            </h2>
            <p className="text-xl text-amber-200/80 max-w-3xl mx-auto leading-relaxed">
              选择适合您的创作计划，释放无限艺术潜能
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* 免费计划 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="atelier-card p-8 text-center"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-amber-100 mb-2">探索版</h3>
                <div className="text-4xl font-bold text-amber-400 mb-2">免费</div>
                <p className="text-amber-200/70">体验AI艺术创作</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">每日10次创作额度</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">基础艺术风格</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">标准画质输出</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">作品画廊保存</span>
                </li>
              </ul>
              
              <Button className="w-full bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30">
                当前计划
              </Button>
            </motion.div>

            {/* 专业计划 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="atelier-card p-8 text-center relative border-2 border-amber-500/50"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  推荐
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-amber-100 mb-2">艺术家版</h3>
                <div className="text-4xl font-bold text-amber-400 mb-2">
                  ¥29<span className="text-lg text-amber-200/70">/月</span>
                </div>
                <p className="text-amber-200/70">专业创作无限制</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">无限创作次数</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">全部艺术风格</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">4K超高清输出</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">优先处理队列</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">高级图像编辑</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">商用授权</span>
                </li>
              </ul>
              
              <Button className="w-full maestro-button text-base py-4 font-bold hover:scale-105 transition-all duration-300">
                升级至专业版
              </Button>
            </motion.div>

            {/* 工作室计划 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="atelier-card p-8 text-center"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-amber-100 mb-2">工作室版</h3>
                <div className="text-4xl font-bold text-amber-400 mb-2">
                  ¥99<span className="text-lg text-amber-200/70">/月</span>
                </div>
                <p className="text-amber-200/70">团队协作创作</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">艺术家版全部功能</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">5个团队成员</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">团队作品库</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">API接口调用</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                  <span className="text-amber-200/80">专属技术支持</span>
                </li>
              </ul>
              
              <Button className="w-full bg-purple-500/20 text-purple-200 border border-purple-500/30 hover:bg-purple-500/30">
                联系销售
              </Button>
            </motion.div>
          </div>

          {/* 特色说明 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-16"
          >
            <div className="flex flex-wrap justify-center gap-8 text-sm text-amber-200/70">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-amber-400" />
                <span>7天无理由退款</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>即时生效</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>随时取消订阅</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Flux Kontext Dev 技术展示 */}
      <KontextShowcase />

      {/* 艺术工作室页脚 */}
      <footer className="bg-gradient-to-t from-zinc-900/50 to-transparent py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* 品牌信息 */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <Cpu className="w-10 h-10 text-amber-400" />
                <div>
                  <h3 className="renaissance-title text-2xl">Atelier AI</h3>
                  <p className="text-amber-300/70 text-sm">Digital Renaissance</p>
                </div>
              </div>
              <p className="text-amber-200/70 leading-relaxed max-w-md">
                在数字时代重新定义艺术创作。我们相信每个人都拥有独特的创意天赋，
                AI技术只是帮助您将想象力转化为现实的画笔。
              </p>
            </div>

            {/* 产品链接 */}
            <div>
              <h4 className="text-amber-100 font-bold mb-4">工作室功能</h4>
              <ul className="space-y-2 text-amber-200/70">
                <li><a href="#create" className="hover:text-amber-100 transition-colors">AI绘画创作</a></li>
                <li><a href="#gallery" className="hover:text-amber-100 transition-colors">作品画廊</a></li>
                <li><a href="#styles" className="hover:text-amber-100 transition-colors">艺术风格</a></li>
                <li><a href="#tools" className="hover:text-amber-100 transition-colors">创作工具</a></li>
              </ul>
            </div>

            {/* 支持链接 */}
            <div>
              <h4 className="text-amber-100 font-bold mb-4">支持与帮助</h4>
              <ul className="space-y-2 text-amber-200/70">
                <li><a href="#faq" className="hover:text-amber-100 transition-colors">常见问题</a></li>
                <li><a href="#guide" className="hover:text-amber-100 transition-colors">使用指南</a></li>
                <li><a href="#contact" className="hover:text-amber-100 transition-colors">联系我们</a></li>
                <li><a href="#feedback" className="hover:text-amber-100 transition-colors">用户反馈</a></li>
              </ul>
            </div>
          </div>

          <Separator className="bg-amber-500/20 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-amber-300/60 text-sm">
              © 2024 Atelier AI. 探索数字艺术的无限可能。
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