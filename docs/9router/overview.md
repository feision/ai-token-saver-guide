# 9Router 简介

> 免费开源 AI 智能路由网关，内置 RTK Token Saver + 60+ AI 提供商 + 三层自动降级

## 是什么

9Router 是一个 AI 网关服务，夹在 AI 编程工具和各大 AI 提供商之间，提供智能路由、自动降级、格式翻译和 Token 压缩功能。

## 核心能力

### 智能三层自动降级
```
Tier 1 — 订阅层 (Subscription)
  Claude · Codex · Gemini · Copilot

Tier 2 — 低价层 (Cheap)
  GLM $0.60/1M · MiniMax $0.20/1M · Kimi ¥9/月

Tier 3 — 免费层 (FREE)
  Kiro · Qwen · OpenCode · iFlow（无限量）

配额度耗尽时自动切换，零停机
```

### 内置 RTK Token Saver
- 自动压缩 `tool_result` 内容再发给 LLM
- 节省 20-40% 输入 Token
- 默认开启，Dashboard → Endpoint Settings 可切换

### Smart Combos
- 将多个提供商链接为一个虚拟提供商
- 支持轮询和自动降级
- 配额度耗尽自动切换下一提供商

### Format Translator
- OpenAI ↔ Anthropic ↔ Gemini 格式互译
- 任何工具对接任何提供商

## 支持的服务类型

| 类型 | 提供商举例 |
|------|-----------|
| Chat/LLM | 60+ 提供商 |
| Embeddings | Voyage, Jina, OpenAI, Cohere |
| TTS | ElevenLabs, Deepgram, AWS Polly |
| STT | Deepgram, AssemblyAI, OpenAI Whisper |
| 图片生成 | Fal, Stability, BFL Flux |
| 视觉 | OpenAI, Gemini, Anthropic |
| 视频生成 | Runway ML, Topaz |
| 搜索 | Tavily, Brave, Perplexity |
| 网页抓取 | Tavily, Exa, Firecrawl, Jina |

## 默认地址

| 地址 | 用途 |
|------|------|
| `http://localhost:20128/dashboard` | 可视化管理面板 |
| `http://localhost:20128/v1` | OpenAI 兼容 API |

## 开源

MIT 协议，https://github.com/decolua/9router