# Smart Illustrator - 智能配图与 PPT 生成器

智能配图系统，专为小红书和公众号优化。支持文章配图、PPT 信息图和封面图生成。

## 特性

- **三种工作模式**：文章配图、PPT/Slides、封面图
- **三级引擎系统**：智谱 AI（创意图）、Excalidraw（手绘图）、Mermaid（结构图）
- **平台优化**：小红书、公众号、Twitter、YouTube 等
- **智能位置检测**：自动分析文章结构，识别最佳配图位置
- **可扩展样式**：内置多种风格，支持自定义

## 快速开始

### 安装

克隆仓库到本地：

```bash
git clone https://github.com/y1uy1/smart-illustrator-zhipu.git
cd smart-illustrator-zhipu
```

### 配置

设置智谱 AI API Key：

```bash
export ZHIPU_API_KEY="your_api_key_here"
```

获取 API Key：https://open.bigmodel.cn/

### 基础使用

```bash
# 文章配图（小红书风格）
bun scripts/generate-image.ts --prompt "一只可爱的小猫咪" --output cat.png

# 批量生成
bun scripts/batch-generate.ts --config config.json --output-dir ./images

# Mermaid 导出
bun scripts/mermaid-export.ts --input diagram.mmd --output diagram.png

# Excalidraw 导出
bun scripts/excalidraw-export.ts --input diagram.excalidraw --output diagram.png
```

## 平台支持

| 平台 | 代码 | 尺寸 | 宽高比 |
|------|------|------|--------|
| 小红书 | `xiaohongshu` | 1080×1440 | 3:4 |
| 公众号封面 | `wechat` | 900×383 | 2.35:1 |
| 公众号配图 | `wechat-square` | 900×900 | 1:1 |
| Twitter | `twitter` | 1200×628 | 1.91:1 |
| YouTube | `youtube` | 1920×1080 | 16:9 |

## 样式

- **light**：浅色风格（默认）
- **dark**：深色科技风格
- **minimal**：极简风格
- **xiaohongshu**：小红书风格（明亮、年轻化）
- **wechat**：公众号风格（专业、简洁）
- **cover**：封面图风格

## 依赖

- **Bun**：脚本运行时
- **Mermaid CLI**：`npm install -g @mermaid-js/mermaid-cli`
- **智谱 AI API**：图像生成

可选依赖（Excalidraw 导出）：
```bash
cd scripts
npm install
npx playwright install firefox
```

## 成本

- 智谱 CogView-4：¥0.06 每次生成
- Excalidraw：免费（本地渲染）
- Mermaid：免费（本地渲染）

## 文档

详细使用说明请查看 `SKILL.md`。

## 许可证

MIT License

## 致谢

本项目基于 [axtonliu/smart-illustrator](https://github.com/axtonliu/smart-illustrator) 改编，主要调整：

- 将 Gemini API 替换为智谱 AI CogView-4
- 优化小红书和公众号场景
- 添加平台尺寸配置
- 新增小红书和公众号专用样式
