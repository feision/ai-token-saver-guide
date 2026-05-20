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
    let rtkFound = false
    let rtkVer = ""
    try {
      const ver = await $`${RTK_EXE} --version`.quiet().text()
      rtkVer = ver.trim()
      rtkFound = true
    } catch (e) {
      console.warn("[rtk-kilo] rtk not found at", RTK_EXE, "— plugin disabled")
      return {}
    }

    // 启动状态消息
    console.log(`[rtk-kilo] ✅ ${rtkVer} 运行中 · 自动压缩命令输出 · 节省 60-90% Token`)

    // 每 5 次改写后刷新一次 gain 统计到状态栏
    let rewriteCount = 0
    const GAIN_REFRESH_INTERVAL = 5

    const refreshGain = async () => {
      try {
        const gain = await $`${RTK_EXE} gain`.quiet().nothrow().text()
        // 解析 "Tokens saved:      371 (41.7%)" 这行
        const match = gain.match(/Tokens saved:\s+(\d+)\s+\(([\d.]+)%\)/)
        if (match) {
          const saved = match[1]
          const pct = match[2]
          console.log(`[rtk-kilo] 📊 已节省 ${saved} tokens (${pct}%) · ${rtkVer}`)
        }
      } catch {
        // gain 读取失败不影响功能
      }
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
            rewriteCount++
            // 每 N 次改写刷新一次 gain 统计
            if (rewriteCount % GAIN_REFRESH_INTERVAL === 0) {
              refreshGain()
            }
          }
        } catch {
          // rtk rewrite failed — pass through unchanged
        }
      },
    }
  },
}
