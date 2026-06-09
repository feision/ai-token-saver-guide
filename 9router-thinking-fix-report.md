# 9Router Thinking 标签修复报告

> 修复日期：2026-05-22
> 项目路径：`C:\Users\Administrator\Documents\Codex\9Router-Source`

---

## 修复结果

| Provider | 修复前 | 修复后 |
|----------|--------|--------|
| **DeepSeek** (openai → claude) | 双重 thinking + JSON 解析报错 + `ResponseAborted` | 正常显示一次 ✅ |
| **MiniMax** (openai → openai-responses) | 完全不显示 thinking | 正常显示 ✅ |

---

## 修复作用范围

本次修复针对的是 **9Router 的翻译器架构**，不是某个特定模型。

### Bug 1（stream.js 手动 thinking 输出）影响范围

所有经过 Translate 模式的 provider 都受影响——手动 `controller.enqueue` 会在翻译器之前输出畸形 thinking chunk，导致双重显示或 JSON 解析错误。删除手动输出后，所有格式（Claude / OpenAI / Gemini）的 thinking 都由翻译器统一处理。

### Bug 2（openai-responses.js reasoning 丢弃）影响范围

修复的是 `openaiResponsesToOpenAIResponse` 翻译器，影响所有走 **`openai-compatible-responses` provider 类型**的模型：

| Provider 类型 | 格式 | 是否受 Bug 2 修复影响 |
|--------------|------|:---:|
| `openai-compatible-responses` | OpenAI Responses API | ✅ **受影响** |
| `openai-compatible` | OpenAI Chat Completions | ❌ 走不同翻译路径 |
| `anthropic-compatible` | Claude API | ❌ 走不同翻译路径 |

**结论**：凡是配置为 `openai-compatible-responses` 类型的 provider（包括但不限于 MiniMax），其 thinking 都会被正确转换。未来新增的 Responses API 模型（如 OpenAI o3/o4-mini）也会自动受益。

---

## 根因分析

### Bug 1：DeepSeek 双重 thinking + JSON 解析错误

**文件**：`open-sse/utils/stream.js`

**根因**：Translate 模式里手动拦截 thinking 并通过 `controller.enqueue` 输出 `<thinking>` 标签，但翻译器也会处理同一个 chunk 的 thinking。两路输出叠加：

```
原始 chunk: { reasoning_content: "The" }
    ↓
手动拦截: controller.enqueue(<thinking>The</thinking>)  ← 畸形 JSON，缺少 id/object/created 字段
    ↓
翻译器: reasoning_content → thinking_delta              ← 格式正确
    ↓
结果: 双重显示 + 畸形 JSON 导致解析报错
```

**另外**：Passthrough 模式的 `pendingThinkingTag` 逻辑也有问题——`reasoning_content` 已被原封不动转发，finish chunk 时又注入一次到 `content`，导致双重显示。

### Bug 2：MiniMax 完全没有 thinking

**文件**：`open-sse/translator/response/openai-responses.js` 第 572-575 行

**根因**：`openaiResponsesToOpenAIResponse` 翻译器对 `response.reasoning_summary_text.delta` 事件直接 `return null`，MiniMax 的所有 thinking 数据被静默丢弃：

```javascript
// 原始代码 — 直接丢弃所有 reasoning！
if (eventType === "response.reasoning_summary_text.delta") {
  return null;  // ← 罪魁祸首
}
```

MiniMax 使用 `openai-compatible-responses` provider，格式为 `openai → openai-responses`，翻译链路需要经过 `openaiResponsesToOpenAIResponse`，而该函数把 reasoning 事件全部丢弃了。

---

## 修复内容

### 修改 1：`open-sse/utils/stream.js` — 删除手动 thinking 输出

**改动 1a**：删除 `pendingThinkingTag` 变量

```diff
- let pendingThinkingTag = null;
```

**改动 1b**：Passthrough 模式 — 只累积，不注入

```diff
  if (reasoning && typeof reasoning === "string") {
    totalContentLength += reasoning.length;
    accumulatedThinking += reasoning;
-   pendingThinkingTag = `<thinking>\n${reasoning}\n</thinking>\n`;
  }
```

**改动 1c**：Passthrough 模式 — 删除 finish chunk 时的 thinking 注入

```diff
  const isFinishChunk = parsed.choices?.[0]?.finish_reason;
- if (isFinishChunk) {
-   if (pendingThinkingTag && delta) {
-     if (content && content.startsWith('<thinking>')) {
-       delta.content = content;
-     } else if (content) {
-       delta.content = pendingThinkingTag + content;
-     } else {
-       delta.content = pendingThinkingTag;
-     }
-     pendingThinkingTag = null;
-   }
- }
  if (isFinishChunk && !hasValidUsage(parsed.usage)) {
```

**改动 1d**：Translate 模式 — 删除手动 `controller.enqueue` 输出（Claude 格式）

```diff
  if (parsed.delta?.thinking) {
    totalContentLength += parsed.delta.thinking.length;
    accumulatedThinking += parsed.delta.thinking;
-   const thinkingContent = parsed.delta.thinking;
-   if (thinkingContent) {
-     const thinkingTag = `<thinking>\n${thinkingContent}\n</thinking>\n`;
-     const output = `data: ${JSON.stringify({ choices: [{ delta: { content: thinkingTag }, index: 0 }] })}\n`;
-     reqLogger?.appendConvertedChunk?.(output);
-     controller.enqueue(sharedEncoder.encode(output));
-   }
  }
```

**改动 1e**：Translate 模式 — 同上（OpenAI reasoning_content 格式）

