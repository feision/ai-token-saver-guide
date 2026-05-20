# RTK - Rust Token Killer (for Kilo Code)

> **Always use `rtk` prefix** when running shell commands in this project.
> RTK filters and compresses command output before it reaches the LLM,
> saving 60-90% of input tokens with zero loss of technical information.

## Required rtk-prefixed commands

| Instead of...       | Use...              |
|---------------------|---------------------|
| `git status`        | `rtk git status`    |
| `git diff`          | `rtk git diff`      |
| `git log`           | `rtk git log`       |
| `grep "..." .`      | `rtk grep "..." .`  |
| `find . -name ...`  | `rtk find . -name ...` |
| `ls -la`            | `rtk ls -la`        |
| `cargo test`        | `rtk cargo test`    |
| `cargo build`       | `rtk cargo build`   |
| `npm test`          | `rtk npm test`      |
| `pytest`            | `rtk pytest`        |
| `tree`              | `rtk tree`          |

## Meta commands (always use rtk directly)

```bash
rtk gain              # Show token savings analytics
rtk gain --history    # Show command usage history with savings
rtk gain --graph      # Graphical savings visualization
rtk discover          # Analyze history for missed RTK opportunities
rtk proxy <cmd>       # Execute raw command without filtering (debugging)
rtk --version         # Verify RTK installation
```

## How it works

RTK automatically detects the command type and applies the best filter:
- `git-diff`: Compresses git diff output
- `git-status`: Compresses git status output
- `grep`: Compresses grep results
- `find`: Compresses find results
- `ls`: Compresses directory listings
- `tree`: Compresses tree output
- `dedup-log`: Deduplicates log lines
- `smart-truncate`: Intelligently truncates long output

If a filter fails, RTK silently falls back to the original output.
