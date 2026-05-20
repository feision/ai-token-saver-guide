# KiloCode + RTK 插件配置教程（完整版）

> **这是唯一可靠的方案** — 通过 `@opencode-ai/plugin` 的 `tool.execute.before` hook，
> 在代码层面拦截并改写所有 Bash/Shell 命令，强制走 RTK 压缩。
> 与 LLM 模型无关，所有模型（Gemini、Claude、GPT、DeepSeek 等）均生效。

---

## 核心原理

```
KiloCode Agent 发出命令: "git status"
         ↓
Plugin tool.execute.before hook 拦截
         ↓
调用 rtk rewrite "git status" → "rtk git status"
         ↓
改写后的命令执行: rtk git status
         ↓
RTK 压缩输出 → 节省 60-90% Token
```

### 为什么不用规则文件？

| 方案 | 可靠性 | 适用模型 | 说明 |
|------|:------:|----------|------|
| **Plugin Hook（本教程）** | ✅ 100% | 所有模型 | 代码级拦截，与 LLM 无关 |
| `.kilocode/rules/rtk-rules.md` | ❌ ~10% | 仅 Gemini | 大多数 LLM 会忽略规则文件 |
| `opencode.json` instructions | ❌ ~10% | 仅 Gemini | 同上，注入 system prompt 但被忽略 |
| `AGENTS.md` 规则 | ❌ ~5% | 几乎无 | 没有任何模型主动遵守 |
| `.bashrc` wrapper | ❌ 0% | — | KiloCode 不通过交互式 Bash 执行命令 |

**结论**：只有 Plugin Hook 是可靠的。规则文件可作为 Gemini 的额外补充，但不要依赖它。

---

## 第一步：安装 RTK CLI

### Windows（原生，无需 WSL）

```powershell
# 1. 下载预编译二进制
$url = "https://github.com/rtk-ai/rtk/releases/latest/download/rtk-x86_64-pc-windows-msvc.zip"
Invoke-WebRequest -Uri $url -OutFile "$env:TEMP\rtk.zip"

# 2. 解压到固定目录
Expand-Archive -Path "$env:TEMP\rtk.zip" -DestinationPath "$env:USERPROFILE\tools\rtk" -Force

# 3. 加入用户 PATH
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";$env:USERPROFILE\tools\rtk",
    "User"
)
```

### macOS / Linux / WSL

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
```

### 验证

```bash
# 新开终端
rtk --version   # 应显示 rtk x.x.x
rtk gain        # 应正常输出（无报错）
```

> ⚠️ 如果 `rtk gain` 报错，可能误装了同名 `reachingforthejack/rtk`。卸载重装。

---

## 第二步：创建 Plugin 目录结构

KiloCode 的插件系统通过 `opencode.json` 中的 `plugin` 字段加载本地插件。

在 KiloCode 配置目录下创建插件：

```bash
# Windows
mkdir -p "$HOME/.config/kilo/plugins/rtk-kilo"

# macOS / Linux
mkdir -p "$HOME/.config/opencode/plugins/rtk-kilo"
```

> **注意**：KiloCode 使用 `~/.config/kilo/`，原生 OpenCode 使用 `~/.config/opencode/`。
> 下文以 KiloCode 为例，OpenCode 用户替换路径即可。

---

## 第三步：编写插件代码

### `index.ts` — 核心插件文件

在 `~/.config/kilo/plugins/rtk-kilo/` 目录下创建 `index.ts`：

```typescript
/**
 * RTK Plugin for KiloCode / OpenCode
 *
 * 通过 tool.execute.before hook 拦截 Bash/Shell 命令，
 * 调用 rtk rewrite 改写命令，强制走 RTK 压缩输出。
 * 与 LLM 模型无关，所有模型均生效。
 */

import os from "os"
import path from "path"

const homeDir = os.homedir()
const RTK_EXE = process.platform === "win32"
  ? homeDir + "/tools/rtk/rtk.exe"    // Windows: 默认安装路径
  : homeDir + "/tools/rtk/rtk"         // macOS/Linux: 默认安装路径
const RTK_DIR = path.dirname(RTK_EXE)

