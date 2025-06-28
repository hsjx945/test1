# Flux 图像生成器

一个基于 Flux 模型的 AI 图像生成网站，用户输入文字描述，系统调用 Replicate 平台的 Flux 模型生成图片。

## 功能特性

- 🎨 **AI 图像生成** - 基于 Flux 模型的高质量图像生成
- 📱 **响应式设计** - 完美支持移动端和桌面端
- 🔢 **使用限制** - 每日 10 次免费使用限制
- 📚 **历史记录** - 本地保存生成历史，支持查看和下载
- ⬇️ **图片下载** - 支持直接下载生成的图片
- 🌙 **深色主题** - 现代科技感的深色界面

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **AI 服务**: Replicate Flux 模型
- **存储**: 浏览器 localStorage
- **部署**: 支持 Vercel 一键部署

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制环境变量模板：

```bash
cp .env.example .env.local
```

在 `.env.local` 中配置你的 Replicate API Token：

```env
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

获取 API Token：
1. 访问 [Replicate](https://replicate.com)
2. 注册并登录账户
3. 前往 [API Tokens](https://replicate.com/account/api-tokens) 页面
4. 创建新的 API Token
5. 将 Token 复制到 `.env.local` 文件中

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署

### Vercel 部署

1. 推送代码到 GitHub 仓库
2. 连接 Vercel 账户到 GitHub
3. 导入项目到 Vercel
4. 在 Vercel 项目设置中添加环境变量：
   - `REPLICATE_API_TOKEN`: 你的 Replicate API Token
5. 部署完成

## 使用说明

### 生成图像

1. 在输入框中描述你想要生成的图像
2. 点击"生成图像"按钮
3. 等待 20-40 秒，AI 会生成图像
4. 生成成功后可以查看和下载图像

### 历史记录

- 所有生成的图像会保存在本地历史记录中
- 点击历史记录中的缩略图可以查看大图
- 支持直接从历史记录下载图像
- 可以清空所有历史记录

### 使用限制

- 每天限制 10 次免费使用
- 使用次数在每天凌晨 0 点重置
- 达到限制后需要等到第二天才能继续使用

## 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `REPLICATE_API_TOKEN` | Replicate API Token | ✅ |

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 许可证

本项目仅供学习交流使用。
