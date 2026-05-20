# KiloCode + RTK 规则文件（补充方案）

> ⚠️ **规则文件方式只对 Gemini 模型有效**，大多数 LLM 会忽略规则。
> **推荐方案**：使用 [Plugin Hook](rtk-plugin-tutorial.md) 在代码层面强制改写。

---

## 工作原理（规则文件方式）

```
Kilo Code 要跑 git status
    ↓
读取 .kilocode/rules/rtk-rules.md 或 instructions 中的 RTK-RULES.md
    ↓
LLM 理解规则 → 主动使用 rtk git status（仅 Gemini 遵守）
    ↓
RTK 过滤输出 → 发给 LLM 的内容更短
```

---

## 什么时候用规则文件？

| 场景 | 推荐 |
|------|------|
| 已配置 Plugin Hook | 规则文件**可选**（作为 Gemini 的双重保障） |
| 无法使用 Plugin Hook | 规则文件**唯一选择**（但只有 Gemini 遵守） |

---

## 方法一：项目级规则文件

### 初始化

```bash
cd /path/to/your/project
rtk init --agent kilocode
```

生成 `.kilocode/rules/rtk-rules.md`。

### 验证

```bash
cat .kilocode/rules/rtk-rules.md
```

---

## 方法二：全局 instructions

### 1. 创建规则文件

在 `~/.config/kilo/RTK-RULES.md` 写入：

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

### 2. 在 opencode.json 中引用

```json
{
  "instructions": ["RTK-RULES.md"]
}
```

---

## 注意事项

### 规则不要太长

规则文件应控制在 **500 tokens 以内**。原因：

- `instructions` 会被注入 LLM 的 system prompt
- system prompt 越长，每条规则获得的注意力越少
- 超过 1000 tokens 的规则文件，遵守率趋近于 0

### 多条规则如何管理

`instructions` 支持数组，可以引用多个规则文件：

```json
{
  "instructions": ["RTK-RULES.md", "CODING-STYLE.md", "COMMIT-CONVENTION.md"]
}
```

但每个文件都要尽量简短。宁可 5 个文件每个 100 tokens，不要 1 个文件 500 tokens。

---

## 验证效果

```bash
# 查看 Token 节省统计
rtk gain

# 如果统计为 0，说明 Agent 没有遵守规则
# → 切换到 Plugin Hook 方案
```

---

## 故障排查

| 问题 | 解决 |
|------|------|
| Agent 不用 rtk 前缀 | 正常现象（非 Gemini 模型不会遵守），使用 Plugin Hook |
| 规则太长被忽略 | 缩短到 500 tokens 以内 |
| Gemini 也不遵守 | 检查 instructions 是否正确引用，重启 KiloCode |

---

## 与 Plugin Hook 的关系

两者**可以同时使用**，互不冲突：

- **Plugin Hook**：代码级拦截，100% 可靠，所有模型
- **规则文件**：Prompt 级引导，~10% 可靠，仅 Gemini

推荐组合：Plugin Hook 为主 + 简短规则文件为辅。
