#!/usr/bin/env bun

/**
 * 智谱 CogView 图像生成脚本
 * 使用智谱 AI CogView-4 模型从文本提示生成图像
 */

import { parseArgs } from "util";
import { readFileSync, writeFileSync } from "fs";

interface ZhipuImageResponse {
  created: number;
  data: Array<{
    url: string;
  }>;
}

interface GenerateOptions {
  prompt?: string;
  promptFile?: string;
  output: string;
  model: string;
  quality: "hd" | "standard";
  size?: string;
}

async function generateImage(options: GenerateOptions): Promise<void> {
  const apiKey = process.env.ZHIPU_API_KEY;
  
  if (!apiKey) {
    console.error("错误：未设置 ZHIPU_API_KEY 环境变量");
    process.exit(1);
  }

  // 获取 prompt
  let prompt: string;
  if (options.promptFile) {
    prompt = readFileSync(options.promptFile, "utf-8");
  } else if (options.prompt) {
    prompt = options.prompt;
  } else {
    console.error("错误：必须提供 --prompt 或 --prompt-file 参数");
    process.exit(1);
  }

  console.log(`🎨 正在生成图像...`);
  console.log(`模型: ${options.model}`);
  console.log(`质量: ${options.quality}`);
  if (options.size) {
    console.log(`尺寸: ${options.size}`);
  }

  try {
    // 构建请求体
    const requestBody: any = {
      model: options.model,
      prompt: prompt,
      quality: options.quality,
    };

    // 如果指定了尺寸且使用 cogview-3-plus 模型
    if (options.size && options.model.includes("cogview-3")) {
      requestBody.size = options.size;
    }

    // 调用智谱 API
    const response = await fetch(
      "https://open.bigmodel.cn/api/paas/v4/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败: ${response.status} ${errorText}`);
    }

    const result: ZhipuImageResponse = await response.json();

    if (!result.data || result.data.length === 0) {
      throw new Error("API 返回的数据为空");
    }

    const imageUrl = result.data[0].url;
    console.log(`✓ 图像生成成功: ${imageUrl}`);

    // 下载图像
    console.log(`📥 正在下载图像到: ${options.output}`);
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`图像下载失败: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    writeFileSync(options.output, Buffer.from(imageBuffer));

    console.log(`✅ 图像已保存到: ${options.output}`);
  } catch (error) {
    console.error(`❌ 生成图像失败:`, error);
    process.exit(1);
  }
}

// 解析命令行参数
const { values } = parseArgs({
  options: {
    prompt: {
      type: "string",
      short: "p",
    },
    "prompt-file": {
      type: "string",
      short: "f",
    },
    output: {
      type: "string",
      short: "o",
      default: "generated.png",
    },
    model: {
      type: "string",
      short: "m",
      default: "cogview-4-250304",
    },
    quality: {
      type: "string",
      short: "q",
      default: "standard",
    },
    size: {
      type: "string",
      short: "s",
    },
  },
  strict: true,
  allowPositionals: false,
});

// 验证 quality 参数
if (values.quality && !["hd", "standard"].includes(values.quality)) {
  console.error("错误：quality 必须是 'hd' 或 'standard'");
  process.exit(1);
}

// 执行生成
generateImage({
  prompt: values.prompt,
  promptFile: values["prompt-file"],
  output: values.output!,
  model: values.model!,
  quality: values.quality as "hd" | "standard",
  size: values.size,
});
