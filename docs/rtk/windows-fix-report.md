# RTK Windows 兼容性问题修复报告

> 日期：2026-05-26
> 问题：Claude Code 在 Windows 环境下执行 Bash 工具时，Windows 内置命令（如 `move`、`del`、`copy`）无法被 rtk 识别，导致 `command not found` 错误。

---

## 问题现象

用户通过 Agent 调用 Windows 命令时，rtk 拦截后报错：

```
rtk: Failed to resolve 'move' via PATH, falling back to direct exec: Binary 'move' not found on PATH
[rtk: program not found]
```

原因：rtk 设计面向 Unix 环境，不识别 Windows CMD/PowerShell 内置命令。

---

## 排查过程

| 步骤 | 操作 | 结果 |
|------|------|------|
| 1 | 检查 `rtk-kilo` 插件（KiloCode） | 插件通过 `tool.execute.before` 拦截，但仅适用于 KiloCode |
| 2 | 检查 Claude Code `PreToolUse` hook | 确认通过 `rtk hook claude` 拦截 Bash 工具 |
| 3 | 分析 `rtk hook claude` 协议 | 发现从 stdin 读取 JSON，不接受命令行参数 |
| 4 | 创建 wrapper 脚本 | 验证 stdin/stdout JSON 流式处理 |

---

## 解决方案

创建 `rtk-windows-wrapper.js`，作为 Claude Code `PreToolUse` hook 的中介层：

```
用户/Bash工具 → hook执行wrapper → 转换Windows命令 → 输出JSON → rtk处理
```

### 核心转换逻辑

```javascript
const winCmdMap = {
  move: "mv",
  del: "rm",
  copy: "cp",
  rd: "rmdir",
  type: "cat",
  fc: "diff",
  findstr: "grep",
  ren: "mv",
  rename: "mv",
  // ...
};

function convertCommand(cmd) {
  let converted = cmd.trim();
  converted = converted.replace(/\\(?=\S)/g, "/"); // Windows路径转换
  const parts = converted.split(/\s+/);
  const first = parts[0].toLowerCase();
  if (winCmdMap[first]) {
    parts[0] = winCmdMap[first];
    converted = parts.join(" ");
  }
  return converted;
}
```

### 配置修改

`settings.json` 中 hook 配置：

```json
"PreToolUse": [
  {
    "matcher": "Bash",
    "hooks": [
      {
        "type": "command",
        "command": "\"C:\\Program Files\\nodejs\\node.exe\" \"C:\\Users\\Administrator\\.claude\\hooks\\rtk-windows-wrapper.js\""
      }
    ]
  }
]
```

---

## 涉及文件

| 文件路径 | 用途 |
|----------|------|
| `C:\Users\Administrator\.claude\hooks\rtk-windows-wrapper.js` | Windows 命令转换 wrapper |
| `C:\Users\Administrator\.claude\settings.json` | Claude Code hook 配置 |
| `C:\Users\Administrator\.config\kilo\plugins\rtk-kilo\index.ts` | KiloCode rtk 插件 |

---

## 验证结果

执行 `rtk gain` 显示 rtk 正常工作，Token 节省率 99.1%：

```
Total commands:    4880
Input tokens:      1003.8M
Output tokens:     8.6M
Tokens saved:      995.2M (99.1%)
```

---

## 后续维护

- wrapper 脚本位于 `C:\Users\Administrator\.claude\hooks\`
- 如需添加新命令映射，编辑 `winCmdMap` 对象
- Windows 路径自动转换，无需手动处理

---

## 参考文档

- [RTK Plugin Tutorial](kilocode/rtk-plugin-tutorial.md)
- [RTK Overview](rtk/overview.md)
- [RTK Install](rtk/install.md)
