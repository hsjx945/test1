import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      inputImage,
      aspectRatio = '1:1', 
      safetyTolerance = 2,
      outputFormat = 'png'
    } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: '请提供有效的编辑指令' },
        { status: 400 }
      );
    }

    if (!inputImage || typeof inputImage !== 'string') {
      return NextResponse.json(
        { success: false, error: '请提供有效的输入图像' },
        { status: 400 }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: '服务配置错误，请联系管理员' },
        { status: 500 }
      );
    }

    // Flux Kontext Pro 的输入参数
    const input = {
      prompt: prompt,
      input_image: inputImage,
      aspect_ratio: aspectRatio,
      safety_tolerance: Math.min(Math.max(safetyTolerance, 0), 6),
      output_format: outputFormat
    };

    console.log('Making request to Flux Kontext Dev with input:', input);

    const output = await replicate.run(
      "black-forest-labs/flux-kontext-dev",
      { input }
    );

    console.log('Flux Kontext Dev response:', output);

    if (!output) {
      return NextResponse.json(
        { success: false, error: '图像编辑失败，请重试' },
        { status: 500 }
      );
    }

    // 处理返回格式
    let imageUrl;
    
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else if (output && typeof output === 'object' && 'url' in output) {
      imageUrl = (output as { url: string }).url;
    } else {
      console.error('Unexpected output format:', output);
      return NextResponse.json(
        { success: false, error: '图像编辑失败，返回格式异常' },
        { status: 500 }
      );
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('Invalid image URL:', imageUrl);
      return NextResponse.json(
        { success: false, error: '图像编辑失败，未获取到有效URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      originalPrompt: prompt,
      originalImage: inputImage
    });

  } catch (error) {
    console.error('Image Edit API Error:', error);
    
    if (error instanceof Error) {
      // 检查认证错误
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { success: false, error: 'API Token 无效，请检查配置' },
          { status: 401 }
        );
      }
      
      // 检查模型限制错误
      if (error.message.includes('safety_tolerance')) {
        return NextResponse.json(
          { success: false, error: '安全等级设置错误，请使用0-6之间的值' },
          { status: 400 }
        );
      }

      // 检查输入图像错误
      if (error.message.includes('input_image')) {
        return NextResponse.json(
          { success: false, error: '输入图像格式不支持，请使用 JPEG, PNG, GIF 或 WebP 格式' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `编辑失败: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: '图像编辑服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Flux图像编辑API已就绪' },
    { status: 200 }
  );
}