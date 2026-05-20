/**
 * RTK Plugin for KiloCode / OpenCode
 *
 * Intercepts bash/shell tool calls and rewrites commands through RTK
 * to automatically compress command output and save 60-90% tokens.
 */

import os from "os"
import path from "path"

const homeDir = os.homedir()
const RTK_EXE = process.platform === "win32"
  ? homeDir + "/tools/rtk/rtk.exe"
  : homeDir + "/tools/rtk/rtk"
const RTK_DIR = homeDir + "/tools/rtk"

export default {
  id: "rtk-kilo-plugin",

  server: async ({ $ }) => {
    // Check rtk availability with absolute path (BunShell may not have rtk in PATH)
    try {
      const ver = await $`${RTK_EXE} --version`.quiet().text()
      // 启动时渲染到左下角的状态消息（只在 server 初始化阶段输出，运行时不输出）
      console.log("[rtk-kilo] " + ver.trim() + " · 自动压缩命令输出 · 节省 60-90% Token")
    } catch (e) {
      console.warn("[rtk-kilo] rtk not found at", RTK_EXE, "— plugin disabled")
      return {}
    }

    return {
      // Inject RTK directory into shell PATH so rtk commands work
      "shell.env": (_input, output) => {
        const pathKey = Object.keys(output.env).find(k => k.toLowerCase() === "path")
        if (pathKey) {
          const existing = output.env[pathKey]
          if (!existing.includes(RTK_DIR)) {
            output.env[pathKey] = RTK_DIR + (process.platform === "win32" ? ";" : ":") + existing
          }
        }
      },

      // Rewrite bash/shell commands through RTK
      "tool.execute.before": async (input, output) => {
        const tool = String(input.tool ?? "").toLowerCase()
        if (tool !== "bash" && tool !== "shell") return

        const args = output.args
        if (!args || typeof args !== "object") return

        const command = args.command
        if (typeof command !== "string" || !command) return

        // Skip if already prefixed with rtk
        if (command.trimStart().startsWith("rtk ")) return

        try {
          const rewritten = await $`${RTK_EXE} rewrite ${command}`.quiet().nothrow().text()
          const trimmed = rewritten.trim()
          if (trimmed && trimmed !== command) {
            args.command = trimmed
            // 静默改写，不输出任何日志
          }
        } catch {
          // rtk rewrite failed — pass through unchanged
        }
      },
    }
  },
}
