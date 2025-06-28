'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Download, 
  Copy,
  Heart,
  Palette,
  Zap,
  Moon,
  Sun,
  Wand,
  Loader2,
  Shuffle,
  Stars,
  Menu,
  X,
  Settings,
  ChevronDown,
  Mail,
  Twitter,
  Github,
  Cpu,
  ImageIcon
} from 'lucide-react';

const STYLE_PRESETS = [
  { 
    id: 'realistic', 
    name: '写实摄影', 
    prompt: 'photorealistic, professional photography, high quality, detailed',
  },
  { 
    id: 'artistic', 
    name: '艺术绘画', 
    prompt: 'oil painting, artistic style, fine art, masterpiece, detailed brushwork',
  },
  { 
    id: 'anime', 
    name: '动漫风格', 
    prompt: 'anime style, manga art, japanese animation, vibrant colors, detailed',
  },
  { 
    id: 'cinematic', 
    name: '电影质感', 
    prompt: 'cinematic lighting, movie scene, dramatic composition, film grain',
  },
  { 
    id: 'minimalist', 
    name: '极简风格', 
    prompt: 'minimalist style, clean design, simple composition, modern art',
  },
  {
    id: 'fantasy',
    name: '奇幻风格',
    prompt: 'fantasy art, magical, ethereal, mystical atmosphere, epic fantasy',
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    prompt: 'cyberpunk style, neon lights, futuristic, high tech, sci-fi',
  },
  {
    id: 'vintage',
    name: '复古风格',
    prompt: 'vintage style, retro aesthetic, aged photo, nostalgic atmosphere',
  }
];

const ASPECT_RATIOS = [
  { id: '1:1', name: '正方形 (1:1)', value: '1:1' },
  { id: '16:9', name: '宽屏 (16:9)', value: '16:9' },
  { id: '9:16', name: '竖屏 (9:16)', value: '9:16' },
  { id: '4:3', name: '标准 (4:3)', value: '4:3' },
  { id: '3:4', name: '竖版 (3:4)', value: '3:4' },
  { id: '21:9', name: '超宽 (21:9)', value: '21:9' },
];

// 随机提示词数据库
const RANDOM_PROMPTS = [
  "一只可爱的小猫在花园里玩耍",
  "壮观的山景日出",
  "未来科技城市的夜景",
  "古老森林中的神秘小径",
  "海边的灯塔在暴风雨中",
  "宇宙中美丽的星云",
  "蒸汽朋克风格的机器人",
  "魔法森林中的仙女",
  "现代艺术博物馆内部",
  "热带海滩的日落",
  "雪山上的小木屋",
  "繁华都市的霓虹灯",
  "古堡在月光下的剪影",
  "彩虹桥横跨瀑布",
  "太空站在地球轨道上",
  "樱花飘落的庭院",
  "沙漠中的绿洲",
  "水晶洞穴的奇观",
  "飞龙在云层中翱翔",
  "维多利亚时代的街道"
];

