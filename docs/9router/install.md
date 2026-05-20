# 9Router 安装指南（全平台）

> 9Router — 免费开源 AI 智能路由网关，内置 RTK Token Saver + 60+ AI 提供商 + 三层自动降级

---

## 前置条件

- Node.js >= 20
- npm

---

## 一、安装方式

### 方式 A：npm 全局安装（最推荐）

```bash
npm install -g 9router
9router
```

浏览器自动打开 `http://localhost:20128/dashboard`，首次登录密码默认 `123456`。

### 方式 B：源码运行

```bash
git clone https://github.com/decolua/9router.git
cd 9router
cp .env.example .env
npm install
PORT=20128 NEXT_PUBLIC_BASE_URL=http://localhost:20128 npm run dev
```

### 方式 C：Docker

```bash
docker run -d \
  --name 9router \
  -p 20128:20128 \
  -v "$HOME/.9router:/app/data" \
  -e DATA_DIR=/app/data \
  decolua/9router:latest
```

### 方式 D：VPS/云服务器（PM2 守护）

```bash
git clone https://github.com/decolua/9router.git
cd 9router
npm install && npm run build
npm install -g pm2
pm2 start npm --name 9router -- start
pm2 save && pm2 startup
```

---

## 二、核心功能

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

### Format Translator

- OpenAI ↔ Anthropic ↔ Gemini 格式互译
- 任何工具对接任何提供商

### 支持的 9 种服务

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

---

## 三、Kilo Code 接入

在 Kilo Code 的 API 配置中，将地址指向：

```
http://localhost:20128/v1
```

API Key 留空即可（本地免认证），或在 9Router Dashboard 生成。

---

## 四、关键环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `20128` | 服务端口 |
| `INITIAL_PASSWORD` | `123456` | 首次登录密码 |
| `DATA_DIR` | `~/.9router` | 数据库位置 |
| `JWT_SECRET` | 自动生成 | JWT 签名密钥 |

完整列表见 [9Router GitHub](https://github.com/decolua/9router)

---

## 五、默认地址

| 地址 | 用途 |
|------|------|
| `http://localhost:20128/dashboard` | 可视化管理面板 |
| `http://localhost:20128/v1` | OpenAI 兼容 API |

---

## 六、Token 节省效果

```
无 9Router:     47K tokens → LLM
9Router RTK:    28K tokens → LLM  (节省 40%)
+ RTK CLI:      9.4K tokens → LLM (再省 67%)
+ Caveman:      输出再省 65%
──────────────────────────────────
总节省可达 85-95%
```

---

## 七、免费 $0 成本路径

```
9Router + RTK Token Saver + Kiro AI (免费) + OpenCode Free (免费)
= $0 路由成本 + Token 自动压缩
```

你只需为自己订阅的 AI 提供商付费，9Router 本身永久免费（MIT 开源）。
