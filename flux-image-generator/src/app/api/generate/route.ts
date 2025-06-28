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
      guidance = 2.5,
      numInferenceSteps = 28,
      outputQuality = 80,
      outputFormat = 'webp',
      goFast = true,
      seed,
      useKontext = false
    } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: '请提供有效的提示词' },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { success: false, error: '提示词长度不能超过1000个字符' },
        { status: 400 }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: '服务配置错误，请联系管理员' },
        { status: 500 }
      );
    }

    // Map aspect ratio to Flux Kontext format
    const aspectRatioMap: { [key: string]: string } = {
      '1:1': '1:1',
      '16:9': '16:9', 
      '9:16': '9:16',
      '4:3': '4:3',
      '3:4': '3:4',
      '21:9': '21:9',
      '2:3': '2:3',
      '3:2': '3:2'
    };

    const input: Record<string, unknown> = {
      prompt: prompt,
      aspect_ratio: inputImage ? "match_input_image" : (aspectRatioMap[aspectRatio] || "1:1"),
      guidance: parseFloat(guidance.toString()),
      num_inference_steps: parseInt(numInferenceSteps.toString()),
      output_format: outputFormat,
      output_quality: parseInt(outputQuality.toString()),
      go_fast: Boolean(goFast),
      ...(seed && { seed: parseInt(seed.toString()) })
    };

    // 如果有输入图像，添加到参数中（确保使用正确的参数名称）
    if (inputImage) {
      // Flux Kontext Dev 需要 input_image 参数
      input.input_image = inputImage;
      console.log('Added input_image to parameters, type:', typeof inputImage);
      console.log('Input image data length:', inputImage.length);
    }

    console.log('Making request to Replicate with input:', input);

    // 统一使用 flux-kontext-dev 模型，支持有无图像的两种情况
    const modelName = "black-forest-labs/flux-kontext-dev";

    console.log('Using model:', modelName);
    console.log('Has input image:', !!inputImage);
    console.log('Use Kontext flag:', useKontext);
    console.log('Final input params:', {
      ...input,
      input_image: inputImage ? '[base64 data]' : 'none'
    });

    const output = await replicate.run(modelName, { input });

    console.log('Replicate response:', output);
    console.log('Response type:', typeof output);
    console.log('Is array:', Array.isArray(output));

    // Flux-dev 返回的是数组格式
    if (!output) {
      return NextResponse.json(
        { success: false, error: '图像生成失败，请重试' },
        { status: 500 }
      );
    }

    // 处理不同的返回格式
    let imageUrl;
    
    if (Array.isArray(output)) {
      // 检查第一个元素是否是 ReadableStream
      const firstItem = output[0];
      console.log('First item details:', {
        type: typeof firstItem,
        constructor: firstItem?.constructor?.name,
        isReadableStream: firstItem instanceof ReadableStream,
        toString: firstItem?.toString()
      });
      
      if (firstItem instanceof ReadableStream) {
        // 对于 ReadableStream，我们需要使用不同的方法
        console.log('Detected ReadableStream, converting...');
        
        try {
          // 方法1: 直接读取 stream
          const reader = firstItem.getReader();
          const chunks = [];
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          
          // 合并所有 chunks
          const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const result = new Uint8Array(totalLength);
          let offset = 0;
          
          for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
          }
          
          // 转换为 base64
          const base64 = Buffer.from(result).toString('base64');
          imageUrl = `data:image/png;base64,${base64}`;
          
          console.log('Successfully converted stream to base64, length:', base64.length);
          
        } catch (streamError) {
          console.error('Stream processing error:', streamError);
          return NextResponse.json(
            { success: false, error: '图像数据处理失败' },
            { status: 500 }
          );
        }
      } else if (typeof firstItem === 'string') {
        imageUrl = firstItem;
      } else {
        console.error('Unexpected first item:', firstItem);
        return NextResponse.json(
          { success: false, error: '未知的返回格式' },
          { status: 500 }
        );
      }
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else if (output instanceof ReadableStream) {
      // 处理直接返回 ReadableStream 的情况
      console.log('Detected direct ReadableStream, converting...');
      
      try {
        const reader = output.getReader();
        const chunks = [];
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        // 合并所有 chunks
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        
        // 转换为 base64
        const base64 = Buffer.from(result).toString('base64');
        imageUrl = `data:image/png;base64,${base64}`;
        
        console.log('Successfully converted direct stream to base64, length:', base64.length);
        
      } catch (streamError) {
        console.error('Direct stream processing error:', streamError);
        return NextResponse.json(
          { success: false, error: '图像数据处理失败' },
          { status: 500 }
        );
      }
    } else if (output && typeof output === 'object' && 'url' in output) {
      imageUrl = (output as { url: string }).url;
    } else {
      console.error('Unexpected output format:', {
        type: typeof output,
        constructor: output.constructor?.name,
        keys: Object.keys(output || {})
      });
      return NextResponse.json(
        { success: false, error: '图像生成失败，返回格式异常' },
        { status: 500 }
      );
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('Invalid image URL:', imageUrl);
      return NextResponse.json(
        { success: false, error: '图像生成失败，未获取到有效URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('API Error Details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof Error) {
      // 检查认证错误
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { success: false, error: 'API Token 无效，请检查配置' },
          { status: 401 }
        );
      }
      
      // 检查超时错误
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { success: false, error: '生成超时，请重试' },
          { status: 408 }
        );
      }
      
      // 检查配额错误
      if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('billing')) {
        return NextResponse.json(
          { success: false, error: 'API 配额不足，请检查 Replicate 账户余额' },
          { status: 429 }
        );
      }

      // 检查模型错误
      if (error.message.includes('model') || error.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: '模型不可用，请稍后重试' },
          { status: 503 }
        );
      }

      // 返回具体错误信息用于调试
      return NextResponse.json(
        { success: false, error: `生成失败: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: '生成服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Flux图像生成API已就绪' },
    { status: 200 }
  );
}