import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flux AI - 免费AI图像生成器",
  description: "在几秒钟内创建令人惊叹的AI生成图像。100%免费，无需登录，由Flux.1 Dev提供支持。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
