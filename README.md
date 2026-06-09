# AI Token Saver Guide

> 一站式记录 RTK + Caveman + 9Router 的安装和配置，主推 KiloCode（OpenCode 衍生版）
>
> 每次 重装系统后，照着这个仓库走一遍，10 分钟恢复全量 AI Token 压缩环境。

---

## 三件套概览

| 工具 | 作用 | 压缩位置 | 节省效果 |
|------|------|----------|----------|
| **RTK** | CLI 代理，压缩命令输出 | 命令输出 → LLM | 输入 Token **-60~90%** |
| **Caveman** | Prompt 注入，压缩 AI 回复 | LLM 回复 → 用户 | 输出 Token **-65%** |
| **9Router** | 智能路由网关 + 内置压缩 | 请求入站 → 请求出站 | 输入 Token **-20~40%** + 自动降级 |

### 工具协同工作原理

```
┌─────────────────────────────────────────────────────────────────┐
│                         AI 编程工具                               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼ [1] RTK Plugin Hook 自动改写命令
┌─────────────────────────────────────────────────────────────────┐
│  git status → rtk git status → 200 tokens (原 2000 tokens)     │
└─────────────────────────────┬───────────────────────────────────┘
                              │ tool_result
                              ▼ [2] 9Router 路由 + 二次压缩
┌─────────────────────────────────────────────────────────────────┐
│  9Router 内置 RTK Token Saver → 150 tokens (原 200 tokens)     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼ LLM
                              │ LLM 回复
                              ▼ [3] Caveman 压缩回复
┌─────────────────────────────────────────────────────────────────┐
│  "文件已修改" (原 "我已经成功修改了 config.json 文件...")         │
└─────────────────────────────────────────────────────────────────┘
```

**叠加效果**：三者全开，Token 开销可降至原来的 **5-15%**。

---

## ⭐ KiloCode 用户必读

**唯一可靠方案**：使用 `@opencode-ai/plugin` 的 `tool.execute.before` Hook 自动改写命令。

| 方案 | 可靠性 | 适用模型 |
|------|:------:|----------|
| **Plugin Hook** | ✅ 100% | 所有模型 |
| 规则文件 / instructions | ❌ ~10% | 仅 Gemini |

👉 **[完整插件配置教程](docs/kilocode/rtk-plugin-tutorial.md)**

---

## 快速入口

| 我想... | 看这里 |
|---------|--------|
| ⭐ 为 KiloCode 配置 RTK 自动改写 | [docs/kilocode/rtk-plugin-tutorial.md](docs/kilocode/rtk-plugin-tutorial.md) |
| 为 KiloCode 安装完整三件套 | [docs/kilocode/full-setup.md](docs/kilocode/full-setup.md) |
| 了解 RTK 支持哪些命令 | [docs/rtk/overview.md](docs/rtk/overview.md) |
| 了解 Caveman 压缩模式 | [docs/caveman/overview.md](docs/caveman/overview.md) |
| 了解 9Router 功能 | [docs/9router/overview.md](docs/9router/overview.md) |
| 安装 RTK（所有平台） | [docs/rtk/install.md](docs/rtk/install.md) |
| 安装 Caveman（所有平台） | [docs/caveman/install.md](docs/caveman/install.md) |
| 安装 9Router | [docs/9router/install.md](docs/9router/install.md) |

---

## 平台支持

| 平台 | RTK 自动 Hook | RTK Plugin (KiloCode) | Caveman | 9Router |
|------|:---:|:---:|:---:|:---:|
| **Windows 原生** | ✅（Git Bash） | ✅ | ✅ | ✅ |
| **WSL** | ✅ | ✅ | ✅ | ✅ |
| **macOS** | ✅ | ✅ | ✅ | ✅ |
| **Linux** | ✅ | ✅ | ✅ | ✅ |

> ⚠️ Windows 原生实测：RTK hook 自动改写在 Git Bash 环境下完全可用，不需要 WSL。
> KiloCode Plugin Hook 在所有平台均可工作。

---

## AI 工具兼容性

| 工具 | RTK 自动改写 | 实现方式 | 详细教程 |
|------|:-----------:|---------|:--------:|
| **KiloCode** | ✅ 100% | Plugin Hook (`tool.execute.before`) | [教程](docs/kilocode/rtk-plugin-tutorial.md) |
| **OpenCode** | ✅ 100% | 同上，改路径即可 | [教程](docs/kilocode/rtk-plugin-tutorial.md#opencode) |
| **Claude Code** | ✅ 原生支持 | `rtk init -g` 一键注册 | 无需额外配置 |
| **Cursor** | ✅ 支持 | Rules + 自定义指令 | 见插件教程 |
| **Windsurf** | ✅ 支持 | Rules + 自定义指令 | 见插件教程 |
| **Codex CLI** | ❌ 不支持 | 无插件/钩子系统 | — |

---

## 一键安装

### Windows (PowerShell)
```powershell
# RTK
$url = "https://github.com/rtk-ai/rtk/releases/latest/download/rtk-x86_64-pc-windows-msvc.zip"
Invoke-WebRequest -Uri $url -OutFile "$env:TEMP\rtk.zip"
Expand-Archive -Path "$env:TEMP\rtk.zip" -DestinationPath "$env:USERPROFILE\tools\rtk" -Force
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";$env:USERPROFILE\tools\rtk", "User")

# ⚠️ Windows 特有配置：设置 Git 默认编辑器
# RTK 内部默认使用 vim，但 Windows 原生系统通常没有 vim。
# 设置 core.editor 可以避免 git rebase -i 等命令报错。
git config --global core.editor "notepad"

# Caveman
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex

# 9Router
npm install -g 9router
```

### macOS / Linux / WSL
```bash
# RTK
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# Caveman
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash

# 9Router
npm install -g 9router
```

---

## 项目结构

```
ai-token-saver-guide/
├── README.md                          # 你在这里
├── docs/
│   ├── kilocode/
│   │   ├── rtk-plugin-tutorial.md     # ⭐ 插件配置完整教程
│   │   ├── rtk.md                     # RTK 规则文件方式（补充）
│   │   ├── caveman.md
│   │   └── full-setup.md              # 完整流程
│   ├── 9router/
│   │   ├── overview.md
│   │   └── install.md
│   ├── rtk/
│   │   ├── overview.md
│   │   └── install.md
│   └── caveman/
│       ├── overview.md
│       └── install.md
├── configs/
│   └── kilocode/
│       ├── rtk-rules.md               # 规则文件示例
│       └── plugins/rtk-kilo/          # ⭐ 插件源码（可直接复制使用）
│           ├── index.ts
│           └── package.json
└── scripts/
    ├── windows/install-all.ps1
    └── unix/install-all.sh
```

---

## 许可证

MIT — 随意使用、修改、分享。
