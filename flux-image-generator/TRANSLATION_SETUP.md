# 翻译功能配置指南

## 当前状态
✅ 基础翻译功能已实现（使用本地词典）
✅ Google Translate API 集成已准备就绪
⚠️ 需要配置 Google API Key 以启用高质量翻译

## 翻译方式对比

### 1. 本地词典翻译（当前使用）
- **优点**：免费、快速、无网络依赖
- **缺点**：词汇库有限（约118个词汇）
- **适用场景**：基础图像生成描述

### 2. Google Translate API（推荐）
- **优点**：翻译质量高、支持复杂语法、词汇丰富
- **缺点**：需要API Key配置
- **免费额度**：每月100万字符
- **费用**：超出后$20/百万字符

## 如何启用 Google Translate API

### 步骤1：创建 Google Cloud 项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击"新建项目"
3. 输入项目名称（如：flux-translator）
4. 点击"创建"

### 步骤2：启用 Translation API
1. 在项目仪表板中，点击"启用API和服务"
2. 搜索"Cloud Translation API"
3. 点击"启用"

### 步骤3：创建 API Key
1. 转到"凭据"页面
2. 点击"创建凭据" > "API密钥"
3. 复制生成的API密钥

### 步骤4：配置环境变量
1. 打开 `.env.local` 文件
2. 添加以下行：
```env
GOOGLE_TRANSLATE_API_KEY=你的API密钥
```

### 步骤5：重启服务器
```bash
npm run dev
```

## 测试翻译功能

### 使用 curl 测试
```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "一个美丽的女孩在花园里"}'
```

### 预期返回结果
```json
{
  "translatedText": "A beautiful girl in the garden",
  "isTranslated": true,
  "originalText": "一个美丽的女孩在花园里",
  "method": "google"
}
```

## 故障排除

### 如果翻译质量不好
- 确认 `method` 字段是否为 `"google"`
- 如果是 `"dictionary"`，说明API Key未正确配置

### 如果出现API错误
- 检查API Key是否正确
- 确认Translation API已启用
- 检查Google Cloud项目是否有足够配额

### 如果完全无法翻译
- 系统会自动回退到本地词典翻译
- 检查控制台日志了解具体错误信息

## 成本控制

### 免费额度
- Google提供每月100万字符免费额度
- 对于个人使用完全够用

### 监控使用量
1. 在Google Cloud Console查看API使用情况
2. 设置预算提醒
3. 考虑设置使用配额限制

## 安全建议

1. **不要在代码中硬编码API Key**
2. **使用环境变量存储敏感信息**
3. **定期轮换API Key**
4. **为API Key设置适当的使用限制**

---

**注意**：即使不配置Google API，系统仍会使用本地词典提供基础翻译功能。