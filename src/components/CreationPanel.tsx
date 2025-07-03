'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  Edit3, 
  Shuffle, 
  Cpu, 
  Palette, 
  Camera, 
  Upload 
} from 'lucide-react';

interface CreationPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  onRandomPrompt: () => void;
  onSmartOptimize: () => void;
  onArtHistoryStyle: () => void;
  onPhotoEnhancement: () => void;
  stylePresets: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  aspectRatios: Array<{
    id: string;
    name: string;
    value: string;
    icon: string;
  }>;
  uploadComponent?: React.ReactNode;
}

export default function CreationPanel({
  prompt,
  setPrompt,
  selectedStyle,
  setSelectedStyle,
  aspectRatio,
  setAspectRatio,
  onRandomPrompt,
  onSmartOptimize,
  onArtHistoryStyle,
  onPhotoEnhancement,
  stylePresets,
  aspectRatios,
  uploadComponent
}: CreationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="atelier-card p-8 max-w-5xl mx-auto"
    >
      <div className="grid lg:grid-cols-4 gap-8">
        {/* 左侧：创意描述区域 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Edit3 className="w-6 h-6 text-amber-400" />
            <h3 className="text-2xl font-bold text-amber-100">创作灵感</h3>
          </div>
          
          <div className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述您的艺术灵感... 例如：优雅的芭蕾舞者在月光下翩翩起舞"
              className="atelier-input min-h-[140px] text-lg resize-none"
              maxLength={2000}
            />
            
            {/* 智能功能按钮组 */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onRandomPrompt}
                variant="outline"
                size="sm"
                className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                随机灵感
              </Button>
              <Button
                onClick={onSmartOptimize}
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-blue-200 hover:bg-blue-500/10"
              >
                <Cpu className="w-4 h-4 mr-2" />
                智能优化
              </Button>
              <Button
                onClick={onArtHistoryStyle}
                variant="outline"
                size="sm"
                className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
              >
                <Palette className="w-4 h-4 mr-2" />
                艺术史风格
              </Button>
              <Button
                onClick={onPhotoEnhancement}
                variant="outline"
                size="sm"
                className="border-green-500/30 text-green-200 hover:bg-green-500/10"
              >
                <Camera className="w-4 h-4 mr-2" />
                摄影级增强
              </Button>
            </div>
            
            <div className="text-right">
              <span className="text-sm text-amber-300/60">
                {prompt.length}/2000
              </span>
            </div>
          </div>
        </div>

        {/* 右上：艺术风格选择 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-amber-100">艺术风格</h4>
          </div>
          
          <div className="space-y-3">
            {stylePresets.slice(0, 4).map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedStyle === style.id
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-100'
                    : 'bg-amber-500/5 border border-amber-500/20 text-amber-200/80 hover:bg-amber-500/10'
                }`}
              >
                <div className="font-medium text-sm">{style.name}</div>
                <div className="text-xs opacity-70 mt-1">{style.description}</div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger className="atelier-select">
                <SelectValue placeholder="选择比例" />
              </SelectTrigger>
              <SelectContent>
                {aspectRatios.map((ratio) => (
                  <SelectItem key={ratio.id} value={ratio.value}>
                    {ratio.icon} {ratio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 右下：参考图像 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-amber-100">参考图像</h4>
          </div>
          
          {uploadComponent || (
            <div className="atelier-upload p-4 text-center min-h-[160px] flex items-center justify-center">
              <div>
                <Camera className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <p className="text-sm text-amber-300/70">
                  拖拽图像到此处<br />
                  或点击上传
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}