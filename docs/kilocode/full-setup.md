# Kilo Code 完整安装指南

> RTK + Caveman + 9Router 三件套，为 Kilo Code 打造极致 Token 压缩环境

---

## 最终效果

```
Kilo Code 发命令
    ↓
RTK 规则自动改写命令前缀（rtk git status）
    ↓
RTK 过滤输出（节省 60-90% 命令输出 Token）
    ↓
Kilo Code 调用 API
    ↓
9Router 接收 → 路由/降级/格式翻译
    ↓
9Router 内置 RTK Token Saver 再次压缩
    ↓
发送给 LLM（双重压缩）
    ↓
LLM 返回 + Caveman 压缩输出（节省 65% 输出 Token）
    ↓
Kilo Code 收到极简回复
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

## 第二步：初始化 RTK for Kilo Code

```bash
# 在项目根目录执行
rtk init --agent kilocode
```

生成 `.kilocode/rules/rtk-rules.md`，Kilo Code 会自动使用 RTK 命令前缀。

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

### 在 Kilo Code 中使用
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

### 配置 Kilo Code 连接 9Router

在 Kilo Code 的 API 设置中：

```
API Base URL: http://localhost:20128/v1
API Key:      留空（本地免认证）
```

---

## 第五步：配置 9Router

1. 打开 Dashboard → 添加 AI 提供商（如 Claude、OpenAI、Kiro 等）
2. 配置 Smart Combo（可选，多提供商轮询/降级）
3. 确保 RTK Token Saver 已开启（默认开启）
4. 设置 Tier 1/2/3 降级策略

---

## 第六步：验证全链路

### 1. 验证 RTK
```bash
# 让 Kilo Code 执行一些命令，然后看统计
rtk gain
```

### 2. 验证 Caveman
在 Kilo Code 中输入 `/caveman`，检查回复是否变短。

### 3. 验证 9Router
访问 `http://localhost:20128/dashboard`，查看请求日志和 Token 用量。

### 4. 监控总体节省
- 9Router Dashboard → 查看 Token 用量和节省
- `rtk gain` → 查看命令行节省
- Caveman → 查看输出回复长度变化

---

## 各平台差异总结

### Windows 原生（Git Bash）

| 步骤 | 状态 | 备注 |
|------|:---:|------|
| RTK 安装 | ✅ | 下载 `.exe`，加 PATH |
| RTK 初始化 | ✅ | `rtk init --agent kilocode` 生成规则文件 |
| Caveman 安装 | ✅ | PowerShell 安装脚本 |
| 9Router 安装 | ✅ | `npm install -g 9router` |
| RTK 自动改写 | ✅ | Kilo Code 通过规则文件主动使用 |
| Caveman 激活 | ✅ | `/caveman` 命令 |

### WSL / macOS / Linux

| 步骤 | 状态 | 备注 |
|------|:---:|------|
| RTK 安装 | ✅ | `curl ... \| sh` |
| RTK 初始化 | ✅ | `rtk init -g` 或 `rtk init --agent kilocode` |
| Caveman 安装 | ✅ | `curl ... \| bash` |
| 9Router 安装 | ✅ | `npm install -g 9router` |
| RTK 自动改写 | ✅ | Hook 透明改写（完整体验） |
| Caveman 激活 | ✅ | `/caveman` 命令 |

---

## 一键安装脚本

### Windows
```powershell
# 见 scripts/windows/install-all.ps1
```

### macOS / Linux / WSL
```bash
# 见 scripts/unix/install-all.sh
```

---

## 快速恢复（重装系统后）

```bash
# 1. 装 Node.js (https://nodejs.org)
# 2. 安装 RTK
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# 3. 初始化 Kilo Code RTK 规则
cd /path/to/your/project
rtk init --agent kilocode

# 4. 安装 Caveman
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash

# 5. 安装 9Router
npm install -g 9router
9router

# 6. Kilo Code 中 /caveman 激活
# 完成！
```

---

## Token 节省叠加测算

| 环节 | 工具 | 节省比例 |
|------|------|:---:|
| 命令输出 | RTK CLI | -60~90% |
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
