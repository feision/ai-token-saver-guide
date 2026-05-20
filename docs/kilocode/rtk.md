# Kilo Code + RTK 配置指南

> RTK 为 Kilo Code 提供项目级规则文件，让 Kilo Code 自动使用 RTK 过滤命令输出

---

## 工作原理

RTK 通过生成 `.kilocode/rules/rtk-rules.md` 规则文件，告诉 Kilo Code 在执行命令时使用 `rtk` 前缀来获取压缩后的输出。

```
Kilo Code 要跑 git status
    ↓
读取 .kilocode/rules/rtk-rules.md
    ↓
主动使用 rtk git status（而非 git status）
    ↓
RTK 过滤输出 → 发给 LLM 的内容更短
```

---

## 安装

### 1. 确保 RTK 已安装

```bash
rtk --version   # 应显示 rtk x.x.x
```

如果没装，见 [RTK 安装指南](../rtk/install.md)。

### 2. 在项目根目录初始化

```bash
rtk init --agent kilocode
```

输出类似：
```
[rtk] Created: .kilocode/rules/rtk-rules.md
[rtk] Kilo Code will now use RTK for command output filtering
```

### 3. 验证生成的文件

```bash
cat .kilocode/rules/rtk-rules.md
```

---

## 生成的文件内容

RTK 会在项目中生成一个规则文件，内容大致如下：

```
# RTK - Rust Token Killer

Use `rtk` prefix for all shell commands to get token-optimized output.

## Commands that MUST use rtk:
- rtk git status (not git status)
- rtk git diff (not git diff)
- rtk grep ... (not grep)
- rtk find ... (not find)
- rtk cargo test (not cargo test)
- rtk ls (not ls)

## Verification:
rtk gain          # Show savings
rtk --version     # Verify installation
```

---

## 使用效果

安装后，Kilo Code 在执行以下命令时会自动带 `rtk` 前缀：

| 原始命令 | RTK 改写 |
|---------|----------|
| `git status` | `rtk git status` |
| `git diff` | `rtk git diff` |
| `cargo test` | `rtk cargo test` |
| `grep "foo" .` | `rtk grep "foo" .` |
| `find . -name "*.rs"` | `rtk find . -name "*.rs"` |

---

## 验证效果

```bash
# 查看 Token 节省统计
rtk gain

# 查看历史命令节省明细
rtk gain --history

# 图形化展示
rtk gain --graph

# 分析哪些命令还没走 RTK
rtk discover
```

---

## 故障排查

| 问题 | 解决 |
|------|------|
| Kilo Code 没用 rtk 前缀 | 检查 `.kilocode/rules/rtk-rules.md` 是否存在 |
| `rtk gain` 显示 0 节省 | 确认命令确实带了 `rtk` 前缀 |
| 规则文件没生成 | 确保在项目根目录执行 `rtk init --agent kilocode` |
