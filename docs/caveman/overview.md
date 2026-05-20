# Caveman 简介

> 让 AI 编程助手"像原始人一样说话"，压缩 LLM 回复，节省 65% 输出 Token

## 是什么

Caveman 是一个 Prompt 注入工具，通过注入精简风格的 System Prompt，让 LLM 用最短的文本表达技术内容。

## 工作流程

```
Without Caveman:  LLM → verbose paragraph → 1,000 output tokens
With Caveman:     LLM → telegraphic response → 350 output tokens (65% saved)
```

## 核心能力

### 5 级压缩模式
| 模式 | 说明 | 节省 |
|------|------|------|
| `lite` | 轻度精简 | ~30% |
| `full` | 完整精简（推荐） | ~50% |
| `ultra` | 电报体风格 | ~65% |
| `wenyan` | 文言文风格 | ~70% |
| `normal mode` | 恢复正常 | 0% |

### 技术保证
- **100% 技术准确度**：不丢失技术信息，只改变表达风格
- **跨会话持续**：激活后保持到说 "normal mode"
- **子代理压缩**：cavecrew 子代理（investigator/builder/reviewer）也能享受压缩
- **MCP 代理支持**：caveman-shrink MCP 服务器可压缩 tool_result

## 使用方式

在 AI 编程工具中输入：
```
/caveman           # 激活压缩（推荐 full 模式）
/caveman ultra     # 电报体风格
/normal mode       # 停止压缩
```

## 支持 30+ AI 工具

覆盖主流 AI 编程工具，完整列表见 [INSTALL.md](https://github.com/JuliusBrussee/caveman/blob/main/INSTALL.md)

## 开源

MIT 协议，https://github.com/JuliusBrussee/caveman (62.5k 星)
