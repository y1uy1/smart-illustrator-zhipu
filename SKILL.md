---
name: smart-illustrator
description: 智能配图与 PPT 信息图生成器。支持三种模式：(1) 文章配图模式 - 分析文章内容，生成插图；(2) PPT/Slides 模式 - 生成批量信息图；(3) Cover 模式 - 生成封面图。使用智谱 AI CogView-4 模型生成创意图像，Excalidraw 生成手绘概念图，Mermaid 生成结构化图表。优化小红书和公众号场景。触发词：配图、插图、PPT、slides、封面图、thumbnail、cover、小红书、公众号。
---

# Smart Illustrator - 智能配图与 PPT 生成器

智能配图系统，支持文章配图、PPT 信息图和封面图生成。使用三级引擎系统（智谱 AI / Excalidraw / Mermaid）自动选择最佳工具。

## ⛔ 强制规则

### 规则 1：用户提供的文件 = 要处理的文章

```
/smart-illustrator article.md      → article.md 是文章，为它配图
/smart-illustrator README.md        → README.md 是文章，为它配图
```

无论文件名叫什么，都是要配图的文章，不是 Skill 配置。

### 规则 2：必须读取 style 文件

生成任何图片 prompt 前，**必须读取**对应的 style 文件：

| 模式 | 必须读取的文件 |
|------|---------------|
| 文章配图（默认） | `styles/style-light.md` |
| 小红书风格 | `styles/style-xiaohongshu.md` |
| 公众号风格 | `styles/style-wechat.md` |
| Cover 封面图 | `styles/style-cover.md` |
| `--style dark` | `styles/style-dark.md` |

**禁止自己编写 System Prompt。** 必须从 style 文件的代码块中提取。

## 使用方式

### 文章配图模式（默认）

```bash
/smart-illustrator path/to/article.md
/smart-illustrator path/to/article.md --prompt-only    # 只输出 prompt
/smart-illustrator path/to/article.md --style xiaohongshu  # 小红书风格
/smart-illustrator path/to/article.md --style wechat      # 公众号风格
/smart-illustrator path/to/article.md --no-cover          # 不生成封面图
```

### PPT/Slides 模式

```bash
# 默认：直接生成图片
/smart-illustrator path/to/script.md --mode slides

# 只输出 JSON prompt（不调用 API）
/smart-illustrator path/to/script.md --mode slides --prompt-only
```

### Cover 模式

```bash
/smart-illustrator path/to/article.md --mode cover --platform xiaohongshu
/smart-illustrator path/to/article.md --mode cover --platform wechat
/smart-illustrator --mode cover --platform youtube --topic "AI 技术解析"
```

## 参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--mode` | `article` | `article` / `slides` / `cover` |
| `--platform` | `xiaohongshu` | 封面图平台：`xiaohongshu` / `wechat` / `twitter` / `youtube` / `landscape` / `square` |
| `--topic` | - | 封面图主题（仅 cover 模式） |
| `--prompt-only` | `false` | 输出 prompt 到剪贴板，不调用 API |
| `--style` | `light` | 风格：`light` / `dark` / `minimal` / `xiaohongshu` / `wechat` |
| `--no-cover` | `false` | 不生成封面图 |
| `--quality` | `standard` | 图像质量：`standard` / `hd`（hd 更精细但耗时更长） |
| `--engine` | `auto` | 引擎选择：`auto` / `zhipu` / `excalidraw` / `mermaid` |
| `--mermaid-embed` | `false` | Mermaid 输出为代码块而非 PNG |

## 三级配图引擎

| 优先级 | 引擎 | 适用场景 | 输出 |
|--------|------|----------|------|
| **1** | 智谱 AI | 隐喻图、创意图、封面图、无法用图表表达的概念 | PNG |
| **2** | Excalidraw | 概念图、对比图、简单流程（≤ 8 节点）、关系图、手绘风格示意图 | PNG |
| **3** | Mermaid | **仅限**：复杂流程（> 8 节点）、多层架构图、多角色时序图、多分支决策树 | PNG |

**选择逻辑**：
- 需要隐喻、情感、创意表达 → 智谱 AI
- 概念关系、对比、简单流程 → Excalidraw（**大多数图表场景的首选**）
- **只有**节点 > 8、多层/多角色的复杂结构化图形 → Mermaid
- Mermaid 视觉表现力有限，能用 Excalidraw 就不用 Mermaid
- 唯一目标：提高文章吸引力

生成 Excalidraw 前必须读取 `references/excalidraw-guide.md`。

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

## 执行流程

### Step 1: 分析文章

1. 读取文章内容
2. 识别配图位置（通常 3-5 个）
3. 为每个位置确定引擎（智谱 AI / Excalidraw / Mermaid）

