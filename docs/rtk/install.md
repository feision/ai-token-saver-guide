# RTK 安装指南（全平台）

> RTK (Rust Token Killer) — CLI 代理，压缩命令输出，节省 60-90% 输入 Token

---

## 前置条件

- Node.js 环境（配合 AI 编程工具）
- RTK 本身是 Rust 编译的单一二进制，无其他依赖

---

## 平台选择

| 平台 | Hook 自动改写 | 备注 |
|------|:---:|------|
| macOS / Linux | ✅ | 完整自动改写 |
| WSL | ✅ | 完整自动改写 |
| **Windows (Git Bash)** | ✅ | 实测可用，`rtk init -g` 一步搞定 |
| Windows (CMD/PowerShell) | ⚠️ | 需手动前缀 `rtk <cmd>` |

---

## 一、Windows 原生（推荐 Git Bash）

### 安装

```powershell
# 1. 下载预编译二进制
$url = "https://github.com/rtk-ai/rtk/releases/latest/download/rtk-x86_64-pc-windows-msvc.zip"
Invoke-WebRequest -Uri $url -OutFile "$env:TEMP\rtk.zip"

# 2. 解压到固定目录
Expand-Archive -Path "$env:TEMP\rtk.zip" -DestinationPath "$env:USERPROFILE\tools\rtk" -Force

# 3. 加入 PATH
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";$env:USERPROFILE\tools\rtk",
    "User"
)
```

### 验证

```bash
# 新开终端
rtk --version   # 应显示 rtk x.x.x
rtk gain        # 应正常输出（无报错）
```

> 如果 `rtk gain` 报错，可能误装了同名 `reachingforthejack/rtk`。卸载重装。

### 初始化（Kilo Code）

```bash
rtk init --agent kilocode
```

这会生成 `.kilocode/rules/rtk-rules.md`，告诉 Kilo Code 使用 RTK 过滤命令输出。

---

## 二、macOS / Linux / WSL

### 安装

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
```

### 初始化

```bash
rtk init -g
```

自动注册 Claude Code PreToolUse Hook，命令透明改写。

---

## 三、各 AI 工具初始化命令

| AI 工具 | 命令 |
|---------|------|
| Claude Code | `rtk init -g` |
| **Kilo Code** | `rtk init --agent kilocode` |
| Cursor | `rtk init -g --agent cursor` |
| Codex | `rtk init -g --codex` |
| Copilot | `rtk init -g --copilot` |
| Gemini CLI | `rtk init -g --gemini` |
| Cline / Roo | `rtk init --agent cline` |
| Windsurf | `rtk init --agent windsurf` |
| Antigravity | `rtk init --agent antigravity` |

---

## 四、常用命令

```bash
rtk gain                 # 查看 Token 节省统计
rtk gain --history       # 历史命令节省明细
rtk gain --graph         # 图形化展示
rtk discover             # 分析还有哪些命令可以走 RTK
rtk init --show          # 检查安装状态
rtk proxy <cmd>          # 原始命令（不过滤，调试用）
```

### 手动调用（当 hook 不可用时）

```bash
rtk git status
rtk git diff
rtk cargo test
rtk grep "pattern" .
rtk ls
rtk find "*.rs" .
```

---

## 五、支持的过滤器

| 过滤器 | 用途 |
|--------|------|
| `git-diff` | 压缩 git diff 输出 |
| `git-status` | 压缩 git status 输出 |
| `grep` | 压缩 grep 结果 |
| `find` | 压缩 find 命令结果 |
| `ls` | 压缩目录列表 |
| `tree` | 压缩 tree 输出 |
| `dedup-log` | 去重日志行 |
| `smart-truncate` | 智能截断 |
| `read-numbered` | 带行号读取 |
| `search-list` | 搜索列表 |

---

## 六、效果示例

```
Without RTK:  47,000 tokens sent to LLM
With RTK:      9,400 tokens sent to LLM
                 ↓
             80% saved · same context · same answer
```
