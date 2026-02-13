#!/bin/bash

# Smart Illustrator 快速开始脚本

echo "🎨 Smart Illustrator 快速开始"
echo "================================"
echo ""

# 检查 Bun
if ! command -v bun &> /dev/null; then
    echo "❌ 未检测到 Bun"
    echo ""
    echo "请先安装 Bun:"
    echo "  curl -fsSL https://bun.sh/install | bash"
    echo ""
    exit 1
fi

echo "✓ Bun 已安装: $(bun --version)"
echo ""

# 检查 API Key
if [ -z "$ZHIPU_API_KEY" ]; then
    echo "❌ 未设置 ZHIPU_API_KEY 环境变量"
    echo ""
    echo "请设置 API Key:"
    echo "  export ZHIPU_API_KEY='your_api_key_here'"
    echo ""
    echo "或者在运行时指定:"
    echo "  ZHIPU_API_KEY='your_api_key' ./quickstart.sh"
    echo ""
    exit 1
fi

echo "✓ API Key 已设置"
echo ""

# 运行测试
echo "🔍 测试 API 连接..."
echo ""

bun scripts/test-api.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "================================"
    echo "✅ 配置成功！"
    echo ""
    echo "现在可以开始使用了："
    echo ""
    echo "生成单张图片："
    echo "  bun scripts/generate-image.ts --prompt '一只可爱的小猫咪' --output cat.png"
    echo ""
    echo "批量生成："
    echo "  bun scripts/batch-generate.ts --config config.json --output-dir ./images"
    echo ""
    echo "查看详细文档："
    echo "  cat INSTALL.md"
    echo "  cat SKILL.md"
    echo ""
else
    echo ""
    echo "❌ 测试失败，请检查配置"
    exit 1
fi
