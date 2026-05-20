# KiloCode 完整安装指南

> RTK + Caveman + 9Router 三件套，为 KiloCode 打造极致 Token 压缩环境

---

## 最终效果

```
KiloCode Agent 发命令: "git status"
    ↓
[1] RTK Plugin Hook 自动拦截改写 → "rtk git status"
    ↓
[2] RTK 过滤输出（节省 60-90% 命令输出 Token）
    ↓
[3] KiloCode 调用 API
    ↓
[4] 9Router 接收 → 路由/降级/格式翻译 + 二次压缩
    ↓
[5] 发送给 LLM（双重压缩）
    ↓
[6] LLM 返回 + Caveman 压缩输出（节省 65% 输出 Token）
    ↓
KiloCode 收到极简回复
```

---

## 第一步：安装 RTK

### Windows
```powershell
$url = "https://github.com/rtk-ai/rtk/releases/latest/download/rtk-x86_64-pc-windows-msvc.zip"
Invoke-WebRequest -Uri $url -OutFile "$env:TEMP\rtk.zip"
Expand-Archive -Path "$env:TEMP\rtk.zip" -DestinationPath "$env:USERPROFILE\tools\rtk" -Force
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";$env:USERPROFILE\tools\rtk", "User")
```

### macOS / Linux / WSL
```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
```

### 验证
```bash
rtk --version   # 应显示 rtk x.x.x
rtk gain        # 应正常输出
```

---

## 第二步：配置 RTK Plugin Hook（⭐ 关键步骤）

> **这是唯一可靠的方式** — 通过 `@opencode-ai/plugin` 的 `tool.execute.before` hook，
> 在代码层面拦截所有 Bash/Shell 命令并自动添加 `rtk` 前缀。
> 与 LLM 模型无关，Gemini、Claude、GPT、DeepSeek 等均生效。

### 详细步骤请参考：[RTK Plugin 完整教程](rtk-plugin-tutorial.md)

简要流程：

1. 创建插件目录：`~/.config/kilo/plugins/rtk-kilo/`
2. 复制插件源码（`configs/kilocode/plugins/rtk-kilo/` → 插件目录）
3. 编辑 `opencode.json`，添加 `"plugin": ["file:///...index.ts"]`
4. 重启 KiloCode
5. 验证：`kilo debug config --print-logs | grep rtk-kilo`

---

## 第三步：安装 Caveman

### Windows
```powershell
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex
```

### macOS / Linux / WSL
```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
```

### 在 KiloCode 中使用
```
/caveman           # 激活压缩（推荐 full 模式）
/caveman ultra     # 电报体
normal mode        # 停止压缩
```

---

## 第四步：安装 9Router

```bash
npm install -g 9router
9router
```

浏览器自动打开 `http://localhost:20128/dashboard`，首次密码 `123456`。

### 配置 KiloCode 连接 9Router

在 `opencode.json` 的 `provider` 中添加：

```json
"9router": {
  "options": {
    "apiKey": "你的9Router API Key",
    "baseURL": "http://localhost:20128/v1",
    "temperature": 0.1
  },
  "models": {
    "DeepSeek-Group": { "name": "DeepSeek-Group" },
    "Gemini-Group": { "name": "Gemini-Group" }
  }
}
```

---

## 第五步：验证全链路

### 1. 验证 RTK Plugin
在 KiloCode 中让 Agent 执行任意命令，观察是否自动添加 `rtk` 前缀：
```
$ rtk git status    ← 成功
$ git status        ← 失败，检查插件是否加载
```

### 2. 验证 RTK 统计
```bash
rtk gain
```

### 3. 验证 Caveman
在 KiloCode 中输入 `/caveman`，检查回复是否变短。

### 4. 验证 9Router
访问 `http://localhost:20128/dashboard`，查看请求日志和 Token 用量。

---

## 各平台差异总结

| 步骤 | Windows | macOS | Linux | WSL |
|------|:-------:|:-----:|:-----:|:---:|
| RTK 安装 | ✅ exe | ✅ curl | ✅ curl | ✅ curl |
| RTK Plugin Hook | ✅ | ✅ | ✅ | ✅ |
| Caveman 安装 | ✅ PS | ✅ curl | ✅ curl | ✅ curl |
| 9Router 安装 | ✅ npm | ✅ npm | ✅ npm | ✅ npm |
| Claude Code Hook | ✅ `rtk init -g` | ✅ | ✅ | ✅ |

---

## Token 节省叠加测算

| 环节 | 工具 | 节省比例 |
|------|------|:---:|
| 命令输出 | RTK Plugin + CLI | -60~90% |
| 请求入参 | 9Router RTK Token Saver | -20~40% |
| LLM 回复 | Caveman | -65% |

假设原始 100K Token 消耗：

```
RTK 过滤命令输出：    100K → 30K   (省 70K)
9Router 压缩 tool_result：30K → 20K  (省 10K)
Caveman 压缩回复：    20K → 7K     (省 13K)
────────────────────────────────
总节省：93K → 实际消耗 7K → 节省 93%
```

> 实际效果取决于项目类型和使用模式，通常节省 80-95%。

---

## 快速恢复（重装系统后）

```bash
# 1. 安装 Node.js (https://nodejs.org)

# 2. 安装 RTK（见第一步）

# 3. 创建 KiloCode 插件目录
mkdir -p ~/.config/kilo/plugins/rtk-kilo

# 4. 从本仓库复制插件源码
cp configs/kilocode/plugins/rtk-kilo/* ~/.config/kilo/plugins/rtk-kilo/

# 5. 修改 index.ts 中的 RTK_EXE 为实际路径

# 6. 编辑 opencode.json，添加 plugin 字段

# 7. 安装 Caveman
# Windows: irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex
# Unix:    curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash

# 8. 安装 9Router
npm install -g 9router && 9router

# 9. 重启 KiloCode + 验证
kilo debug config --print-logs | grep rtk-kilo

# 完成！
```
