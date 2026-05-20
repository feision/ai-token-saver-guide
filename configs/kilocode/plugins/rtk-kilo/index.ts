/**
 * RTK Plugin for KiloCode / OpenCode
 *
 * 通过 tool.execute.before hook 拦截 Bash/Shell 命令，
 * 调用 rtk rewrite 改写命令，强制走 RTK 压缩输出。
 * 与 LLM 模型无关，所有模型均生效。
 */

import os from "os"
import path from "path"

const homeDir = os.homedir()
const RTK_EXE = process.platform === "win32"
  ? homeDir + "/tools/rtk/rtk.exe"    // Windows: 默认安装路径
  : homeDir + "/tools/rtk/rtk"         // macOS/Linux: 默认安装路径
const RTK_DIR = path.dirname(RTK_EXE)

export default {
  id: "rtk-kilo-plugin",

  server: async ({ $ }) => {
    // 启动时检查 rtk 是否可用
    let rtkFound = false
    try {
      const ver = await $`${RTK_EXE} --version`.quiet().text()
      console.log("[rtk-kilo] found:", ver.trim())
      rtkFound = true
    } catch (e) {
      console.warn("[rtk-kilo] rtk not found at", RTK_EXE, "— plugin disabled")
      return {}   // rtk 不存在时安全退出，不影响 KiloCode 正常运行
    }

    return {
      // 将 RTK 目录注入 Shell PATH，确保 rtk 命令在子进程中可执行
      "shell.env": (_input, output) => {
        const pathKey = Object.keys(output.env).find(k => k.toLowerCase() === "path")
        if (pathKey) {
          const existing = output.env[pathKey]
          if (!existing.includes(RTK_DIR)) {
            output.env[pathKey] = RTK_DIR + (process.platform === "win32" ? ";" : ":") + existing
          }
        }
      },

      // 核心 Hook：拦截 Bash/Shell 工具调用，通过 rtk rewrite 改写命令
      "tool.execute.before": async (input, output) => {
        const tool = String(input.tool ?? "").toLowerCase()
        if (tool !== "bash" && tool !== "shell") return   // 只拦截命令执行

        const args = output.args
        if (!args || typeof args !== "object") return

        const command = args.command
        if (typeof command !== "string" || !command) return

        // 已经有 rtk 前缀的命令不重复改写
        if (command.trimStart().startsWith("rtk ")) return

        try {
          const rewritten = await $`${RTK_EXE} rewrite ${command}`.quiet().nothrow().text()
          const trimmed = rewritten.trim()
          if (trimmed && trimmed !== command) {
            args.command = trimmed
            console.log("[rtk-kilo]", command, "→", trimmed)
          }
        } catch {
          // rtk rewrite 失败时透传原命令，不影响正常执行
        }
      },
    }
  },
}
