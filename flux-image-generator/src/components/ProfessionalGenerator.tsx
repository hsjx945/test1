'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Wand, Settings, X } from 'lucide-react';

// SVG图标组件
const IconComponent = ({ path, className = "w-4 h-4" }: { path: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
import Image from 'next/image';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  editedPreview?: string;
}

interface ProfessionalGeneratorProps {
  onGenerate: (data: GenerationData) => void;
  isGenerating?: boolean;
  disabled?: boolean;
  uploadedImages?: UploadedImage[];
  onImageUpload?: (files: FileList | null) => void;
  onRemoveImage?: (id: string) => void;
}

interface GenerationData {
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
}

// 风格选项
const styleOptions = [
  { value: 'none', label: '默认', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', desc: '不应用特定风格' },
  { value: 'realistic', label: '写实', icon: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', desc: '逼真的摄影效果' },
  { value: 'artistic', label: '绘画', icon: 'M15.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M6.166 6.166a1 1 0 0 1 1.668 1.668l-2 3a1 1 0 0 1-1.668-1.668l2-3z', desc: '传统绘画风格' },
  { value: 'anime', label: '动漫', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zM7 12.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zM14 12.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z', desc: '日式动漫风格' },
  { value: 'cinematic', label: '电影', icon: 'M23 7l-7 5 7 5V7z M7 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z', desc: '电影级视觉效果' },
  { value: 'minimalist', label: '极简', icon: 'M5 12h14 M12 5l7 7-7 7', desc: '简约现代设计' }
];

const colorSchemeOptions = [
  { value: 'none', label: '默认', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { value: 'warm', label: '暖色', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
  { value: 'cool', label: '冷色', icon: 'M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69z' },
  { value: 'monochrome', label: '单色', icon: 'M12 1l9 16H3l9-16z' },
  { value: 'vibrant', label: '鲜艳', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { value: 'pastel', label: '柔和', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' }
];

const lightingOptions = [
  { value: 'none', label: '自然', icon: 'M12 2a5 5 0 1 0 5 5 7 7 0 0 1 7 7 5 5 0 1 1-5-5 7 7 0 0 0-7-7z' },
  { value: 'golden-hour', label: '黄金', icon: 'M12 2L13.09 8.26 22 9L17 14.74 18.18 22 12 18.27 5.82 22 7 14.74 2 9 10.91 8.26 12 2z' },
  { value: 'studio', label: '摄影', icon: 'M12 2a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zM21 12a1 1 0 0 1-1 1h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 1 1z' },
  { value: 'dramatic', label: '戏剧', icon: 'M2 3h6l4 4V7l8-5v20l-8-5v-4l-4 4H2z' },
  { value: 'soft', label: '柔和', icon: 'M18.5 12A6.5 6.5 0 1 1 12 5.5a6.5 6.5 0 0 1 6.5 6.5z' },
  { value: 'neon', label: '霓虹', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' }
];

const compositionOptions = [
  { value: 'none', label: '自由', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { value: 'rule-of-thirds', label: '三分', icon: 'M3 3v18h18V3H3zm16 16H5V5h14v14zM9 7v10M15 7v10M7 9h10M7 15h10' },
  { value: 'symmetrical', label: '对称', icon: 'M5 8a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1zM5 16a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1z' },
  { value: 'close-up', label: '特写', icon: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z' },
  { value: 'wide-shot', label: '全景', icon: 'M3 3v18h18V3H3zm16 16H5V5h14v14z' },
  { value: 'birds-eye', label: '俯视', icon: 'M2 3h6l4 4V7l8-5v20l-8-5v-4l-4 4H2z' }
];

export default function ProfessionalGenerator({
  onGenerate,
  isGenerating,
  disabled,
  uploadedImages = [],
  onImageUpload,
  onRemoveImage
}: ProfessionalGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [numImages, setNumImages] = useState(1);
  const [style, setStyle] = useState('none');
  const [colorScheme, setColorScheme] = useState('none');
  const [lighting, setLighting] = useState('none');
  const [composition, setComposition] = useState('none');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [guidance, setGuidance] = useState(7.5);
  const [steps, setSteps] = useState(30);
  const [quality, setQuality] = useState(80);
  const [isUploading, setIsUploading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  // 当生成完成时重置按钮状态
  React.useEffect(() => {
    if (!isGenerating && buttonClicked) {
      setButtonClicked(false);
    }
  }, [isGenerating, buttonClicked]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && onImageUpload) {
      setIsUploading(true);
      onImageUpload(files);
      // Reset uploading state after a short delay
      setTimeout(() => setIsUploading(false), 1000);
    }
  };

  const buildEnhancedPrompt = () => {
    let enhancedPrompt = prompt.trim();
    
    // 添加风格描述
    if (style && style !== 'none') {
      const stylePrompts: { [key: string]: string } = {
        realistic: 'photorealistic, professional photography, high quality, detailed',
        artistic: 'oil painting, artistic style, fine art, masterpiece, detailed brushwork',
        anime: 'anime style, manga art, japanese animation, vibrant colors',
        cinematic: 'cinematic lighting, movie scene, dramatic composition, film grain',
        minimalist: 'minimalist style, clean design, simple composition, modern art'
      };
      
      if (stylePrompts[style]) {
        enhancedPrompt += `, ${stylePrompts[style]}`;
      }
    }
    
    // 添加色彩方案
    if (colorScheme && colorScheme !== 'none') {
      const colorPrompts: { [key: string]: string } = {
        warm: 'warm colors, golden tones, cozy atmosphere',
        cool: 'cool colors, blue tones, calm atmosphere',
        monochrome: 'monochrome, black and white, high contrast',
        vibrant: 'vibrant colors, saturated, bold palette',
        pastel: 'pastel colors, soft tones, gentle palette'
      };
      
      if (colorPrompts[colorScheme]) {
        enhancedPrompt += `, ${colorPrompts[colorScheme]}`;
      }
    }
    
    // 添加光照效果
    if (lighting && lighting !== 'none') {
      const lightingPrompts: { [key: string]: string } = {
        'golden-hour': 'golden hour lighting, warm sunlight, soft shadows',
        studio: 'studio lighting, professional setup, even illumination',
        dramatic: 'dramatic lighting, strong contrast, moody atmosphere',
        soft: 'soft lighting, diffused light, gentle illumination',
        neon: 'neon lighting, vibrant glow, cyberpunk atmosphere'
      };
      
      if (lightingPrompts[lighting]) {
        enhancedPrompt += `, ${lightingPrompts[lighting]}`;
      }
    }
    
    // 添加构图要求
    if (composition && composition !== 'none') {
      const compositionPrompts: { [key: string]: string } = {
        'rule-of-thirds': 'rule of thirds composition, balanced layout',
        symmetrical: 'symmetrical composition, balanced, centered',
        'close-up': 'close-up shot, detailed focus, intimate perspective',
        'wide-shot': 'wide shot, expansive view, environmental context',
        'birds-eye': 'bird\'s eye view, overhead perspective, aerial view'
      };
      
      if (compositionPrompts[composition]) {
        enhancedPrompt += `, ${compositionPrompts[composition]}`;
      }
    }
    
    return enhancedPrompt;
  };

  // 随机生成提示词 - 不再随机设置参数
  const generateRandomPrompt = async () => {
    try {
      // 使用PromptEnhancer生成随机提示词
      const { PromptEnhancer } = await import('@/lib/prompts');
      const randomPrompt = PromptEnhancer.getRandomPrompt();
      setPrompt(randomPrompt);
    } catch (error) {
      // 如果导入失败，使用备用提示词
      const backupPrompts = [
        "优雅的芭蕾舞者在舞台上翩翩起舞",
        "古典音乐厅中的大提琴演奏",
        "印象派风格的塞纳河畔咖啡厅",
        "文艺复兴时期的艺术工作室",
        "东方水墨画中的山水意境"
      ];
      const time = Date.now();
      const randomPrompt = backupPrompts[time % backupPrompts.length];
      setPrompt(randomPrompt);
    }
  };

  // 清除所有设置
  const clearSettings = () => {
    setPrompt('');
    setStyle('none');
    setColorScheme('none');
    setLighting('none');
    setComposition('none');
    setAspectRatio('1:1');
    setNumImages(1);
  };

  const handleSubmit = () => {
    if (!prompt.trim() || disabled || isGenerating || buttonClicked) return;

    // 立即设置按钮为已点击状态和触发动画
    setButtonClicked(true);
    setShowCelebration(true);

    const enhancedPrompt = buildEnhancedPrompt();

    // 立即调用生成并处理状态
    onGenerate({
      prompt: enhancedPrompt,
      aspectRatio,
      numImages,
      style,
      colorScheme,
      lighting,
      composition,
      guidance,
      steps,
      quality
    });

    // 5秒后重置动画状态（但不重置按钮状态，由isGenerating控制）
    setTimeout(() => {
      setShowCelebration(false);
      if (!isGenerating) {
        setButtonClicked(false);
      }
    }, 5000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="atelier-card p-8 max-w-5xl mx-auto relative"
    >
      {/* 金色主题标题 */}
      <div className="text-center mb-8">
        <h2 className="renaissance-title text-4xl lg:text-5xl mb-4">AI 图像生成</h2>
        <p className="text-xl text-amber-200/80 leading-relaxed">让创意变成现实</p>
      </div>

      {/* 核心输入区域 - 提示词和上传框同行 */}
      <div className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 提示词输入 - 占2列 */}
          <div className="lg:col-span-2">
            <label className="block text-amber-200 text-lg font-semibold mb-3">创意描述</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述您想要创作的图像，例如：一个美丽的女孩在花园里微笑，阳光透过树叶洒在她的脸上..."
              className="min-h-[160px] bg-zinc-800/60 border-2 border-zinc-600 hover:border-amber-500/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white placeholder:text-zinc-400 resize-none w-full rounded-xl p-4 text-xl leading-relaxed transition-all duration-300"
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={generateRandomPrompt}
                  className="px-3 py-2 bg-zinc-700/50 border border-zinc-600 hover:bg-zinc-600/50 text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium h-10"
                >
                  <Wand className="w-3 h-3" /> 随机
                </button>
                <button
                  onClick={clearSettings}
                  className="px-3 py-2 bg-zinc-700/50 border border-zinc-600 hover:bg-zinc-600/50 text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium h-10"
                >
                  <X className="w-3 h-3" /> 清除
                </button>
              </div>
              <span className={`text-sm font-medium ${
                prompt.length > 1800 ? 'text-red-400' : 
                prompt.length > 1000 ? 'text-amber-400' : 'text-zinc-500'
              }`}>
                {prompt.length}/2000
              </span>
            </div>
          </div>

          {/* 参考图像上传 - 占1列 */}
          <div>
            <label className="block text-amber-200 text-lg font-semibold mb-3">
              参考图像 <span className="text-sm text-amber-300/60 font-normal">(可选)</span>
            </label>
            {uploadedImages.length > 0 && numImages > 1 && (
              <div className="mb-2 p-2 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <p className="text-xs text-amber-300/80">
                  💡 使用参考图像时，系统会自动切换到单张生成模式
                </p>
              </div>
            )}
            <div
              className="h-[160px] border-2 border-dashed border-zinc-600 hover:border-zinc-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-zinc-800/30 hover:bg-zinc-800/50 group"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files && onImageUpload) {
                    setIsUploading(true);
                    onImageUpload(e.target.files);
                    setTimeout(() => setIsUploading(false), 1000);
                  }
                }}
                className="hidden"
              />
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-sm text-blue-400">上传中...</span>
                </div>
              ) : uploadedImages.length > 0 ? (
                <div className="w-full h-full overflow-hidden">
                  {uploadedImages.length === 1 ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={uploadedImages[0].preview}
                        alt="参考图像"
                        fill
                        className="object-cover rounded-xl"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveImage?.(uploadedImages[0].id);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs transition-colors z-10"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 w-full h-full p-2">
                      {uploadedImages.slice(0, 4).map((img, index) => (
                        <div key={img.id} className="relative aspect-square">
                          <Image
                            src={img.preview}
                            alt={`参考图像 ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveImage?.(img.id);
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs transition-colors z-10 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {uploadedImages.length > 4 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          +{uploadedImages.length - 4} 更多
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-zinc-400 group-hover:text-zinc-300 mb-2" />
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-300 text-center">拖拽或点击上传</span>
                  <span className="text-xs text-zinc-500">JPG, PNG, WEBP</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 功能控制行 - 所有设置在一行，高级透明背景 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 p-6 bg-gradient-to-br from-amber-900/10 via-amber-800/8 to-amber-700/10 backdrop-blur-[20px] border border-amber-400/20 rounded-2xl shadow-[inset_0_1px_0_0_rgba(251,191,36,0.1)] shadow-amber-500/5">
          {/* 艺术风格 */}
          <div>
            <label className="block text-amber-200 text-sm font-medium mb-2">艺术风格</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-zinc-700/50 border-zinc-600 text-white h-10 rounded-lg text-sm">
                <SelectValue placeholder="风格" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                {styleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-700">
                    <div className="flex items-center gap-2">
                      <IconComponent path={option.icon} className="w-3 h-3" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 色彩方案 */}
          <div>
            <label className="block text-amber-200 text-sm font-medium mb-2">色彩</label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger className="bg-zinc-700/50 border-zinc-600 text-white h-10 rounded-lg text-sm">
                <SelectValue placeholder="色彩" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                {colorSchemeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-700">
                    <div className="flex items-center gap-2">
                      <IconComponent path={option.icon} className="w-3 h-3" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 光照效果 */}
          <div>
            <label className="block text-amber-200 text-sm font-medium mb-2">光照</label>
            <Select value={lighting} onValueChange={setLighting}>
              <SelectTrigger className="bg-zinc-700/50 border-zinc-600 text-white h-10 rounded-lg text-sm">
                <SelectValue placeholder="光照" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                {lightingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-700">
                    <div className="flex items-center gap-2">
                      <IconComponent path={option.icon} className="w-3 h-3" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 构图 */}
          <div>
            <label className="block text-amber-200 text-sm font-medium mb-2">构图</label>
            <Select value={composition} onValueChange={setComposition}>
              <SelectTrigger className="bg-zinc-700/50 border-zinc-600 text-white h-10 rounded-lg text-sm">
                <SelectValue placeholder="构图" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                {compositionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-700">
                    <div className="flex items-center gap-2">
                      <IconComponent path={option.icon} className="w-3 h-3" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 画面比例 */}
          <div>
            <label className="block text-amber-200 text-sm font-medium mb-2">比例</label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger className="bg-zinc-700/50 border-zinc-600 text-white h-10 rounded-lg text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                {[
                  { value: '1:1', label: '1:1' },
                  { value: '16:9', label: '16:9' },
                  { value: '9:16', label: '9:16' },
                  { value: '4:3', label: '4:3' }
                ].map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value} className="text-white hover:bg-zinc-700">
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 生成数量 - 滑动条 */}
          <div>
            <label className="block text-amber-200 text-sm font-medium mb-2">数量: {numImages}</label>
            <input
              type="range"
              min="1"
              max="4"
              value={numImages}
              onChange={(e) => setNumImages(Number(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer mt-2 slider-modern-blue"
            />
          </div>

          {/* 高级设置按钮 */}
          <div className="flex items-end">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full h-10 bg-zinc-700/50 hover:bg-zinc-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-1 text-sm"
            >
              <Settings className="w-3 h-3" />
              高级
              <motion.span
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs"
              >
                ▼
              </motion.span>
            </button>
          </div>
        </div>


        {/* 高级设置 - 简化版本 */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-zinc-800/30 rounded-xl border border-zinc-700/50 p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 引导强度 */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    引导强度: {guidance}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={guidance}
                    onChange={(e) => setGuidance(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-modern-purple"
                  />
                  <div className="flex justify-between text-xs text-zinc-400 mt-1">
                    <span>弱</span>
                    <span>强</span>
                  </div>
                </div>
                
                {/* 推理步数 */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    推理步数: {steps}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-modern-green"
                  />
                  <div className="flex justify-between text-xs text-zinc-400 mt-1">
                    <span>快速</span>
                    <span>精细</span>
                  </div>
                </div>
                
                {/* 输出质量 */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    输出质量: {quality}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-amber"
                  />
                  <div className="flex justify-between text-xs text-zinc-400 mt-1">
                    <span>标准</span>
                    <span>最高</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* 魔法创作按钮 - 大型单独一行，居中 */}
        <div className="mt-8 flex justify-center relative">
          {/* 礼花庆祝效果 */}
          <AnimatePresence>
            {showCelebration && (
              <div className="absolute inset-0 pointer-events-none z-50">
                {[...Array(30)].map((_, i) => {
                  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
                  const startPositions = [
                    { x: '20%', y: '50%' }, { x: '80%', y: '50%' }, { x: '50%', y: '30%' },
                    { x: '30%', y: '70%' }, { x: '70%', y: '30%' }, { x: '10%', y: '40%' },
                  ];
                  const pos = startPositions[i % startPositions.length];
                  return (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: colors[i % colors.length],
                        left: pos.x,
                        top: pos.y,
                      }}
                      initial={{ 
                        scale: 0,
                        x: 0,
                        y: 0,
                        opacity: 1
                      }}
                      animate={{ 
                        scale: [0, 1, 0.5, 0],
                        x: (Math.cos(i * 12) * 200) + (i % 2 === 0 ? 100 : -100),
                        y: (Math.sin(i * 12) * 200) + (i % 3 === 0 ? -150 : -50),
                        opacity: [1, 1, 0.8, 0],
                        rotate: [0, 360, 720]
                      }}
                      transition={{
                        duration: 2.5,
                        delay: i * 0.05,
                        ease: "easeOut"
                      }}
                    />
                  );
                })}
                {/* 中心爆炸效果 */}
                <motion.div
                  className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [0, 2, 1.5, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-80" />
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          
          <Button
            onClick={handleSubmit}
            disabled={disabled || isGenerating || buttonClicked || !prompt.trim()}
            className="w-full max-w-md h-20 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold text-2xl disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 relative overflow-hidden group"
          >
            {/* 强化的魔法效果背景 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* 增强的魔法粒子效果 - 使用确定性动画避免hydration问题 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              {[...Array(20)].map((_, i) => {
                const positions = [10, 20, 30, 40, 50, 60, 70, 80, 90];
                const durations = [1, 1.5, 2, 2.5, 3];
                const delays = [0, 0.5, 1, 1.5, 2];
                return (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${positions[i % positions.length]}%`,
                    top: `${positions[(i + 1) % positions.length]}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: durations[i % durations.length],
                    repeat: Infinity,
                    delay: delays[i % delays.length]
                  }}
                />
                );
              })}
            </div>
            
            {/* 光晕效果 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent animate-pulse" />
            </div>
            
            <div className="relative z-10 flex items-center justify-center gap-4">
              {isGenerating ? (
                <>
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-purple-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                    <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-l-blue-300 rounded-full animate-spin" style={{ animationDuration: '1.2s' }} />
                  </div>
                  <span className="animate-pulse">正在召唤 AI 魔法...</span>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{ y: [-4, 4, -4] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatType: "reverse" 
                    }}
                  >
                    <Wand className="w-8 h-8 drop-shadow-lg" />
                  </motion.div>
                  <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent font-black drop-shadow-lg">
                    开始生成
                  </span>
                </>
              )}
            </div>
          </Button>
        </div>
        

        {/* 错误提示 - 重新设计 */}
        {disabled && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl border border-red-400/30"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <p className="text-red-300 font-medium">
                今日创作次数已用完
              </p>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            </div>
            <p className="text-zinc-400 text-sm">
              升级会员解锁无限创作次数
            </p>
          </motion.div>
        )}
    </motion.div>
  );
}