export default {
  id: "rtk-kilo-plugin",

  server: async ({ $ }) => {
    // 启动时检查 rtk 是否可用
    let rtkFound = false
    try {
      const ver = await $`${RTK_EXE} --version`.quiet().text()
      console.log("[rtk-kilo] found:", ver.trim())
      rtkFound = true
    } catch (e) {
      console.warn("[rtk-kilo] rtk not found at", RTK_EXE, "— plugin disabled")
      return {}   // rtk 不存在时安全退出，不影响 KiloCode 正常运行
    }

    return {
      // 将 RTK 目录注入 Shell PATH，确保 rtk 命令在子进程中可执行
      "shell.env": (_input, output) => {
        const pathKey = Object.keys(output.env).find(k => k.toLowerCase() === "path")
        if (pathKey) {
          const existing = output.env[pathKey]
          if (!existing.includes(RTK_DIR)) {
            output.env[pathKey] = RTK_DIR + (process.platform === "win32" ? ";" : ":") + existing
          }
        }
      },

      // 核心 Hook：拦截 Bash/Shell 工具调用，通过 rtk rewrite 改写命令
      "tool.execute.before": async (input, output) => {
        const tool = String(input.tool ?? "").toLowerCase()
        if (tool !== "bash" && tool !== "shell") return   // 只拦截命令执行

        const args = output.args
        if (!args || typeof args !== "object") return

        const command = args.command
        if (typeof command !== "string" || !command) return

        // 已经有 rtk 前缀的命令不重复改写
        if (command.trimStart().startsWith("rtk ")) return

        try {
          const rewritten = await $`${RTK_EXE} rewrite ${command}`.quiet().nothrow().text()
          const trimmed = rewritten.trim()
          if (trimmed && trimmed !== command) {
            args.command = trimmed
            // 不用 console.log 输出改写日志，避免 KiloCode 渲染为输入框 overlay 文字
          }
        } catch {
          // rtk rewrite 失败时透传原命令，不影响正常执行
        }
      },
    }
  },
}
```

### `package.json` — 本地包定义

同目录下创建 `package.json`：

```json
{
  "name": "rtk-kilo",
  "version": "1.0.0",
  "type": "module",
  "main": "index.ts",
  "dependencies": {}
}
```

### 目录结构确认

```
~/.config/kilo/plugins/rtk-kilo/
├── index.ts        # 插件源码
└── package.json    # 包定义
```

---

## 第四步：配置 opencode.json

编辑 `~/.config/kilo/opencode.json`，添加 `plugin` 字段：

```json
{
  "$schema": "https://app.opencode.ai/config.json",
  "plugin": ["file:///C:/Users/Administrator/.config/kilo/plugins/rtk-kilo/index.ts"]
}
```

### 各平台 `file://` 路径格式

| 平台 | 路径示例 |
|------|----------|
| **Windows** | `file:///C:/Users/Administrator/.config/kilo/plugins/rtk-kilo/index.ts` |
| **macOS** | `file:///Users/yourname/.config/kilo/plugins/rtk-kilo/index.ts` |
| **Linux** | `file:///home/yourname/.config/kilo/plugins/rtk-kilo/index.ts` |

> **关键**：`plugin` 字段**只接受** npm 包名或 `file:///` 协议 URI。
> 相对路径、`./` 前缀、`C:\` 绝对路径都**不生效**。

### 完整配置示例（含其他字段）

```json
{
  "$schema": "https://app.opencode.ai/config.json",
  "snapshot": false,
  "plugin": ["file:///C:/Users/Administrator/.config/kilo/plugins/rtk-kilo/index.ts"],
  "instructions": ["RTK-RULES.md"],
  "mcp": {},
  "provider": {},
  "compaction": {
    "threshold_percent": 70
  }
}
```

> `instructions` 和 `RTK-RULES.md` 是可选的补充（仅 Gemini 遵守），不影响 Plugin Hook 的核心功能。

---

## 第五步：验证（每步都验！）

### 5.1 验证 RTK 二进制可执行

```bash
# 在终端直接执行
rtk --version
# 期望输出: rtk 0.40.0（或更高版本）

