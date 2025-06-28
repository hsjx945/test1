'use client';

import { useState, useCallback } from 'react';

interface GenerationOptions {
  prompt: string;
  aspectRatio?: string;
  style?: string;
  translatePrompt?: boolean;
}

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export function useAIGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const translatePrompt = async (text: string): Promise<string> => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  const generateImage = useCallback(async (options: GenerationOptions): Promise<GenerationResult> => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedImages([]);

    try {
      // 进度模拟
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // 翻译提示词（如果需要）
      let finalPrompt = options.prompt;
      if (options.translatePrompt && /[\u4e00-\u9fff]/.test(finalPrompt)) {
        finalPrompt = await translatePrompt(finalPrompt);
      }

      // 调用API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspectRatio: options.aspectRatio || '1:1',
        }),
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (data.success) {
        setGeneratedImages([data.imageUrl]);
        setProgress(100);
        return { success: true, imageUrl: data.imageUrl };
      } else {
        throw new Error(data.error || '生成失败');
      }
    } catch (error) {
      console.error('Generation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '生成失败，请重试' 
      };
    } finally {
      setTimeout(() => setIsGenerating(false), 500);
    }
  }, []);

  return {
    isGenerating,
    progress,
    generatedImages,
    generateImage,
    setGeneratedImages
  };
}