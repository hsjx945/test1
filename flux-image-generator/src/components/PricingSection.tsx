'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap, Settings } from 'lucide-react';

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
    name: '免费体验版',
    price: '免费',
    description: '体验企业级AI创作',
    features: [
      '每日基础创作额度',
      '5种专业风格选择',
      '1080P高清输出',
      '个人作品保存'
    ],
    buttonText: '当前计划',
    buttonClass: 'w-full h-12 bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30 rounded-lg font-semibold transition-all duration-300'
  },
  {
    name: '专业创作版',
    price: '¥29/月',
    description: '无限商业创作权限',
    features: [
      '无限量企业级创作',
      '20+专业风格模板',
      '4K超高清商用输出',
      '优先处理（速度10倍）',
      '高级编辑工具套件',
      '商业授权证书'
    ],
    buttonText: '立即升级解锁',
    buttonClass: 'w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-semibold transition-all duration-300',
    popular: true
  },
  {
    name: '企业合作版',
    price: '¥99/月',
    description: '团队协作加速API',
    features: [
      '专业版全部权限',
      '10个团队成员账户',
      '企业级作品云库',
      '开发者API接口',
      '7x24专属技术支持'
    ],
    buttonText: '联系销售',
    buttonClass: 'w-full h-12 bg-purple-500/20 text-purple-200 border border-purple-500/30 hover:bg-purple-500/30 rounded-lg font-semibold transition-all duration-300'
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
            专业版本升级
          </h2>
          <p className="text-xl text-amber-200/80 max-w-3xl mx-auto leading-relaxed">
            选择专业版本，解锁全部企业级功能，提升创作效率200%
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`atelier-card p-8 text-center relative flex flex-col ${
                plan.popular ? 'border-2 border-amber-500/50' : ''
              }`}
              style={{ 
                minHeight: '500px',
                paddingTop: plan.popular ? '3rem' : '2rem', // 为推荐标签留出更多空间
                marginTop: plan.popular ? '1rem' : '0' // 为推荐标签留出顶部空间
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-[100]">
                  <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black px-6 py-2 rounded-full text-sm font-bold shadow-xl border-2 border-amber-300 relative z-[100]">
                    ⭐ 推荐 ⭐
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-amber-100 mb-3">{plan.name}</h3>
                <div className="text-4xl font-bold text-amber-400 mb-3">
                  {plan.price.includes('¥') ? (
                    <>
                      {plan.price.split('/')[0]}
                      <span className="text-lg text-amber-200/70">/{plan.price.split('/')[1]}</span>
                    </>
                  ) : (
                    plan.price
                  )}
                </div>
                <p className="text-amber-200/70 text-sm">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-left flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <span className="text-amber-200/80 text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={plan.buttonClass}
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