'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { Button } from '@/components/ui/button';
import { Wand, Palette, User, Copy, Sparkles, ArrowRight } from 'lucide-react';

interface ShowcaseExample {
  id: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  prompt: string;
  category: 'object' | 'style' | 'character';
  icon: React.ReactNode;
}

const showcaseExamples: ShowcaseExample[] = [
  {
    id: 'object-replacement',
    title: '物体替换',
    description: '精确替换图像中的特定物体，保持其他元素不变',
    beforeImage: '/images/flux-examples/example1.webp',
    afterImage: '/images/flux-examples/example2.webp',
    prompt: 'Replace the red car with a blue bicycle, keep everything else exactly the same',
    category: 'object',
    icon: <Wand className="w-5 h-5" />
  },
  {
    id: 'style-transfer',
    title: '风格转换',
    description: '改变图像的艺术风格，同时保持主体和构图',
    beforeImage: '/images/flux-examples/example2.webp',
    afterImage: '/images/flux-examples/example4.webp',
    prompt: 'Transform this portrait into a vintage oil painting style from the 1800s, maintaining the same pose and composition',
    category: 'style',
    icon: <Palette className="w-5 h-5" />
  },
  {
    id: 'character-edit',
    title: '角色编辑',
    description: '修改人物的服装、发型或表情，保持身份特征',
    beforeImage: '/images/flux-examples/example4.webp',
    afterImage: '/images/flux-examples/example1.webp',
    prompt: 'Change the person\'s outfit to a formal business suit and add glasses, keep the same facial features',
    category: 'character',
    icon: <User className="w-5 h-5" />
  }
];

const categoryColors = {
  object: 'from-blue-500 to-cyan-500',
  style: 'from-purple-500 to-pink-500',
  character: 'from-green-500 to-emerald-500'
};

export default function KontextShowcase() {
  const [selectedExample, setSelectedExample] = useState(showcaseExamples[0]);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const copyPromptToClipboard = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus('提示词已复制！');
      setTimeout(() => setCopyStatus(null), 2000);
    } catch {
      setCopyStatus('复制失败');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const copyToCreationForm = (prompt: string) => {
    // 将提示词填入创作表单
    const textareas = document.querySelectorAll('textarea');
    const promptTextarea = textareas[0]; // 假设第一个textarea是提示词输入框
    if (promptTextarea) {
      promptTextarea.value = prompt;
      promptTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      // 滚动到创作区域
      document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' });
      setCopyStatus('提示词已复制到创作界面！');
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-20 px-4"
      id="kontext-showcase"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="relative">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full opacity-20 blur-xl"></div>
            </div>
            <h2 className="renaissance-title text-4xl md:text-5xl">
              Flux Kontext Dev 技术展示
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-amber-200/80 max-w-3xl mx-auto leading-relaxed"
          >
            体验前沿的AI图像编辑技术。通过自然语言指令，实现精确的图像修改，
            同时保持其他元素的完整性和一致性。
          </motion.p>
        </div>

        {/* Main Content */}
        <div className="atelier-card p-8 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Interactive Demo */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="border border-amber-500/30 rounded-xl p-6 bg-amber-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColors[selectedExample.category]}`}>
                    {selectedExample.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-amber-100">
                      {selectedExample.title}
                    </h3>
                    <p className="text-sm text-amber-200/70">
                      {selectedExample.description}
                    </p>
                  </div>
                </div>

                {/* Before/After Slider */}
                <BeforeAfterSlider
                  beforeImage={selectedExample.beforeImage}
                  afterImage={selectedExample.afterImage}
                  beforeLabel="修改前"
                  afterLabel="修改后"
                  className="mb-6"
                />

                {/* Prompt Display */}
                <div className="bg-zinc-800/50 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-300">编辑提示词</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyPromptToClipboard(selectedExample.prompt)}
                        className="text-amber-200 hover:text-amber-100 hover:bg-amber-500/10 px-2 py-1 h-7"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        复制
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => copyToCreationForm(selectedExample.prompt)}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3 py-1 h-7 text-xs"
                      >
                        <Wand className="w-3 h-3 mr-1" />
                        立即使用
                      </Button>
                    </div>
                  </div>
                  <p className="text-amber-100 text-sm leading-relaxed font-mono bg-black/20 p-3 rounded-lg">
                    &ldquo;{selectedExample.prompt}&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Examples List */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-semibold text-amber-100 mb-6">
                  应用示例
                </h3>
                <div className="grid gap-4">
                  {showcaseExamples.map((example, index) => (
                    <motion.button
                      key={example.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => setSelectedExample(example)}
                      className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                        selectedExample.id === example.id
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColors[example.category]}`}>
                          {example.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-amber-100 font-medium">{example.title}</h4>
                          <p className="text-amber-200/70 text-sm">{example.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="border border-amber-500/30 rounded-xl p-6 bg-amber-500/5">
                <h4 className="text-lg font-semibold text-amber-100 mb-4">使用技巧</h4>
                <ul className="space-y-2 text-sm text-amber-200/80">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>使用英文提示词可获得更好的效果</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>描述要具体明确，避免模糊的表达</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>可以指定保持不变的元素</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Copy Status */}
        {copyStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="atelier-card px-6 py-3 border border-amber-500/30 bg-amber-500/10">
              <p className="text-amber-200 font-medium">{copyStatus}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}