// 提示词增强词汇
const ENHANCEMENT_KEYWORDS = [
  "high quality", "detailed", "masterpiece", "professional", 
  "8k resolution", "ultra detailed", "photorealistic", "stunning",
  "cinematic lighting", "perfect composition", "award winning",
  "trending on artstation", "digital art", "concept art"
];

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  style: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [usageToday, setUsageToday] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  // 高级设置参数
  const [quality, setQuality] = useState(95);
  const [styleStrength, setStyleStrength] = useState(7);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [seed, setSeed] = useState('');

  const MAX_DAILY_USAGE = 50;

  useEffect(() => {
    const today = new Date().toDateString();
    const usageKey = `flux_usage_${today}`;
    const usage = localStorage.getItem(usageKey);
    setUsageToday(usage ? parseInt(usage) : 0);

    const savedHistory = localStorage.getItem('flux_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  // 翻译功能
  const translateText = async (text: string) => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  // 构建最终提示词
  const buildPrompt = async () => {
    const style = STYLE_PRESETS.find(s => s.id === selectedStyle);
    let finalPrompt = prompt.trim();
    
    // 翻译中文到英文
    finalPrompt = await translateText(finalPrompt);
    
    // 添加风格提示词
    const parts = [finalPrompt];
    if (style?.prompt) {
      parts.push(style.prompt);
    }
    
    return parts.filter(Boolean).join(', ');
  };

  // 随机生成提示词
  const generateRandomPrompt = () => {
    const randomPrompt = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    setPrompt(randomPrompt);
  };

  // 增强提示词
  const enhancePrompt = () => {
    if (!prompt.trim()) return;
    
    const enhancement = ENHANCEMENT_KEYWORDS.slice(0, 3).join(', ');
    const enhancedPrompt = `${prompt.trim()}, ${enhancement}`;
    setPrompt(enhancedPrompt);
  };

  const handleGenerate = async () => {
    const finalPrompt = await buildPrompt();
    if (!finalPrompt.trim()) return;
    
    if (usageToday >= MAX_DAILY_USAGE) {
      alert(`今日剩余次数不足，剩余 ${MAX_DAILY_USAGE - usageToday} 次`);
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedImages([]);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          negativePrompt: negativePrompt || undefined,
          aspectRatio: aspectRatio,
          quality: quality,
          styleStrength: styleStrength,
          seed: seed ? parseInt(seed) : undefined,
        }),
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (data.success) {
        setGeneratedImages([data.imageUrl]);
        
        const newImage: GeneratedImage = {
          id: `${Date.now()}`,
          url: data.imageUrl,
          prompt: finalPrompt,
          timestamp: Date.now(),
          style: selectedStyle
        };
        
        const newHistory = [newImage, ...history.slice(0, 50)];
        setHistory(newHistory);
        localStorage.setItem('flux_history', JSON.stringify(newHistory));
        
        const today = new Date().toDateString();
        const newUsage = usageToday + 1;
        localStorage.setItem(`flux_usage_${today}`, newUsage.toString());
        setUsageToday(newUsage);
      } else {
        throw new Error(data.error || '生成失败');
      }

      setProgress(100);
    } catch (error) {
      console.error('Generation error:', error);
      alert(error instanceof Error ? error.message : '生成失败，请重试');
    } finally {
      setTimeout(() => setIsGenerating(false), 500);
    }
  };

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `artforge-ai-${Date.now()}.png`;
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
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-900/90 border-gray-700/50' 
            : 'bg-white/90 border-gray-200/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  ArtForge AI
                </span>
                <span className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  AI图像生成平台
                </span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { name: '功能', href: '#features' },
                { name: '定价', href: '#pricing' },
                { name: '帮助', href: '#faq' },
                { name: '关于', href: '#about' }
              ].map((item) => (
                <motion.a 
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium cursor-pointer transition-colors ${
                    isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  whileHover={{ y: -1 }}
                >
                  {item.name}
                </motion.a>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </motion.button>
              
              <Badge 
                variant="secondary" 
                className={`hidden sm:flex px-3 py-1 ${
                  isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'
                }`}
              >
                剩余 {MAX_DAILY_USAGE - usageToday} 次
              </Badge>
              
              <Button className="hidden sm:flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium">
                开始使用
              </Button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-200 dark:border-gray-700"
              >
                <div className="py-4 space-y-2">
                  {[
                    { name: '功能', href: '#features' },
                    { name: '定价', href: '#pricing' },
                    { name: '帮助', href: '#faq' },
                    { name: '关于', href: '#about' }
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                  <div className="px-4 py-2">
                    <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      剩余 {MAX_DAILY_USAGE - usageToday} 次
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 英雄区域 */}
        <section className="py-16 lg:py-24">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              释放无限创意潜能
            </motion.h1>
            
            <motion.p 
              className={`text-lg sm:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              使用先进的AI技术，将文字描述转化为令人惊叹的艺术作品
            </motion.p>

            <motion.div 
              className="flex flex-wrap justify-center gap-3 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                { text: '免费使用', icon: Sparkles },
                { text: '高质量输出', icon: ImageIcon },
                { text: '多种风格', icon: Palette },
                { text: '快速生成', icon: Zap }
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <Badge 
                    key={feature.text}
                    className={`px-4 py-2 text-sm font-medium rounded-full flex items-center gap-2 ${
                      isDarkMode 
                        ? 'bg-gray-800 text-gray-200 border-gray-700' 
                        : 'bg-white text-gray-700 border-gray-200 shadow-sm'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {feature.text}
                  </Badge>
                );
              })}
            </motion.div>
          </motion.div>
        </section>

        {/* AI 生成器区域 */}
        <section className="py-8">
          <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} shadow-xl`}>
            <CardHeader>
              <CardTitle className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                AI 图像生成器
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                输入您的创意描述，选择艺术风格，AI将为您创作独特的艺术作品
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 提示词输入 */}
              <div className="space-y-3">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  描述您想要的图像
                </label>
                
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="例如：一只可爱的小猫坐在彩虹桥上，阳光透过云层洒下，梦幻风格..."
                  className={`min-h-[100px] text-base resize-none border-2 transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-0`}
                  maxLength={2000}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={generateRandomPrompt}
                      variant="outline"
                      size="sm"
                      className={`text-xs ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                    >
                      <Shuffle className="w-3 h-3 mr-1" />
                      随机提示词
                    </Button>
                    
                    <Button
                      onClick={enhancePrompt}
                      variant="outline"
                      size="sm"
                      disabled={!prompt.trim()}
                      className={`text-xs ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                    >
                      <Stars className="w-3 h-3 mr-1" />
                      增强描述
                    </Button>
                  </div>
                  
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {prompt.length}/2000
                  </span>
                </div>
              </div>

              {/* 基础设置 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    艺术风格
                  </label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className={`${
                      isDarkMode ? 'bg-gray-900/50 border-gray-600 text-white' : 'bg-white border-gray-200'
                    }`}>
                      <SelectValue placeholder="选择艺术风格" />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}>
                      {STYLE_PRESETS.map((style) => (
                        <SelectItem key={style.id} value={style.id} className={isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-50'}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    图像尺寸
                  </label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className={`${
                      isDarkMode ? 'bg-gray-900/50 border-gray-600 text-white' : 'bg-white border-gray-200'
                    }`}>
                      <SelectValue placeholder="选择图像尺寸" />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}>
                      {ASPECT_RATIOS.map((ratio) => (
                        <SelectItem key={ratio.id} value={ratio.value} className={isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-50'}>
                          {ratio.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 高级设置 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    高级设置
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className={`text-xs ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    {showAdvancedSettings ? '隐藏' : '显示'}
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
                  </Button>
                </div>

                <AnimatePresence>
                  {showAdvancedSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className={`block text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            图像质量: {quality}
                          </label>
                          <input
                            type="range"
                            min="70"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className={`block text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            风格强度: {styleStrength}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={styleStrength}
                            onChange={(e) => setStyleStrength(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={`block text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          负面提示词 (不希望出现的内容)
                        </label>
                        <Textarea
                          value={negativePrompt}
                          onChange={(e) => setNegativePrompt(e.target.value)}
                          placeholder="例如：模糊、低质量、变形..."
                          className={`min-h-[60px] text-sm resize-none ${
                            isDarkMode 
                              ? 'bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-400' 
                              : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-500'
                          }`}
                          maxLength={500}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className={`block text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          随机种子 (可选，用于复现相同结果)
                        </label>
                        <input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(e.target.value)}
                          placeholder="留空则随机生成"
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDarkMode 
                              ? 'bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-400' 
                              : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 生成按钮 */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center space-x-2"
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>生成中... {progress}%</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="generate"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center space-x-2"
                      >
                        <Wand className="w-5 h-5" />
                        <span>开始创作</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>

              {/* 进度条 */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      正在使用 Flux.1 模型生成您的艺术作品...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </section>

        {/* 生成结果展示 */}
        <AnimatePresence>
          {generatedImages.length > 0 && (
            <motion.section 
              className="py-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} shadow-xl`}>
                <CardHeader>
                  <CardTitle className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Sparkles className="w-5 h-5" />
                    生成结果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedImages.map((imageUrl, index) => (
                      <motion.div
                        key={index}
                        className="group relative"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                      >
                        <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                          <Image
                            src={imageUrl}
                            alt={`Generated image ${index + 1}`}
                            width={512}
                            height={512}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        
                        <motion.div 
                          className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => downloadImage(imageUrl)}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => setSelectedImage(imageUrl)}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => copyToClipboard(imageUrl)}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>

        {/* 历史记录 */}
        <AnimatePresence>
          {history.length > 0 && (
            <motion.section 
              className="py-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} shadow-xl`}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Heart className="w-5 h-5 text-red-500" />
                      创作历史
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setHistory([]);
                        localStorage.removeItem('flux_history');
                      }}
                      className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                    >
                      清空历史
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {history.slice(0, 12).map((item, index) => (
                      <motion.div 
                        key={item.id}
                        className="group cursor-pointer"
                        onClick={() => setSelectedImage(item.url)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden shadow-md mb-2">
                          <Image
                            src={item.url}
                            alt="Historical image"
                            width={200}
                            height={200}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <p className={`text-xs truncate ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {item.prompt.slice(0, 30)}...
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>

        {/* FAQ 部分 */}
        <section id="faq" className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                常见问题
              </h2>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                了解更多关于 ArtForge AI 的信息
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {[
                {
                  question: "ArtForge AI 是否完全免费？",
                  answer: "是的！我们为所有用户提供每日免费的图像生成额度，让您可以无限制地探索创意。"
                },
                {
                  question: "支持哪些艺术风格？",
                  answer: "我们支持8种主要艺术风格：写实摄影、艺术绘画、动漫风格、电影质感、极简风格、奇幻风格、赛博朋克和复古风格。"
                },
                {
                  question: "生成一张图像需要多长时间？",
                  answer: "通常需要30-60秒，具体时间取决于图像复杂度和服务器负载。我们使用最先进的Flux.1模型确保高质量输出。"
                },
                {
                  question: "我可以商用生成的图像吗？",
                  answer: "您拥有生成图像的完整使用权，包括商业用途。请确保您的提示词不侵犯他人版权。"
                },
                {
                  question: "如何获得更好的生成效果？",
                  answer: "详细描述您的想法，使用具体的形容词，选择合适的艺术风格，并尝试使用负面提示词排除不需要的元素。"
                }
              ].map((faq, index) => (
                <Card key={index} className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardContent className="p-6">
                    <details className="group">
                      <summary className={`flex items-center justify-between cursor-pointer list-none ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <h3 className="font-semibold text-lg">{faq.question}</h3>
                        <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {faq.answer}
                      </p>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t py-12 mt-20 ${
        isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* 品牌信息 */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ArtForge AI
                </span>
              </div>
              <p className={`mb-4 max-w-md ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                使用最先进的AI技术，将您的创意想法转化为令人惊叹的视觉艺术作品。释放无限创意潜能，探索艺术的无穷可能。
              </p>
              <div className="flex space-x-4">
                <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* 产品链接 */}
            <div>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                产品
              </h3>
              <ul className="space-y-2">
                {['AI图像生成', '风格转换', '批量处理', '高级编辑'].map((item) => (
                  <li key={item}>
                    <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 支持链接 */}
            <div>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                支持
              </h3>
              <ul className="space-y-2">
                {['帮助中心', 'API文档', '社区论坛', '联系我们'].map((item) => (
                  <li key={item}>
                    <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2024 ArtForge AI. 保留所有权利。
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {['隐私政策', '服务条款', '使用协议'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* 大图查看器 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              className="relative max-w-4xl max-h-full w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4">
                <Image
                  src={selectedImage}
                  alt="Selected image"
                  width={1024}
                  height={1024}
                  className="w-full h-auto rounded-xl"
                />
                
                <div className="absolute top-6 right-6 flex space-x-2">
                  <Button
                    size="icon"
                    onClick={() => downloadImage(selectedImage)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setSelectedImage(null)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}