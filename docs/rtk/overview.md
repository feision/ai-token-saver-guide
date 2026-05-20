# RTK 简介

## 是什么

RTK (Rust Token Killer) 是一个 CLI 代理工具，用 Rust 编写。它夹在 AI 编程工具和系统命令之间，拦截命令输出并进行智能过滤压缩，再将压缩后的结果发给 LLM。

## 工作流程

```
Without RTK:  Claude → shell → git status (2,000 tokens) → LLM
With RTK:     Claude → RTK → git status → RTK filter → LLM (200 tokens)
```

## 核心能力

- **10 种智能过滤器**：git-diff, git-status, grep, find, ls, tree, dedup-log, smart-truncate, read-numbered, search-list
- **自动检测**：读取 `tool_result` 前 1KB，自动选择最合适的过滤器
- **安全设计**：过滤失败时静默保留原始文本，不中断请求
- **节省 60-90%** 命令输出 Token

## 支持 13 种 AI 工具

Claude Code, Kilo Code, Cursor, Codex, Copilot, Gemini CLI, Windsurf, Cline, Roo Code, OpenCode, OpenClaw, Hermes, Antigravity

## 开源

MIT 协议，https://github.com/rtk-ai/rtk
