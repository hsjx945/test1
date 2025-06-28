'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Zap, Settings } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonClass: string;
  popular?: boolean;
}

interface PricingSectionProps {
  plans?: PricingPlan[];
  onPlanSelect?: (planId: string) => void;
}

const defaultPlans: PricingPlan[] = [
  {
    name: '探索版',
    price: '免费',
    description: '体验AI艺术创作',
    features: [
      '每日10次创作额度',
      '基础艺术风格',
      '标准画质输出',
      '作品画廊保存'
    ],
    buttonText: '当前计划',
    buttonClass: 'bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30'
  },
  {
    name: '艺术家版',
    price: '¥29/月',
    description: '专业创作无限制',
    features: [
      '无限创作次数',
      '全部艺术风格',
      '4K超高清输出',
      '优先处理队列',
      '高级图像编辑',
      '商用授权'
    ],
    buttonText: '升级至专业版',
    buttonClass: 'maestro-button text-base py-4',
    popular: true
  },
  {
    name: '工作室版',
    price: '¥99/月',
    description: '团队协作创作',
    features: [
      '艺术家版全部功能',
      '5个团队成员',
      '团队作品库',
      'API接口调用',
      '专属技术支持'
    ],
    buttonText: '联系销售',
    buttonClass: 'bg-purple-500/20 text-purple-200 border border-purple-500/30 hover:bg-purple-500/30'
  }
];

export default function PricingSection({ 
  plans = defaultPlans, 
  onPlanSelect 
}: PricingSectionProps) {
  return (
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
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`atelier-card p-8 text-center relative ${
                plan.popular ? 'border-2 border-amber-500/50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black px-4 py-1 rounded-full text-sm font-bold">
                    推荐
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-amber-100 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-amber-400 mb-2">
                  {plan.price.includes('¥') ? (
                    <>
                      {plan.price.split('/')[0]}
                      <span className="text-lg text-amber-200/70">/{plan.price.split('/')[1]}</span>
                    </>
                  ) : (
                    plan.price
                  )}
                </div>
                <p className="text-amber-200/70">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-left">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                    <span className="text-amber-200/80">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${plan.buttonClass}`}
                onClick={() => onPlanSelect?.(plan.name)}
              >
                {plan.buttonText}
              </Button>
            </motion.div>
          ))}
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
  );
}