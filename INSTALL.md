# 安装和配置指南

## 前置要求

### 1. 安装 Bun

Bun 是一个快速的 JavaScript 运行时，用于运行 TypeScript 脚本。

**macOS / Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

安装完成后，重启终端并验证：
```bash
bun --version
```

### 2. 获取智谱 AI API Key

1. 访问 https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入控制台，创建 API Key
4. 复制 API Key（格式类似：`xxxxxxxx.xxxxxxxxxxxxxxxx`）

## 安装步骤

### 方法 1：从 GitHub 克隆（推荐）

```bash
# 克隆仓库
git clone https://github.com/y1uy1/smart-illustrator-zhipu.git

# 进入目录
cd smart-illustrator-zhipu
```

### 方法 2：下载 ZIP

1. 访问 https://github.com/y1uy1/smart-illustrator-zhipu
2. 点击 "Code" -> "Download ZIP"
3. 解压到本地目录

## 配置 API Key

### 方法 1：设置环境变量（推荐）

**macOS / Linux (Bash/Zsh):**
```bash
# 临时设置（当前终端有效）
export ZHIPU_API_KEY="your_api_key_here"

# 永久设置（写入配置文件）
echo 'export ZHIPU_API_KEY="your_api_key_here"' >> ~/.bashrc
source ~/.bashrc

# 如果使用 Zsh
echo 'export ZHIPU_API_KEY="your_api_key_here"' >> ~/.zshrc
source ~/.zshrc
```

**Windows (PowerShell):**
```powershell
# 临时设置
$env:ZHIPU_API_KEY="your_api_key_here"

# 永久设置
[System.Environment]::SetEnvironmentVariable('ZHIPU_API_KEY', 'your_api_key_here', 'User')
```

### 方法 2：使用 .env 文件

在项目根目录创建 `.env` 文件：
```bash
ZHIPU_API_KEY=your_api_key_here
```

然后在运行脚本前加载：
```bash
source .env
bun scripts/generate-image.ts --prompt "测试" --output test.png
```

### 方法 3：命令行直接指定

```bash
ZHIPU_API_KEY="your_api_key" bun scripts/generate-image.ts --prompt "测试" --output test.png
```

## 测试配置

运行测试脚本验证配置：

```bash
bun scripts/test-api.ts
```

如果看到 "✅ API 测试成功！"，说明配置正确。

## 基础使用

### 生成单张图片

```bash
# 基础用法
bun scripts/generate-image.ts \
  --prompt "一只可爱的小猫咪" \
  --output cat.png

# 使用高质量模式
bun scripts/generate-image.ts \
  --prompt "一只可爱的小猫咪" \
  --output cat.png \
  --quality hd

# 从文件读取 prompt
cat > prompt.txt << 'EOF'
一只可爱的橙色小猫咪，坐在窗台上看着外面的风景。

风格：温馨、明亮、插画风格
色彩：柔和的橙色和米白色
构图：简洁、主体突出
EOF

bun scripts/generate-image.ts \
  --prompt-file prompt.txt \
  --output cat.png
```

### 批量生成图片

1. 创建配置文件 `config.json`：

```json
{
  "style": "温馨、明亮的插画风格",
  "pictures": [
    {
      "id": 1,
      "topic": "小猫咪",
      "content": "一只可爱的橙色小猫咪"
    },
    {
      "id": 2,
      "topic": "小狗狗",
      "content": "一只活泼的金毛犬"
    }
  ]
}
```

2. 运行批量生成：

```bash
bun scripts/batch-generate.ts \
  --config config.json \
  --output-dir ./images
```

## 在 Claude Code 中使用

如果您在 Claude Code（AI 编程助手）中使用：

1. **确保在项目根目录**：
   ```bash
   cd /path/to/smart-illustrator-zhipu
   ```

2. **设置环境变量**：
   在 Claude Code 终端中运行：
   ```bash
   export ZHIPU_API_KEY="your_api_key_here"
   ```

3. **运行测试**：
   ```bash
   bun scripts/test-api.ts
   ```

4. **生成图片**：
   ```bash
   bun scripts/generate-image.ts --prompt "测试图片" --output test.png
   ```

## 常见问题

### Q: 提示 "bun: command not found"

**解决方法**：
1. 确认 Bun 已安装：`curl -fsSL https://bun.sh/install | bash`
2. 重启终端
3. 检查 PATH：`echo $PATH` 应包含 `~/.bun/bin`

### Q: 提示 "未设置 ZHIPU_API_KEY"

**解决方法**：
1. 检查环境变量：`echo $ZHIPU_API_KEY`
2. 如果为空，重新设置：`export ZHIPU_API_KEY="your_api_key"`
3. 或使用命令行直接指定：`ZHIPU_API_KEY="your_api_key" bun scripts/...`

### Q: API 请求失败

**解决方法**：
1. 运行测试脚本：`bun scripts/test-api.ts`
2. 检查 API Key 是否正确
3. 检查网络连接
4. 查看错误信息中的具体原因

### Q: 在 Windows 上运行失败

**解决方法**：
1. 使用 PowerShell（不是 CMD）
2. 确保 Bun 已正确安装
3. 使用 PowerShell 语法设置环境变量

### Q: Claude Code 提示需要 JWT token

**解决方法**：
智谱 API 不需要 JWT token，直接使用 API Key 作为 Bearer token 即可。如果 Claude Code 尝试修改代码，请忽略或拒绝这些修改。

## 下一步

- 查看 [README.md](README.md) 了解功能特性
- 查看 [SKILL.md](SKILL.md) 了解详细使用方法
- 探索 `styles/` 目录中的不同风格
- 查看 `references/` 目录中的平台尺寸配置

## 获取帮助

- GitHub Issues: https://github.com/y1uy1/smart-illustrator-zhipu/issues
- 智谱 AI 文档: https://open.bigmodel.cn/dev/api