rtk rewrite "git status"
# 期望输出: rtk git status
```

### 5.2 验证插件文件存在

```bash
# Windows
ls "$HOME/.config/kilo/plugins/rtk-kilo/index.ts"
ls "$HOME/.config/kilo/plugins/rtk-kilo/package.json"

# macOS / Linux
ls ~/.config/kilo/plugins/rtk-kilo/index.ts
ls ~/.config/kilo/plugins/rtk-kilo/package.json
```

### 5.3 验证 opencode.json 配置正确

```bash
# 检查 plugin 字段
cat ~/.config/kilo/opencode.json | grep -A1 "plugin"
```

确保输出包含 `file:///` 开头的路径。

### 5.4 验证插件加载

重启 KiloCode，然后运行：

```bash
kilo debug config --print-logs
```

在日志中查找：

```
[rtk-kilo] found: rtk 0.40.0    ← 看到这行 = 插件加载成功
```

如果看到：

```
[rtk-kilo] rtk not found at ...  ← RTK 二进制路径不对
```

说明 `RTK_EXE` 路径需要调整（见故障排查）。

### 5.5 验证命令改写（最关键！）

在 KiloCode 中对 Agent 说：

> "看看 git 状态"

观察 Agent 执行的命令，应该是：

```
$ rtk git status    ← 成功！rtk 前缀自动添加
```

而不是：

```
$ git status        ← 失败！插件没有生效
```

### 5.6 验证 RTK 统计

```bash
rtk gain    # 应显示非零的节省统计
```

---

## 第六步：可选补充 — RTK-RULES.md

虽然 Plugin Hook 已经强制改写所有命令，但如果你想让 Gemini 模型也能主动使用 rtk（双重保障），可以创建规则文件。

### 创建 `~/.config/kilo/RTK-RULES.md`

```markdown
# RTK — 命令改写规则

每条 Bash/Shell 命令必须使用 `rtk` 前缀。

| 错误 | 正确 |
|------|------|
| `git status` | `rtk git status` |
| `git diff` | `rtk git diff` |
| `npm run build` | `rtk npm run build` |
| `ls -la` | `rtk ls -la` |
| `grep "foo" .` | `rtk grep "foo" .` |

运行 `rtk gain` 查看节省统计。
```

然后在 `opencode.json` 中引用：

```json
"instructions": ["RTK-RULES.md"]
```

> **注意**：规则文件应尽量简短（< 500 tokens），避免注意力稀释。
> 越长的 system prompt 中，每条规则被遵守的概率越低。

---

## 故障排查

### 问题：插件没有加载

**排查步骤**：

1. 确认 `opencode.json` 中 `plugin` 字段使用 `file:///` 协议
2. 确认路径中没有中文或特殊字符
3. 运行 `kilo debug config --print-logs` 查看加载日志
4. 确认 `index.ts` 和 `package.json` 在同一目录

### 问题：`[rtk-kilo] rtk not found`

**原因**：KiloCode 的 BunShell 进程不继承用户的完整 PATH。

**解决**：修改 `index.ts` 中的 `RTK_EXE` 为 rtk 的绝对路径：

```typescript
// Windows 示例
const RTK_EXE = "C:\\Users\\Administrator\\tools\\rtk\\rtk.exe"

// macOS 示例
const RTK_EXE = "/usr/local/bin/rtk"

// Linux 示例
const RTK_EXE = "/home/yourname/.local/bin/rtk"
```

用 `which rtk` 或 `where rtk` 找到实际路径。

### 问题：`opencode.json` 报错 "Unrecognized key"

**原因**：`opencode.json` 不支持 `env`、`bash_env` 等自定义字段。

**解决**：只使用官方支持的字段：`$schema`, `snapshot`, `plugin`, `instructions`, `mcp`, `provider`, `model`, `compaction`, `permission`, `agent`。

### 问题：插件加载了但命令没改写

**排查步骤**：

1. 确认 `rtk rewrite "git status"` 在终端中能正常输出 `rtk git status`
2. 确认插件日志中出现 `[rtk-kilo] git status → rtk git status`
3. 如果 `rtk rewrite` 返回空字符串或原命令，说明 rtk 认为该命令不需要改写

