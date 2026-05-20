# RTK (Rust Token Killer) 简介

> 用 Rust 编写的高性能 CLI 代理，拦截命令输出并智能压缩，节省 60-90% Token

## 是什么

RTK 是一个 CLI 代理工具，用 Rust 编写。它夹在 AI 编程工具和系统命令之间，拦截命令输出并进行智能过滤压缩，再将压缩后的结果发给 LLM。

## 工作流程

```
Without RTK:  Claude → shell → git status (2,000 tokens) → LLM
With RTK:     Claude → RTK → git status → RTK filter → LLM (200 tokens)
```

## 核心能力

- **10 种智能过滤器**：git-diff, git-status, grep, find, ls, tree, dedup-log, smart-truncate, read-numbered, search-list
- **自动检测**：读取 `tool_result` 前 1KB，自动选择最合适的过滤器
- **安全设计**：过滤失败时静默保留原始文本，不中断请求
- **节省 60-90%** 命令输出 Token

## 支持的命令（40+）

RTK 支持以下命令的智能压缩：

### Git 相关
| 命令 | 说明 |
|------|------|
| `rtk git` | Git 命令输出压缩（status/diff/log 等） |
| `rtk gh` | GitHub CLI 输出压缩 |
| `rtk glab` | GitLab CLI 输出压缩 |

### 前端开发
| 命令 | 说明 |
|------|------|
| `rtk npm` | npm run 输出过滤 |
| `rtk pnpm` | pnpm 超紧凑输出 |
| `rtk npx` | 智能路由到 specialized filters |
| `rtk jest` | Jest 测试紧凑输出 |
| `rtk vitest` | Vitest 测试紧凑输出 |
| `rtk tsc` | TypeScript 编译错误分组 |
| `rtk lint` | ESLint 规则违规分组 |
| `rtk prettier` | Prettier 格式检查紧凑输出 |
| `rtk playwright` | Playwright E2E 测试紧凑输出 |

### 后端开发
| 命令 | 说明 |
|------|------|
| `rtk cargo` | Cargo 命令紧凑输出 |
| `rtk go` | Go 命令紧凑输出 |
| `rtk ruff` | Ruff linter 紧凑输出 |
| `rtk pytest` | Pytest 测试紧凑输出 |
| `rtk mypy` | Mypy 错误分组输出 |
| `rtk prisma` | Prisma 命令无 ASCII 艺术 |
| `rtk pip` | Pip 包管理器紧凑输出 |
| `rtk rake/rubocop/rspec` | Ruby/Rails 工具链 |

### 容器与云
| 命令 | 说明 |
|------|------|
| `rtk docker` | Docker 命令紧凑输出 |
| `rtk kubectl` | Kubernetes 命令紧凑输出 |
| `rtk aws` | AWS CLI 强制 JSON 压缩 |

### 数据库
| 命令 | 说明 |
|------|------|
| `rtk psql` | PostgreSQL 表格压缩（去边框） |

### 系统工具
| 命令 | 说明 |
|------|------|
| `rtk ls` | 目录列表压缩 |
| `rtk tree` | 目录树压缩 |
| `rtk find` | 文件查找结果紧凑输出 |
| `rtk grep` | 搜索结果去空白压缩 |
| `rtk diff` | 仅显示改动行 |
| `rtk log` | 日志去重过滤 |
| `rtk curl` | 自动检测 JSON 输出格式 |
| `rtk wget` | 下载进度条剥离 |
| `rtk env` | 环境变量过滤（敏感信息脱敏） |
| `rtk json` | JSON 压缩（值压缩或仅键） |
| `rtk wc` | 计数结果剥离路径填充 |
| `rtk deps` | 项目依赖汇总 |

### 分析工具
| 命令 | 说明 |
|------|------|
| `rtk gain` | 查看 Token 节省统计 |
| `rtk discover` | 发现历史中遗漏的 RTK 节省 |
| `rtk cc-economics` | Claude Code 消费 vs 节省分析 |

## 支持 13 种 AI 工具

Claude Code, Kilo Code, Cursor, Codex, Copilot, Gemini CLI, Windsurf, Cline, Roo Code, OpenCode, OpenClaw, Hermes, Antigravity

## 开源

MIT 协议，https://github.com/rtk-ai/rtk
