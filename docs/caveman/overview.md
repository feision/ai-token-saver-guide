# Caveman 简介

## 是什么

Caveman 是一个 Prompt 注入工具，让 AI 编程助手"像原始人一样说话"。通过注入精简风格的 System Prompt，让 LLM 用最短的文本表达技术内容。

## 工作流程

```
Without Caveman:  LLM → verbose paragraph → 1,000 output tokens
With Caveman:     LLM → telegraphic response → 350 output tokens (65% saved)
```

## 核心能力

- **5 级压缩**：Lite → Full → Ultra → Wenyan（文言文）
- **100% 技术准确度**：不丢失技术信息，只改变表达风格
- **跨会话持续**：激活后保持到说 "normal mode"
- **子代理压缩**：cavecrew 子代理（investigator/builder/reviewer）也能享受

## 支持 30+ AI 工具

覆盖主流 AI 编程工具，完整列表见 [INSTALL.md](https://github.com/JuliusBrussee/caveman/blob/main/INSTALL.md)

## 开源

MIT 协议，https://github.com/JuliusBrussee/caveman (62.5k 星)
