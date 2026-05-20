# Caveman 安装指南（全平台）

> Caveman — Prompt 注入压缩 AI 输出，节省最高 65% 输出 Token，保持技术准确度

---

## 前置条件

- Node.js >= 18
- 支持 30+ AI 编程工具

---

## 一、各平台安装

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex
```

### macOS / Linux / WSL (Git Bash)
```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
```

### 仅安装到指定 Agent
```bash
# 只给 Kilo Code 装
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash -s -- --only kilocode

# 只给 Claude Code 装
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash -s -- --only claude
```

---

## 二、Kilo Code 使用 Caveman

### 安装后激活

在 Kilo Code 对话中输入：

```
/caveman
```

### 压缩等级

| 命令 | 效果 |
|------|------|
| `/caveman lite` | 去掉填充词，保留正常语气 |
| `/caveman full` | 原始人风格（默认） |
| `/caveman ultra` | 电报体，极度精简 |
| `/caveman wenyan` | 文言文风格 |

### 停止压缩

说 `normal mode` 即可恢复。

---

## 三、效果示例

```
Before (normal Claude):
"Let me help you with that. Here's a detailed explanation of how to fix this bug..."

After (caveman full):
"bug found. line 42. fix: add null check. done."
```
→ 输出 Token 减少 ~65%，技术内容不丢失

---

## 四、支持的 AI 工具

| 工具 | 激活方式 |
|------|----------|
| **Kilo Code** | `/caveman` 命令 |
| Claude Code | 自动激活（flag 文件） |
| Codex | 自动激活（内置规则） |
| Gemini | 自动激活（内置扩展） |
| Cursor | 规则文件 |
| Windsurf | 规则文件 |
| Cline | 规则文件 |
| Copilot | 规则文件 |
| Junie | `/caveman` 命令 |
| Roo | `/caveman` 命令 |
| OpenClaw | SOUL.md 注入 |

完整支持矩阵：https://github.com/JuliusBrussee/caveman/blob/main/INSTALL.md

---

## 五、Caveman 生态

| 项目 | 功能 |
|------|------|
| caveman | 输出压缩（本体） |
| cavemem | 跨 Agent 记忆 |
| cavekit | 规格驱动构建 |
| cavegemma | Gemma 4 31B 微调模型 |

官网：https://getcaveman.dev/
