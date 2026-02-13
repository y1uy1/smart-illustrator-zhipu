#!/usr/bin/env bun

/**
 * 智谱 API 测试脚本
 * 用于验证 API Key 是否正确配置
 */

async function testZhipuAPI() {
  const apiKey = process.env.ZHIPU_API_KEY;

  console.log("🔍 检查智谱 API 配置...\n");

  // 检查 API Key
  if (!apiKey) {
    console.error("❌ 错误：未设置 ZHIPU_API_KEY 环境变量");
    console.log("\n请设置环境变量：");
    console.log("  export ZHIPU_API_KEY='your_api_key_here'");
    console.log("\n或在当前命令中设置：");
    console.log("  ZHIPU_API_KEY='your_api_key' bun scripts/test-api.ts");
    process.exit(1);
  }

  console.log(`✓ API Key 已设置: ${apiKey.substring(0, 20)}...`);
  console.log("\n🎨 测试图像生成 API...\n");

  try {
    const response = await fetch(
      "https://open.bigmodel.cn/api/paas/v4/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "cogview-4-250304",
          prompt: "一只可爱的小猫咪",
          quality: "standard",
        }),
      }
    );

    console.log(`响应状态: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("\n❌ API 请求失败:");
      console.error(errorText);
      process.exit(1);
    }

    const result = await response.json();
    console.log("\n✅ API 测试成功！");
    console.log(`\n生成的图像 URL: ${result.data[0].url}`);
    console.log("\n您的配置正确，可以开始使用了！");
  } catch (error) {
    console.error("\n❌ 测试失败:", error);
    process.exit(1);
  }
}

testZhipuAPI();
