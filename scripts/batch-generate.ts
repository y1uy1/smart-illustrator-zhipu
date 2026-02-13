#!/usr/bin/env bun

/**
 * 智谱 CogView 批量图像生成脚本
 * 支持恢复生成、指定重新生成等功能
 */

import { parseArgs } from "util";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

interface PictureItem {
  id: number;
  topic: string;
  content: string;
}

interface BatchConfig {
  instruction?: string;
  batch_rules?: {
    total: number;
    one_item_one_image: boolean;
    aspect_ratio: string;
  };
  style: string;
  pictures: PictureItem[];
}

interface ZhipuImageResponse {
  created: number;
  data: Array<{
    url: string;
  }>;
}

interface BatchOptions {
  config: string;
  outputDir: string;
  model: string;
  quality: "hd" | "standard";
  delay: number;
  prefix?: string;
  regenerate?: string;
  force: boolean;
}

async function generateSingleImage(
  prompt: string,
  outputPath: string,
  model: string,
  quality: "hd" | "standard",
  apiKey: string
): Promise<void> {
  const requestBody = {
    model: model,
    prompt: prompt,
    quality: quality,
  };

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

  // 下载图像
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`图像下载失败: ${imageResponse.status}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  writeFileSync(outputPath, Buffer.from(imageBuffer));
}

async function batchGenerate(options: BatchOptions): Promise<void> {
  const apiKey = process.env.ZHIPU_API_KEY;

  if (!apiKey) {
    console.error("错误：未设置 ZHIPU_API_KEY 环境变量");
    process.exit(1);
  }

  // 读取配置文件
  if (!existsSync(options.config)) {
    console.error(`错误：配置文件不存在: ${options.config}`);
    process.exit(1);
  }

  const configContent = readFileSync(options.config, "utf-8");
  const config: BatchConfig = JSON.parse(configContent);

  // 确保输出目录存在
  if (!existsSync(options.outputDir)) {
    mkdirSync(options.outputDir, { recursive: true });
  }

  // 确定文件名前缀
  const prefix = options.prefix || config.pictures[0]?.topic || "image";

  // 解析需要重新生成的图片 ID
  const regenerateIds = new Set<number>();
  if (options.regenerate) {
    options.regenerate.split(",").forEach((id) => {
      regenerateIds.add(parseInt(id.trim()));
    });
  }

  console.log(`📦 批量生成配置:`);
  console.log(`   配置文件: ${options.config}`);
  console.log(`   输出目录: ${options.outputDir}`);
  console.log(`   图片总数: ${config.pictures.length}`);
  console.log(`   模型: ${options.model}`);
  console.log(`   质量: ${options.quality}`);
  console.log(`   延迟: ${options.delay}ms`);
  console.log("");

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const picture of config.pictures) {
    const outputFilename = `${prefix}-${String(picture.id).padStart(2, "0")}.png`;
    const outputPath = join(options.outputDir, outputFilename);

    // 检查是否需要跳过
    if (!options.force && existsSync(outputPath)) {
      if (regenerateIds.size === 0 || !regenerateIds.has(picture.id)) {
        console.log(`⏭️  跳过已存在的图片 ${picture.id}: ${outputFilename}`);
        skipCount++;
        continue;
      }
    }

    // 如果指定了重新生成的 ID，但当前图片不在列表中，则跳过
    if (regenerateIds.size > 0 && !regenerateIds.has(picture.id)) {
      console.log(`⏭️  跳过图片 ${picture.id}: ${outputFilename}`);
      skipCount++;
      continue;
    }

    console.log(`🎨 正在生成图片 ${picture.id}/${config.pictures.length}: ${picture.topic}`);

    try {
      // 构建完整的 prompt
      const fullPrompt = `${config.style}\n\n**主题**: ${picture.topic}\n\n**内容**: ${picture.content}`;

      await generateSingleImage(
        fullPrompt,
        outputPath,
        options.model,
        options.quality,
        apiKey
      );

      console.log(`✅ 图片 ${picture.id} 生成成功: ${outputPath}`);
      successCount++;

      // 延迟，避免请求过快
      if (picture.id < config.pictures.length) {
        console.log(`⏳ 等待 ${options.delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, options.delay));
      }
    } catch (error) {
      console.error(`❌ 图片 ${picture.id} 生成失败:`, error);
      failCount++;
    }
  }

  console.log("");
  console.log(`📊 批量生成完成:`);
  console.log(`   成功: ${successCount}`);
  console.log(`   跳过: ${skipCount}`);
  console.log(`   失败: ${failCount}`);
  console.log(`   总计: ${config.pictures.length}`);
}

// 解析命令行参数
const { values } = parseArgs({
  options: {
    config: {
      type: "string",
      short: "c",
    },
    "output-dir": {
      type: "string",
      short: "o",
      default: "./illustrations",
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
    delay: {
      type: "string",
      short: "d",
      default: "2000",
    },
    prefix: {
      type: "string",
      short: "p",
    },
    regenerate: {
      type: "string",
      short: "r",
    },
    force: {
      type: "boolean",
      short: "f",
      default: false,
    },
  },
  strict: true,
  allowPositionals: false,
});

// 验证必需参数
if (!values.config) {
  console.error("错误：必须提供 --config 参数");
  process.exit(1);
}

// 验证 quality 参数
if (values.quality && !["hd", "standard"].includes(values.quality)) {
  console.error("错误：quality 必须是 'hd' 或 'standard'");
  process.exit(1);
}

// 执行批量生成
batchGenerate({
  config: values.config!,
  outputDir: values["output-dir"]!,
  model: values.model!,
  quality: values.quality as "hd" | "standard",
  delay: parseInt(values.delay!),
  prefix: values.prefix,
  regenerate: values.regenerate,
  force: values.force!,
});
