const Replicate = require('replicate');
require('dotenv').config({ path: '.env.local' });

async function testReplicate() {
  console.log('🔧 测试 Replicate API 配置...\n');
  
  // 检查 API Token
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.error('❌ 错误: 未找到 REPLICATE_API_TOKEN');
    console.log('请在 .env.local 文件中设置 REPLICATE_API_TOKEN');
    return;
  }
  
  console.log('✅ API Token 已配置');
  console.log('🔑 Token 前缀:', token.substring(0, 8) + '...');
  
  try {
    const replicate = new Replicate({
      auth: token,
    });
    
    console.log('\n🚀 开始测试图像生成...');
    console.log('📝 提示词: "a beautiful red cat"');
    
    const input = {
      prompt: "a beautiful red cat",
      aspect_ratio: "1:1",
      num_outputs: 1,
      guidance: 3.5,
      num_inference_steps: 28,
      megapixels: "1",
      output_format: "png",
      output_quality: 95,
      go_fast: true
    };
    
    console.log('⚙️  使用参数:', JSON.stringify(input, null, 2));
    
    const output = await replicate.run(
      "black-forest-labs/flux-dev",
      { input }
    );
    
    console.log('\n✅ 生成成功!');
    console.log('📦 输出类型:', typeof output);
    console.log('📊 输出内容:', output);
    
    if (Array.isArray(output) && output.length > 0) {
      console.log('🖼️  图片URL:', output[0]);
    } else if (typeof output === 'string') {
      console.log('🖼️  图片URL:', output);
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误信息:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n💡 解决方案:');
      console.log('1. 检查 API Token 是否正确');
      console.log('2. 访问 https://replicate.com/account/api-tokens 获取新Token');
      console.log('3. 确保 Token 格式为: r8_...');
    }
    
    if (error.message.includes('billing') || error.message.includes('quota')) {
      console.log('\n💡 解决方案:');
      console.log('1. 检查 Replicate 账户余额');
      console.log('2. 访问 https://replicate.com/account/billing 充值');
    }
  }
}

testReplicate();