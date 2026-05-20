# AI Token Saver Guide

> 一站式记录 RTK + Caveman + 9Router 的安装和配置，主推 Kilo Code（OpenCode 衍生版）

每次重装系统后，照着这个仓库走一遍，10 分钟恢复全量 AI Token 压缩环境。

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
                              ▼ [1] RTK 压缩命令输出
┌─────────────────────────────────────────────────────────────────┐
│  rtk git status → 200 tokens (原 2000 tokens)                  │
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

## 快速入口

| 我想... | 看这里 |
|---------|--------|
| 为 Kilo Code 安装完整三件套 | [docs/kilocode/full-setup.md](docs/kilocode/full-setup.md) |
| 了解 RTK 支持哪些命令 | [docs/rtk/overview.md](docs/rtk/overview.md) |
| 了解 Caveman 压缩模式 | [docs/caveman/overview.md](docs/caveman/overview.md) |
| 了解 9Router 功能 | [docs/9router/overview.md](docs/9router/overview.md) |
| 安装 RTK（所有平台） | [docs/rtk/install.md](docs/rtk/install.md) |
| 安装 Caveman（所有平台） | [docs/caveman/install.md](docs/caveman/install.md) |
| 安装 9Router | [docs/9router/install.md](docs/9router/install.md) |

---

## 平台支持

| 平台 | RTK 自动 Hook | RTK 手动模式 | Caveman | 9Router |
|------|:---:|:---:|:---:|:---:|
| **Windows 原生** | ✅（Git Bash） | ✅ | ✅ | ✅ |
| **WSL** | ✅ | ✅ | ✅ | ✅ |
| **macOS** | ✅ | ✅ | ✅ | ✅ |
| **Linux** | ✅ | ✅ | ✅ | ✅ |

> ⚠️ Windows 原生实测：RTK hook 自动改写在 **Git Bash** 环境下完全可用，不需要 WSL。

---

## 一键安装

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex
```

### macOS / Linux / WSL
```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
```

> RTK Windows 预编译二进制详见 [docs/rtk/install.md](docs/rtk/install.md)

---

## 项目结构

```
ai-token-saver-guide/
├── README.md                     # 你在这里
├── docs/
│   ├── kilocode/                 # Kilo Code 专属指南
│   │   ├── rtk.md
│   │   ├── caveman.md
│   │   └── full-setup.md         # 完整流程
│   ├── 9router/
│   │   ├── overview.md           # 功能介绍 ⭐
│   │   └── install.md
│   ├── rtk/
│   │   ├── overview.md           # 功能介绍 + 支持命令列表 ⭐
│   │   └── install.md
│   └── caveman/
│       ├── overview.md           # 功能介绍 + 压缩模式 ⭐
│       └── install.md
├── scripts/
│   ├── windows/install-all.ps1
│   └── unix/install-all.sh
└── configs/
    └── kilocode/                 # 规则文件示例
```

---

## 许可证

MIT — 随意使用、修改、分享。