```diff
  if (parsed.choices?.[0]?.delta?.reasoning_content) {
    totalContentLength += parsed.choices[0].delta.reasoning_content.length;
    accumulatedThinking += parsed.choices[0].delta.reasoning_content;
-   const thinkingContent = parsed.choices[0].delta.reasoning_content;
-   if (thinkingContent) {
-     const thinkingTag = `<thinking>\n${thinkingContent}\n</thinking>\n`;
-     const output = `data: ${JSON.stringify({ choices: [{ delta: { content: thinkingTag }, index: 0 }] })}\n`;
-     reqLogger?.appendConvertedChunk?.(output);
-     controller.enqueue(sharedEncoder.encode(output));
-   }
  }
```

**改动 1f**：Translate 模式 — 同上（Gemini thought 格式）

```diff
  if (part.thought === true) {
    accumulatedThinking += part.text;
-   const thoughtContent = part.text;
-   if (thoughtContent) {
-     const thinkingTag = `<thinking>\n${thoughtContent}\n</thinking>\n`;
-     const output = `data: ${JSON.stringify({ choices: [{ delta: { content: thinkingTag }, index: 0 }] })}\n`;
-     reqLogger?.appendConvertedChunk?.(output);
-     controller.enqueue(sharedEncoder.encode(output));
-   }
  } else {
```

### 修改 2：`open-sse/translator/response/openai-responses.js` — 修复 reasoning 事件丢弃

将 `return null` 替换为正确的格式转换：

```diff
- // Reasoning events (convert to content or skip)
  if (eventType === "response.reasoning_summary_text.delta") {
-   // Optionally include reasoning as content, or skip
-   return null;
+   const delta = data.delta || "";
+   if (!delta) return null;
+   return {
+     id: state.chatId,
+     object: "chat.completion.chunk",
+     created: state.created,
+     model: state.model || "unknown",
+     choices: [{
+       index: 0,
+       delta: { reasoning_content: delta },
+       finish_reason: null
+     }]
+   };
+ }
+
+ // Reasoning item started → track for proper state
+ if (eventType === "response.output_item.added" && data.item?.type === "reasoning") {
+   state.reasoningStarted = true;
+   return null;
+ }
+
+ // Reasoning done events → ignore (content already sent via deltas)
+ if (eventType && eventType.startsWith("response.reasoning_summary_") && eventType.endsWith(".done")) {
+   return null;
  }
```

---

## 修复后的翻译链路

### DeepSeek（openai → claude）

```
Provider 返回 Claude 格式 SSE:
  event: content_block_delta
  data: {"type":"content_block_delta","delta":{"type":"thinking_delta","thinking":"The"}}
      ↓
Translate 模式: 只累积 accumulatedThinking，不输出
      ↓
翻译器 claude-to-openai:
  thinking_delta → reasoning_content
      ↓
翻译器 openai-to-claude:
  reasoning_content → thinking_delta
      ↓
客户端收到 Claude 格式: thinking_delta ✅
```

### MiniMax（openai → openai-responses）

```
Provider 返回 Responses API 格式 SSE:
  event: response.reasoning_summary_text.delta
  data: {"type":"response.reasoning_summary_text.delta","delta":"The user..."}
      ↓
Translate 模式: 只累积 accumulatedThinking，不输出
      ↓
翻译器 openai-responses → openai:
  reasoning_summary_text.delta → reasoning_content  ← 本次修复
      ↓
sourceFormat=openai: 直接透传
      ↓
客户端收到: {"choices":[{"delta":{"reasoning_content":"The user..."}}]}  ✅
```

---

## 翻译器 thinking 覆盖矩阵

| 翻译路径 | thinking 处理 | 状态 |
|----------|-------------|------|
| claude → openai | `thinking_delta` → `reasoning_content` | ✅ 原有 |
| openai → claude | `reasoning_content` → `thinking_delta` | ✅ 原有 |
| openai → openai-responses | `reasoning_content` → `reasoning_summary_text.delta` | ✅ 原有 |
| **openai-responses → openai** | **`reasoning_summary_text.delta` → `reasoning_content`** | ✅ **本次修复** |
| gemini → openai | `thought:true` → `reasoning_content` | ✅ 原有 |

---

## 修改的文件清单

| 文件 | 改动 |
|------|------|
| `open-sse/utils/stream.js` | 删除 `pendingThinkingTag` 变量和所有使用；删除 Translate 模式手动 thinking 输出 |
| `open-sse/translator/response/openai-responses.js` | `reasoning_summary_text.delta` 从 `return null` 改为转换为 `reasoning_content` |

---

## 重装系统恢复步骤

1. 从源码拉取最新版本
2. 确认以上两个文件包含修复（`stream.js` 无 `pendingThinkingTag`，`openai-responses.js` 有 `reasoning_content` 转换）
3. `pnpm install && pnpm dev`
4. 测试：分别用 DeepSeek 和 MiniMax 发一条消息，确认 thinking 正常显示

---

## 注意事项

- **不要**在 `stream.js` 的 Translate 模式 hook 中用 `controller.enqueue` 手动输出 thinking——翻译器已经处理，手动输出会导致双重显示或格式错误
- **不要**在 `openaiResponsesToOpenAIResponse` 中对 reasoning 事件 `return null`——这会丢弃所有 thinking 数据
- `accumulatedThinking` 累积逻辑**必须保留**——用于 `onStreamComplete` 回调和 usage 估算
- Passthrough 模式下 `reasoning_content` 字段会自然通过，不需要任何额外处理
