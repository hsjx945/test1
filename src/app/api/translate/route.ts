import { NextRequest, NextResponse } from 'next/server';
import { Translate } from '@google-cloud/translate/build/src/v2';

// 检测文本是否为中文
function isChineseText(text: string): boolean {
  const chineseRegex = /[\u4e00-\u9fff]/;
  return chineseRegex.test(text);
}

// 简单的中英文对照词典（作为备用方案）
const translationDict: Record<string, string> = {
  // 基础词汇
  '美丽': 'beautiful',
  '漂亮': 'pretty',
  '女孩': 'girl',
  '男孩': 'boy',
  '女人': 'woman',
  '男人': 'man',
  '猫': 'cat',
  '狗': 'dog',
  '花': 'flower',
  '树': 'tree',
  '山': 'mountain',
  '海': 'sea',
  '天空': 'sky',
  '云': 'cloud',
  '太阳': 'sun',
  '月亮': 'moon',
  '星星': 'star',
  
  // 颜色
  '红色': 'red',
  '蓝色': 'blue',
  '绿色': 'green',
  '黄色': 'yellow',
  '黑色': 'black',
  '白色': 'white',
  '紫色': 'purple',
  '粉色': 'pink',
  
  // 风格词汇
  '动漫': 'anime',
  '写实': 'realistic',
  '艺术': 'artistic',
  '油画': 'oil painting',
  '水彩': 'watercolor',
  '素描': 'sketch',
  '电影': 'cinematic',
  '梦幻': 'dreamy',
  '科幻': 'sci-fi',
  '未来': 'futuristic',
  
  // 动作
  '站立': 'standing',
  '坐着': 'sitting',
  '跑步': 'running',
  '飞行': 'flying',
  '游泳': 'swimming',
  
  // 场景
  '森林': 'forest',
  '城市': 'city',
  '街道': 'street',
  '房间': 'room',
  '花园': 'garden',
  '海滩': 'beach',
  '沙漠': 'desert',
  
  // 时间
  '白天': 'daytime',
  '夜晚': 'night',
  '黄昏': 'sunset',
  '黎明': 'dawn',
  
  // 情感和氛围
  '快乐': 'happy',
  '悲伤': 'sad',
  '神秘': 'mysterious',
  '浪漫': 'romantic',
  '温暖': 'warm',
  '寒冷': 'cold',
  
  // 质量描述
  '高质量': 'high quality',
  '详细': 'detailed',
  '精美': 'exquisite',
  '完美': 'perfect',
  '专业': 'professional',
  '杰作': 'masterpiece',
  
  // 摄影术语
  '特写': 'close-up',
  '全身': 'full body',
  '半身像': 'portrait',
  '广角': 'wide angle',
  '微距': 'macro',
  '虚化背景': 'blurred background',
  
  // 穿着
  '连衣裙': 'dress',
  '衬衫': 'shirt',
  '外套': 'coat',
  '帽子': 'hat',
  '鞋子': 'shoes',
  
  // 常用修饰词
  '非常': 'very',
  '极其': 'extremely',
  '稍微': 'slightly',
  '有点': 'a bit',
  '完全': 'completely',
  
  // 构图和视角
  '俯视': 'bird\'s eye view',
  '仰视': 'low angle',
  '侧面': 'side view',
  '正面': 'front view',
  '背面': 'back view',
};

// 基于词典的简单翻译（备用方案）
function translateWithDict(text: string): string {
  let translatedText = text;
  
  // 按词典逐词替换
  Object.entries(translationDict).forEach(([chinese, english]) => {
    const regex = new RegExp(chinese, 'g');
    translatedText = translatedText.replace(regex, english);
  });
  
  return translatedText;
}

// LibreTranslate API 翻译（免费）
async function translateWithLibre(text: string): Promise<{text: string, method: string}> {
  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'zh',
        target: 'en',
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.translatedText,
      method: 'libretranslate'
    };
  } catch (error) {
    console.error('LibreTranslate API error:', error);
    // 如果 LibreTranslate API 失败，使用备用词典翻译
    return {
      text: translateWithDict(text),
      method: 'dictionary'
    };
  }
}

// Google Translate API 翻译
async function translateWithGoogle(text: string): Promise<{text: string, method: string}> {
  try {
    // 检查是否配置了 Google API Key
    if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
      console.log('Google Translate API Key not configured, trying LibreTranslate');
      return translateWithLibre(text);
    }

    const translate = new Translate({
      key: process.env.GOOGLE_TRANSLATE_API_KEY,
    });

    const [translation] = await translate.translate(text, 'en');
    return {
      text: translation,
      method: 'google'
    };
  } catch (error) {
    console.error('Google Translate API error:', error);
    // 如果 Google API 失败，尝试 LibreTranslate
    console.log('Falling back to LibreTranslate');
    return translateWithLibre(text);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // 检测是否为中文
    if (!isChineseText(text)) {
      return NextResponse.json({ 
        translatedText: text,
        isTranslated: false 
      });
    }

    // 使用 Google Translate API（如果配置了）或备用词典翻译
    const result = await translateWithGoogle(text);
    
    return NextResponse.json({ 
      translatedText: result.text,
      isTranslated: true,
      originalText: text,
      method: result.method
    });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}