### 问题：npm 包名方式加载失败

**原因**：`plugin` 字段填 npm 包名时，KiloCode 从 npmjs.org 拉取，本地包不存在于 npm 仓库。

**解决**：必须使用 `file:///` 协议指向本地插件目录。

### 问题：旧插件缓存残留

**解决**：删除旧的插件文件，重启 KiloCode：

```bash
# 删除可能残留的旧插件
rm -f ~/.config/kilo/plugins/rtk.ts
rm -f ~/.config/kilo/plugins/rtk.js

# 清除 Bun 缓存
rm -rf ~/.bun/install/cache/rtk-kilo
```

---

## 适用范围

| AI 工具 | Plugin Hook | 说明 |
|---------|:-----------:|------|
| **KiloCode** | ✅ | `~/.config/kilo/opencode.json` + `@kilocode/plugin` |
| **OpenCode** | ✅ | `~/.config/opencode/opencode.json` + `@opencode-ai/plugin` |
| Claude Code | ❌ | 无 plugin 系统，使用 `rtk init -g` 注册 PreToolUse Hook |
| Cursor | ❌ | 无 plugin 系统，使用 `rtk init -g --agent cursor` |
| Codex | ❌ | 无 plugin 系统，使用 `rtk init -g --codex` |

> KiloCode 和 OpenCode 共享相同的 plugin API（`tool.execute.before`），
> 只需调整配置路径和 `package.json` 中的依赖名称。

---

## 完整文件清单

重装系统后，需要恢复以下文件：

```
# RTK 二进制
~/tools/rtk/rtk.exe                    # Windows
~/tools/rtk/rtk                        # macOS/Linux

# KiloCode 插件
~/.config/kilo/plugins/rtk-kilo/
├── index.ts                           # 插件源码（需要修改 RTK_EXE 路径）
└── package.json                       # 包定义

# KiloCode 配置
~/.config/kilo/opencode.json           # 添加 plugin 字段

# 可选：RTK 规则文件（Gemini 补充）
~/.config/kilo/RTK-RULES.md            # 简短规则

# 可选：Claude Code Hook
~/.claude/settings.json                # rtk init -g 自动注册
```

---

## 快速恢复（重装系统后）

```bash
# 1. 安装 RTK（见第一步）

# 2. 创建插件目录
mkdir -p ~/.config/kilo/plugins/rtk-kilo

# 3. 复制 index.ts 和 package.json 到插件目录
# （从本仓库 configs/kilocode/ 目录复制）

# 4. 修改 index.ts 中的 RTK_EXE 为实际路径

# 5. 编辑 opencode.json，添加 plugin 字段

# 6. 重启 KiloCode

# 7. 验证：kilo debug config --print-logs | grep rtk-kilo

# 完成！
```

---

## 高级：自定义改写逻辑

如果某些命令不需要走 RTK（如交互式命令、需要完整输出的调试命令），可以修改 `index.ts` 中的跳过逻辑：

```typescript
// 跳过特定命令模式
const SKIP_PATTERNS = [
  /^rm\s/,           // 删除命令不走 rtk（需要看完整输出）
  /^docker\s+attach/, // 交互式命令
  /^vim\s/,           // 编辑器
  /^python\s+-m/,     // Python 模块
]

if (SKIP_PATTERNS.some(p => p.test(command))) return
```

---

## 总结

| 步骤 | 操作 | 关键点 |
|------|------|--------|
| 1 | 安装 RTK CLI | Windows 下载 exe，macOS/Linux 用 curl |
| 2 | 创建插件目录 | `~/.config/kilo/plugins/rtk-kilo/` |
| 3 | 编写 `index.ts` | `tool.execute.before` hook + 绝对路径 |
| 4 | 编写 `package.json` | `type: "module"` + `main: "index.ts"` |
| 5 | 配置 `opencode.json` | `plugin: ["file:///..."]` |
| 6 | 重启 + 验证 | `kilo debug config` + Agent 测试 |

**一劳永逸**：配置完成后，无论切换什么 LLM 模型，所有 Bash/Shell 命令都会自动走 RTK 压缩，无需手动干预。