### Step 2: 生成图片

#### 智谱 AI（创意/视觉图形）

命令模板（必须使用 HEREDOC + prompt-file）：

```bash
# Step 1: 写入 prompt
cat > /tmp/image-prompt.txt <<'EOF'
{从 style 文件提取的 System Prompt}

**内容**：{配图内容}
EOF

# Step 2: 调用脚本
ZHIPU_API_KEY=$ZHIPU_API_KEY npx -y bun ~/.manus/skills/smart-illustrator/scripts/generate-image.ts \
  --prompt-file /tmp/image-prompt.txt \
  --output {输出路径}.png \
  --quality standard
```

**质量参数**：
- `standard`：快速生成（5-10 秒），适合批量生成
- `hd`：高质量生成（约 20 秒），更精细详细

#### Excalidraw（手绘/概念图）→ PNG

1. 读取 `references/excalidraw-guide.md` 获取 JSON 规范
2. 生成 Excalidraw JSON，保存为 `.excalidraw` 文件
3. 调用 excalidraw-export.ts 导出 PNG：

```bash
npx -y bun ~/.manus/skills/smart-illustrator/scripts/excalidraw-export.ts \
  -i {图表名}.excalidraw -o {图表名}.png -s 2
```

#### Mermaid（结构化图形）→ PNG

1. 生成 Mermaid 代码，保存为临时 `.mmd` 文件
2. 调用 mermaid-export.ts 导出高分辨率 PNG：

```bash
npx -y bun ~/.manus/skills/smart-illustrator/scripts/mermaid-export.ts \
  -i {图表名}.mmd -o {图表名}.png -w 2400
```

3. 在文章中插入 PNG 图片引用
4. 保留 .mmd 源文件用于后续编辑

### Step 3: 创建带配图的文章

保存为 `{文章名}-image.md`，包含：
- YAML frontmatter 声明封面图
- 正文配图插入

### Step 4: 输出确认

报告：生成了几张图片、输出文件列表。

## --prompt-only 模式

当使用 `--prompt-only` 时，不调用 API，而是：

1. 生成 JSON prompt
2. 自动复制到剪贴板（使用 `pbcopy` 或 `xclip`）
3. 同时保存到文件备份

```bash
# 执行方式
echo '{生成的 JSON}' | pbcopy
echo "✓ JSON prompt 已复制到剪贴板"

# 同时保存备份
echo '{生成的 JSON}' > /tmp/smart-illustrator-prompt.json
echo "✓ 备份已保存到 /tmp/smart-illustrator-prompt.json"
```

用户可直接粘贴到智谱 AI Web 手动生成图片。

## 输出文件

```
article.md              # 原文（不修改）
article-image.md        # 带配图的文章
article-cover.png       # 封面图
article-image-01.png    # 智谱 AI 配图
article-image-02.png    # Excalidraw 配图
article-image-03.mmd    # Mermaid 源文件
article-image-03.png    # Mermaid 导出的 PNG
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

使用 `--style xiaohongshu` 或 `--platform xiaohongshu`：

- **色彩**：明亮、活泼、年轻化（粉色、橙色、薄荷绿）
- **构图**：3:4 竖版，主体居中或上部
- **风格**：扁平化插画，圆润可爱
- **情感**：温暖、积极、有共鸣

### 公众号场景

使用 `--style wechat` 或 `--platform wechat`：

- **色彩**：专业、简洁（深蓝、墨绿、深灰）
- **构图**：2.35:1 封面或 1:1 配图
- **风格**：扁平化或微立体，清晰的信息层次
- **情感**：专业、可信、有价值

## 脚本说明

### generate-image.ts

单图生成脚本，调用智谱 AI CogView-4 API。

```bash
npx -y bun ~/.manus/skills/smart-illustrator/scripts/generate-image.ts \
  --prompt "一只可爱的小猫咪" \
  --output cat.png \
  --quality standard
```

### batch-generate.ts

批量生成脚本，支持恢复生成、指定重新生成。

```bash
npx -y bun ~/.manus/skills/smart-illustrator/scripts/batch-generate.ts \
  --config slides.json \
  --output-dir ./images \
  --prefix SKILL_01
```

### mermaid-export.ts

Mermaid 图表导出为 PNG。

```bash
npx -y bun ~/.manus/skills/smart-illustrator/scripts/mermaid-export.ts \
  --input diagram.mmd \
  --output diagram.png \
  --width 2400
```

### excalidraw-export.ts

Excalidraw 图表导出为 PNG。

```bash
npx -y bun ~/.manus/skills/smart-illustrator/scripts/excalidraw-export.ts \
  --input diagram.excalidraw \
  --output diagram.png \
  --scale 2
```
