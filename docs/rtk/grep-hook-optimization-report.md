# rtk grep 压缩优化 + hook 注册报告

> 日期：2026-06-10
> 优化 rtk grep 的 token 压缩参数，并通过 hook 机制强制所有命令走 rtk 代理。

## 背景

模型在常规 grep 时输出大量上下文（~16K chars/次），而 rtk grep 可以将输出压缩 85-92%（~1.2K chars/次）。此前 AGENTS.md 已声明过"用 rtk"，但模型从不遵守——需要 hook 级的强制拦截。

## 改动清单

### 1. 安装 ripgrep（rtk grep 的 Windows 后端）

rtk grep 在 Windows 上依赖 ripgrep 作为底层搜索引擎。

```powershell
winget install BurntSushi.ripgrep.MSVC
```

- 版本：ripgrep 15.1.0
- 路径：系统 PATH 全局可用

### 2. rtk 配置优化

`C:\Users\Administrator\AppData\Roaming\rtk\config.toml` 新增：

```toml
grep_max_results = 50       # 最多返回 50 条结果
grep_max_per_file = 15      # 单个文件最多 15 条匹配
```

同时将 rtk grep 的默认参数锁定为：

```
--ultra-compact -m 30 -l 60
```

- `--ultra-compact`：单行格式，去边框/分隔符
- `-m 30`：最多 30 个匹配文件
- `-l 60`：文件路径行宽上限 60 字符

### 3. rtk hook claude 注册

在 `C:\Users\Administrator\.claude\settings.json` 的 PreToolUse（Bash）末尾添加：

```json
{
  "type": "command",
  "command": "rtk hook claude"
}
```

执行机制：
1. 模型发出 Bash 命令 → hook 拦截
2. `rtk hook claude` 解析 stdin JSON
3. 自动给所有命令前缀 `rtk `（如 `grep "foo"` → `rtk grep "foo"`）
4. rtk 对输出做智能压缩后返回给模型

### 4. AGENTS.md / CLAUDE.md 规则更新

在以下两处加入 rtk grep 使用规则：

| 文件 | 说明 |
|------|------|
| `C:\Users\Administrator\.config\opencode\AGENTS.md` | KiloCode/OpenCode 指令 |
| `C:\Users\Administrator\.claude\CLAUDE.md` | Claude Code / Kilo Code 共享指令 |

规则文本：

```markdown
# rtk grep Token 优化

- 所有 grep 搜索必须用: `rtk grep --ultra-compact -m 30 -l 60 <PATTERN>`
- 精准搜索加 `-w`（整词匹配），减少无效结果
- 高频模式（import/console.log/error等）加 `--context-only`，只显示匹配段不显示整行
- 尽量缩小搜索范围: 指定路径或 `-t <filetype>`，不要全项目扫
- 配置已设 `grep_max_results = 50`、`grep_max_per_file = 15`
```

## 效果对比

| 指标 | 优化前（原生 grep） | 优化后（rtk grep） |
|------|:------------------:|:------------------:|
| 典型输出大小 | ~16K chars | ~1.2K chars |
| Token 节省 | 基线 | **~85-92%** |
| 全量 grep | `< 100` 条全文 | `≤ 50` 条紧凑 |
| 模型遵守 | ❌ 说了不用 | ✅ hook 强制拦截 |

## 相关文件

```
~\.claude\settings.json                            ← PreToolUse hook（rtk hook claude）
~\.config\opencode\AGENTS.md                       ← opencode grep 规则
~\.claude\CLAUDE.md                                ← Claude/Kilo 共享 grep 规则
~\.claude\hooks\windows-cmd-translator.js           ← Windows 命令转换（无 rtk 前缀）
~\.claude\hooks\                                   ← 其他 hook 插件
~\AppData\Roaming\rtk\config.toml                  ← rtk 默认配置
```

## 注意事项

- `windows-cmd-translator.js`（约 220 行，驻留 450K tokens）不含 rtk 前缀功能，已建议移至 ECC plugin。但目前删除成本过高，保留不动。
- rtk hook 在 opencode（本工具）和 Claude Code 中均生效，因为共用同一份 `settings.json`。
- 如果 hook 链执行顺序有问题（先翻译再 rtk 或反之），需调整 settings.json 中 hook 的顺序。
