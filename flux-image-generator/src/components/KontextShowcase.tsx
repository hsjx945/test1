'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { Wand, Palette, User, Type, Sparkles, ArrowRight } from 'lucide-react';

interface ShowcaseExample {
  id: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  prompt: string;
  category: 'object' | 'style' | 'character' | 'text';
  icon: React.ReactNode;
}

const showcaseExamples: ShowcaseExample[] = [
  {
    id: 'object-replacement',
    title: '物体替换',
    description: '精确替换图像中的特定物体，保持其他元素不变',
    beforeImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjEyMTIxIi8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMTUwIiByPSI2MCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjIwMCIgeT0iMjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIj7ljp/lm77kuK3mnInmsb3ova88L3RleHQ+PC9zdmc+',
    afterImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjEyMTIxIi8+PHJlY3QgeD0iMTcwIiB5PSIxMjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2Y1OWUwYiIgcng9IjEwIi8+PHRleHQgeD0iMjAwIiB5PSIyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPuabtOaNouWQjueahOaRqOaJmOi9pjwvdGV4dD48L3N2Zz4=',
    prompt: '将圆形物体替换为方形物体',
    category: 'object',
    icon: <Wand className="w-5 h-5" />
  },
  {
    id: 'style-transfer',
    title: '风格转换',
    description: '改变图像的艺术风格，同时保持主体和构图',
    beforeImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2ZjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM0ZjQ2ZTUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PHRleHQgeD0iMjAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE4IiBmb250LWZhbWlseT0iQXJpYWwiPueBqOWunuS4u+S5iemdoOWDjzwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+5Y6f5pig6aKY6ImyPC90ZXh0Pjwvc3ZnPg==',
    afterImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJiIj48ZmVHYXVzc2lhbkJsdXIgaW49IlNvdXJjZUdyYXBoaWMiIHN0ZERldmlhdGlvbj0iMiIvPjwvZmlsdGVyPjxwYXR0ZXJuIGlkPSJjIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2Y1OWUwYiIgb3BhY2l0eT0iMC4zIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2MpIi8+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzM5MzkzOSIgZmlsdGVyPSJ1cmwoI2IpIiBvcGFjaXR5PSIwLjciLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2Y1OWUwYiIgZm9udC1zaXplPSIxOCIgZm9udC1mYW1pbHk9IkFyaWFsIj7nurjnlLvmtLfoibLnmoQ8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmNTllMGIiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+5Y2w6LGh5rS+6aKY6ImyPC90ZXh0Pjwvc3ZnPg==',
    prompt: '转换为印象派油画风格',
    category: 'style',
    icon: <Palette className="w-5 h-5" />
  },
  {
    id: 'character-consistency',
    title: '角色一致性',
    description: '在不同场景中保持角色特征的一致性',
    beforeImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzczNzM3Ii8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMTIwIiByPSIzMCIgZmlsbD0iI2ZkYmE3NCIvPjxyZWN0IHg9IjE4MCIgeT0iMTUwIiB3aWR0aD0iNDAiIGhlaWdodD0iNjAiIGZpbGw9IiMzZjc2ZjQiLz48cmVjdCB4PSIxNDAiIHk9IjIwMCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzU5NTk1OSIvPjx0ZXh0IHg9IjIwMCIgeT0iMjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIj7ljp/lm77kuK3nmoTnlLXliKnlrqQtPuWKnuWFrOWupDwvdGV4dD48L3N2Zz4=',
    afterImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjJjNTVlIi8+PGVsbGlwc2UgY3g9IjIwMCIgY3k9IjI2MCIgcng9IjgwIiByeT0iMjAiIGZpbGw9IiMxNmEzNGEiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSI4MCIgcj0iMjAiIGZpbGw9IiNmZGJhNzQiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjE1IiBmaWxsPSIjZmY5MzNhIi8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMTIwIiByPSIzMCIgZmlsbD0iI2ZkYmE3NCIvPjxyZWN0IHg9IjE4MCIgeT0iMTUwIiB3aWR0aD0iNDAiIGhlaWdodD0iNjAiIGZpbGw9IiMzZjc2ZjQiLz48dGV4dCB4PSIyMDAiIHk9IjI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+5oyH5Lit55qE6KeS6Imy6L2254e75Yqo5Yiw57qm5Yy65Lit5a2mPC90ZXh0Pjwvc3ZnPg==',
    prompt: '将角色移动到公园环境中',
    category: 'character',
    icon: <User className="w-5 h-5" />
  },
  {
    id: 'text-editing',
    title: '文字编辑',
    description: '直接编辑图像中的文字内容',
    beforeImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+PHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIyMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzIyYzU1ZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+6JCl5Lia5LitPC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIj7ljp/lm77nirbniYxPUEVO5qCH54mMPC90ZXh0Pjwvc3ZnPg==',
    afterImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+PHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIyMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2VmNDQ0NCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+5LyR5oGvPC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIj7ov5/mlK/nirbniYzlsIblrabniYzmiafotYTmm7TmlLnkuLpDTE9TRUTlrabniYw8L3RleHQ+PC9zdmc+',
    prompt: '将标牌文字从"营业中"改为"休息"',
    category: 'text',
    icon: <Type className="w-5 h-5" />
  }
];

const categoryColors = {
  object: 'from-blue-500 to-cyan-500',
  style: 'from-purple-500 to-pink-500',
  character: 'from-green-500 to-emerald-500',
  text: 'from-orange-500 to-red-500'
};

export default function KontextShowcase() {
  const [selectedExample, setSelectedExample] = useState(showcaseExamples[0]);

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
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Interactive Demo */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="atelier-card p-6">
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
                className="mb-4"
              />

              {/* Prompt Display */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">编辑指令</span>
                </div>
                <p className="text-amber-100 font-medium">
                  &ldquo;{selectedExample.prompt}&rdquo;
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feature Explanation & Examples List */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Core Features */}
            <div className="atelier-card p-6">
              <h3 className="text-2xl font-semibold text-amber-100 mb-4">
                核心技术特性
              </h3>
              <ul className="space-y-3">
                {[
                  { 
                    title: '精确局部编辑', 
                    desc: '只修改指定区域，其他部分保持原样' 
                  },
                  { 
                    title: '角色一致性', 
                    desc: '在多次编辑中保持角色特征不变' 
                  },
                  { 
                    title: '自然语言指令', 
                    desc: '用简单的文字描述实现复杂编辑' 
                  },
                  { 
                    title: '快速生成', 
                    desc: '6-12秒内完成高质量图像编辑' 
                  }
                ].map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-amber-200 font-medium">{feature.title}</h4>
                      <p className="text-amber-200/70 text-sm">{feature.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Example Categories */}
            <div className="atelier-card p-6">
              <h3 className="text-xl font-semibold text-amber-100 mb-4">
                应用示例
              </h3>
              <div className="grid gap-3">
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
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="atelier-card p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold text-amber-100 mb-4">
              立即体验 Flux Kontext Dev
            </h3>
            <p className="text-amber-200/80 mb-6">
              上传你的图片，用简单的文字描述你想要的修改，让AI为你实现精确的图像编辑
            </p>
            <motion.a
              href="#create"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-full font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
            >
              <Wand className="w-5 h-5" />
              开始创作
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}