# Smart Illustrator - 智能配图与 PPT 生成器

智能配图系统，支持文章配图、PPT 信息图和封面图生成。使用三级引擎系统（智谱 AI / Excalidraw / Mermaid）自动选择最佳工具。

## 核心功能

### 三种工作模式

1. **文章配图模式**：分析文章内容，生成插图
2. **PPT/Slides 模式**：生成批量信息图
3. **Cover 模式**：生成封面图

### 三级配图引擎

| 优先级 | 引擎 | 适用场景 | 输出 |
|--------|------|----------|------|
| **1** | 智谱 AI | 隐喻图、创意图、封面图、无法用图表表达的概念 | PNG |
| **2** | Excalidraw | 概念图、对比图、简单流程（≤ 8 节点）、关系图、手绘风格示意图 | PNG |
| **3** | Mermaid | **仅限**：复杂流程（> 8 节点）、多层架构图、多角色时序图、多分支决策树 | PNG |

## 使用方式

### 单图生成

```bash
# 基础用法
bun scripts/generate-image.ts \
  --prompt "一只可爱的小猫咪" \
  --output cat.png

# 使用 prompt 文件
cat > prompt.txt << 'EOF'
一只可爱的橙色小猫咪，坐在窗台上看着外面的风景。

风格：温馨、明亮、插画风格
色彩：柔和的橙色和米白色
构图：简洁、主体突出
EOF

bun scripts/generate-image.ts \
  --prompt-file prompt.txt \
  --output cat.png \
  --quality standard
```

### 批量生成

```bash
# 基础用法
bun scripts/batch-generate.ts \
  --config slides.json \
  --output-dir ./images

# 指定文件名前缀
bun scripts/batch-generate.ts \
  --config slides.json \
  --output-dir ./images \
  --prefix article

# 重新生成指定图片
bun scripts/batch-generate.ts \
  --config slides.json \
  --output-dir ./images \
  --regenerate "1,3,5"

# 强制重新生成所有图片
bun scripts/batch-generate.ts \
  --config slides.json \
  --output-dir ./images \
  --force
```

### Mermaid 导出

```bash
bun scripts/mermaid-export.ts \
  --input diagram.mmd \
  --output diagram.png \
  --width 2400
```

### Excalidraw 导出

```bash
bun scripts/excalidraw-export.ts \
  --input diagram.excalidraw \
  --output diagram.png \
  --scale 2
```

## 参数说明

### generate-image.ts

| 参数 | 简写 | 默认值 | 说明 |
|------|------|--------|------|
| `--prompt` | `-p` | - | 图像描述文本 |
| `--prompt-file` | `-f` | - | 图像描述文本文件路径 |
| `--output` | `-o` | `generated.png` | 输出文件路径 |
| `--model` | `-m` | `cogview-4-250304` | 模型名称 |
| `--quality` | `-q` | `standard` | 图像质量：`standard` / `hd` |

### batch-generate.ts

| 参数 | 简写 | 默认值 | 说明 |
|------|------|--------|------|
| `--config` | `-c` | - | 配置文件路径（必需） |
| `--output-dir` | `-o` | `./illustrations` | 输出目录 |
| `--model` | `-m` | `cogview-4-250304` | 模型名称 |
| `--quality` | `-q` | `standard` | 图像质量：`standard` / `hd` |
| `--delay` | `-d` | `2000` | 生成间隔（毫秒） |
| `--prefix` | `-p` | - | 文件名前缀 |
| `--regenerate` | `-r` | - | 重新生成的图片 ID（逗号分隔） |
| `--force` | `-f` | `false` | 强制重新生成所有图片 |

### mermaid-export.ts

| 参数 | 简写 | 默认值 | 说明 |
|------|------|--------|------|
| `--input` | `-i` | - | Mermaid 文件路径（必需） |
| `--output` | `-o` | - | 输出 PNG 文件路径（必需） |
| `--width` | `-w` | `2400` | 图片宽度 |

### excalidraw-export.ts

| 参数 | 简写 | 默认值 | 说明 |
|------|------|--------|------|
| `--input` | `-i` | - | Excalidraw 文件路径（必需） |
| `--output` | `-o` | - | 输出 PNG 文件路径（必需） |
| `--scale` | `-s` | `2` | 缩放比例 |

## 平台尺寸配置

详见 `references/platform-sizes.md`。

**快速参考**：

| 平台 | 代码 | 尺寸 | 宽高比 |
|------|------|------|--------|
| 小红书 | `xiaohongshu` | 1080×1440 | 3:4 |
| 公众号封面 | `wechat` | 900×383 | 2.35:1 |
| 公众号配图 | `wechat-square` | 900×900 | 1:1 |
| Twitter | `twitter` | 1200×628 | 1.91:1 |
| YouTube | `youtube` | 1920×1080 | 16:9 |

## 样式系统

样式文件位于 `styles/` 目录：

- `style-light.md`：浅色风格（默认）
- `style-dark.md`：深色科技风格
- `style-minimal.md`：极简风格
- `style-xiaohongshu.md`：小红书风格（明亮、年轻化）
- `style-wechat.md`：公众号风格（专业、简洁）
- `style-cover.md`：封面图风格

## 批量生成配置文件格式

```json
{
  "instruction": "可选的全局说明",
  "batch_rules": {
    "total": 5,
    "one_item_one_image": true,
    "aspect_ratio": "3:4"
  },
  "style": "从 style 文件提取的 System Prompt",
  "pictures": [
    {
      "id": 1,
      "topic": "图片主题",
      "content": "图片详细描述"
    },
    {
      "id": 2,
      "topic": "图片主题",
      "content": "图片详细描述"
    }
  ]
}
```

## 环境变量

```bash
export ZHIPU_API_KEY="your_api_key_here"
```

获取 API Key：https://open.bigmodel.cn/

## 成本

- 智谱 CogView-4：¥0.06 每次生成
- Excalidraw：免费（本地渲染）
- Mermaid：免费（本地渲染）

## 小红书和公众号优化

### 小红书场景

使用 `styles/style-xiaohongshu.md`：

- **色彩**：明亮、活泼、年轻化（粉色、橙色、薄荷绿）
- **构图**：3:4 竖版，主体居中或上部
- **风格**：扁平化插画，圆润可爱
- **情感**：温暖、积极、有共鸣

### 公众号场景

使用 `styles/style-wechat.md`：

- **色彩**：专业、简洁（深蓝、墨绿、深灰）
- **构图**：2.35:1 封面或 1:1 配图
- **风格**：扁平化或微立体，清晰的信息层次
- **情感**：专业、可信、有价值

## 输出文件示例

```
illustrations/
├── article-01.png      # 智谱 AI 配图
├── article-02.png      # Excalidraw 配图
├── article-03.mmd      # Mermaid 源文件
└── article-03.png      # Mermaid 导出的 PNG
```

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

## 许可证

MIT License
