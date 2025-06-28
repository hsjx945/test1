// 风格预设
export const STYLE_PRESETS = [
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

// 画面比例
export const ASPECT_RATIOS = [
  { id: '1:1', name: '正方形 (1:1)', value: '1:1', icon: '□' },
  { id: '16:9', name: '宽屏 (16:9)', value: '16:9', icon: '▬' },
  { id: '9:16', name: '竖屏 (9:16)', value: '9:16', icon: '▮' },
  { id: '4:3', name: '标准 (4:3)', value: '4:3', icon: '▭' },
  { id: '3:4', name: '竖版 (3:4)', value: '3:4', icon: '▯' },
  { id: '21:9', name: '超宽 (21:9)', value: '21:9', icon: '▬' },
];

// 随机提示词数据库
export const RANDOM_PROMPTS = [
  "优雅的芭蕾舞者在舞台上翩翩起舞",
  "古典音乐厅中的大提琴演奏",
  "印象派风格的塞纳河畔咖啡厅",
  "文艺复兴时期的艺术工作室",
  "东方水墨画中的山水意境",
  "现代艺术画廊的雕塑展示",
  "古典建筑的光影交错",
  "艺术家手中的调色板",
  "博物馆中的名画欣赏",
  "工作室中的陶艺创作"
];

// 增强提示词
export const ENHANCEMENT_KEYWORDS = [
  "masterpiece", "best quality", "ultra detailed", "8k resolution", 
  "professional", "artistic", "cinematic lighting", "perfect composition"
];

// 智能功能提示词模板
export const SMART_FEATURES = {
  artHistory: [
    "in the style of Van Gogh", "Renaissance painting style", "Impressionist technique",
    "Art Nouveau design", "Baroque dramatic lighting", "Minimalist modern art"
  ],
  photoEnhance: [
    "professional photography", "studio lighting", "shallow depth of field",
    "golden hour lighting", "high contrast", "ultra sharp details"
  ],
  sceneEnhance: [
    "atmospheric perspective", "cinematic composition", "dramatic sky",
    "volumetric lighting", "magical atmosphere", "epic landscape"
  ],
  characterEnhance: [
    "detailed facial features", "expressive eyes", "dynamic pose",
    "elegant posture", "realistic skin texture", "professional portrait"
  ]
};

// 提示词处理工具函数
export class PromptEnhancer {
  static getRandomPrompt(): string {
    return RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
  }

  static addArtHistoryStyle(prompt: string): string {
    if (!prompt.trim()) return prompt;
    const artStyle = SMART_FEATURES.artHistory[Math.floor(Math.random() * SMART_FEATURES.artHistory.length)];
    return `${prompt.trim()}, ${artStyle}`;
  }

  static addPhotoEnhancement(prompt: string): string {
    if (!prompt.trim()) return prompt;
    const photoEnhance = SMART_FEATURES.photoEnhance.slice(0, 2).join(', ');
    return `${prompt.trim()}, ${photoEnhance}`;
  }

  static smartOptimize(prompt: string): string {
    if (!prompt.trim()) return prompt;
    
    const lowerPrompt = prompt.toLowerCase();
    const enhancements = [...ENHANCEMENT_KEYWORDS.slice(0, 2)];
    
    // 智能检测内容类型并添加对应增强
    if (lowerPrompt.includes('人') || lowerPrompt.includes('woman') || lowerPrompt.includes('man') || lowerPrompt.includes('person')) {
      enhancements.push(...SMART_FEATURES.characterEnhance.slice(0, 1));
    }
    
    if (lowerPrompt.includes('风景') || lowerPrompt.includes('landscape') || lowerPrompt.includes('场景') || lowerPrompt.includes('scene')) {
      enhancements.push(...SMART_FEATURES.sceneEnhance.slice(0, 1));
    }
    
    if (lowerPrompt.includes('摄影') || lowerPrompt.includes('photo') || lowerPrompt.includes('camera')) {
      enhancements.push(...SMART_FEATURES.photoEnhance.slice(0, 1));
    } else {
      enhancements.push(...SMART_FEATURES.artHistory.slice(0, 1));
    }
    
    return `${prompt.trim()}, ${enhancements.join(', ')}`;
  }

  static applyStyle(prompt: string, styleId: string): string {
    const style = STYLE_PRESETS.find(s => s.id === styleId);
    if (style && prompt.trim()) {
      return `${prompt.trim()}, ${style.prompt}`;
    }
    return prompt;
  }
}