# AI Token Saver Guide

> 一站式记录 RTK + Caveman + 9Router 的安装和配置，主推 Kilo Code（OpenCode 衍生版）

每次重装系统后，照着这个仓库走一遍，10 分钟恢复全量 AI Token 压缩环境。

---

## 三件套概览

| 工具 | 作用 | 节省效果 |
|------|------|----------|
| **RTK** (Rust Token Killer) | CLI 代理，压缩命令输出 | 输入 Token -60~90% |
| **Caveman** | Prompt 注入，压缩 AI 回复 | 输出 Token -65% |
| **9Router** | 智能路由网关 + 内置 RTK Token Saver | 输入 Token -20~40% + 自动降级 |

**叠加效果**：三者全开，Token 开销可降至原来的 **5-15%**。

---

## 快速入口

| 我想... | 看这里 |
|---------|--------|
| 为 Kilo Code 安装完整三件套 | [docs/kilocode/full-setup.md](docs/kilocode/full-setup.md) |
| 安装 RTK（所有平台） | [docs/rtk/install.md](docs/rtk/install.md) |
| 安装 Caveman（所有平台） | [docs/caveman/install.md](docs/caveman/install.md) |
| 安装 9Router | [docs/9router/install.md](docs/9router/install.md) |
| 了解原理 | 各工具的 overview.md |

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
│   │   ├── overview.md
│   │   └── install.md
│   ├── rtk/
│   │   ├── overview.md
│   │   └── install.md
│   └── caveman/
│       ├── overview.md
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
