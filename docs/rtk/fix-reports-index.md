# RTK 修复报告索引

> 记录 RTK 在 Windows 环境下的各种坑，每次重装系统后可直接参考。

---

## 📋 修复报告清单

| 报告 | 日期 | 问题 | 状态 |
|------|------|------|:----:|
| [shell-wrapping-fix-report.md](./shell-wrapping-fix-report.md) | 2026-05-25 | Bash 环境 `cd /d` 语法不兼容 + tsup 入口路径硬编码 | ✅ |
| [fix-reports-index.md](./fix-reports-index.md) | 2026-05-28 | 本索引文件，方便速查 | ✅ |
| [windows-fix-report.md](./windows-fix-report.md) | 2026-05-26 | Windows 内置命令（move/copy/del）被 rtk 识别为不存在 | ✅ |
| [ps-routing-fix-report.md](./ps-routing-fix-report.md) | 2026-05-26 | PowerShell 命令（Get-Location 等）被 `.bashrc` 包装拦截 | ✅ |
| [ps-cmdlet-fix-report.md](./ps-cmdlet-fix-report.md) | 2026-05-28 | PowerShell cmdlet（Select-Object/Where-Object）被路由到 Bash | ✅ |

---

## 🔍 问题速查

| 症状 | 对应报告 |
|------|----------|
| `cd /d too many arguments` | shell-wrapping-fix-report |
| `Cannot find module 'node_modules/tsup/dist/cli.js'` | shell-wrapping-fix-report |
| `Get-Location: command not found` | ps-routing-fix-report |
| `rtk: command not found` (Windows move/copy/del) | windows-fix-report |
| `Select-Object: command not found` | ps-cmdlet-fix-report |
| PowerShell 命令跑进 bash | ps-cmdlet-fix-report |

---

## 🛠 涉及配置文件

```
C:\Users\Administrator\.bashrc                              ← 命令包装 + 编码损坏（NUL 字节）
C:\Users\Administrator\.bash_profile                         ← source ~/.bashrc
C:\Users\Administrator\.claude\settings.json                 ← PreToolUse hook
C:\Users\Administrator\.claude\hooks\rtk-windows-wrapper.js ← Windows 命令转换 wrapper（已升级支持 PS cmdlet）
C:\Users\Administrator\AppData\Roaming\rtk\config.toml      ← RTK 默认配置
```

---

## 📌 关键修复记忆

### 1. Windows 构建命令规范（2026-05-25）
```
# 禁止
cd /d C:\path && node node_modules/tsup/dist/cli.js ...

# 推荐
npx --prefix "C:\path" tsup "C:\path\src\file.ts" --format esm --out-dir "C:\path\dist"
```

### 2. PowerShell 命令检测模式（2026-05-28）
PowerShell cmdlet 以这些词缀开头：`Select-`, `Where-`, `Get-`, `Set-`, `ForEach-`, `Invoke-` 等。`rtk-windows-wrapper.js` 需加模式匹配后改写工具类型为 `PowerShell`。

### 3. RTK 接管层级（2026-05-26）
`.bashrc` 全量包装 + `settings.json` PreToolUse hook 双重拦截会造成不可预期行为。建议只保留 `settings.json` 的 hook。

---

*Last updated: 2026-05-28*
