# Kilo Code + Caveman 配置指南

> Caveman 通过 Skill 文件注入压缩 Prompt，让 Kilo Code 回复更精简

---

## 工作原理

Caveman 将 Skill 文件安装到 `.kiro/skills/cavecrew/`，通过 `/caveman` 命令激活，让 Kilo Code 的子代理（investigator/builder/reviewer）用精简风格回复。

---

## 安装

### 1. 运行 Caveman 安装脚本

#### Windows
```powershell
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex
```

#### macOS / Linux / WSL
```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
```

### 2. 仅安装到 Kilo Code（可选）

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash -s -- --only kilocode
```

### 3. 验证安装

检查以下目录是否生成了 Skill 文件：

```bash
ls .kiro/skills/cavecrew/
```

---

## 使用

在 Kilo Code 对话中输入：

### 基本命令

```
/caveman           # 激活 Caveman（默认 full 模式）
/caveman lite      # 去掉填充词
/caveman full      # 原始人风格（推荐）
/caveman ultra     # 电报体，极度精简
/caveman wenyan    # 文言文风格
```

### 停止

说 `normal mode` 即可恢复正常回复风格。

---

## 效果对比

### 默认模式
```
I'll help you fix that bug. Let me analyze the code first.
I can see that the issue is on line 42 where you're calling
getUser() without a null check. We should add a guard clause
to handle this case. Here's the fix...
```

### Caveman Full
```
bug line 42. null check missing on getUser().
fix: add guard clause. done.
```

→ 输出 Token 减少 ~65%，技术内容不丢失

---

## 注意事项

- Caveman 不会丢失技术信息，只改变表达风格
- 每个会话需手动 `/caveman` 激活（Kilo Code 不自动激活）
- cavecrew 子代理（investigator/builder/reviewer）也能享受压缩效果
