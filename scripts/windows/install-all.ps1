# Windows 一键安装脚本
# 以管理员身份在 PowerShell 中运行

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Token Saver - Windows Installer" -ForegroundColor Cyan
Write-Host "  RTK + Caveman + 9Router" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"
$RTK_DIR = "$env:USERPROFILE\tools\rtk"

# --------------------------------------------------
# 1. 检查 Node.js
# --------------------------------------------------
Write-Host "`n[1/4] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVer = node --version 2>$null
    if (-not $nodeVer) {
        Write-Host "ERROR: Node.js not found. Install from https://nodejs.org" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Node.js $nodeVer detected" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found" -ForegroundColor Red
    exit 1
}

# --------------------------------------------------
# 2. 安装 RTK
# --------------------------------------------------
Write-Host "`n[2/4] Installing RTK..." -ForegroundColor Yellow

# Download
$rtkUrl = "https://github.com/rtk-ai/rtk/releases/latest/download/rtk-x86_64-pc-windows-msvc.zip"
$rtkZip = "$env:TEMP\rtk.zip"

Write-Host "  Downloading RTK..." -ForegroundColor Gray
Invoke-WebRequest -Uri $rtkUrl -OutFile $rtkZip

# Extract
Write-Host "  Extracting to $RTK_DIR..." -ForegroundColor Gray
New-Item -ItemType Directory -Path $RTK_DIR -Force | Out-Null
Expand-Archive -Path $rtkZip -DestinationPath $RTK_DIR -Force

# Add to PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notmatch [regex]::Escape($RTK_DIR)) {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$RTK_DIR", "User")
    $env:Path += ";$RTK_DIR"
    Write-Host "  Added to PATH" -ForegroundColor Green
}

# Verify
try {
    rtk --version 2>$null | Out-Null
    Write-Host "  RTK installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: RTK may not be in PATH yet. Restart terminal after install." -ForegroundColor Yellow
}

# Cleanup
Remove-Item $rtkZip -Force -ErrorAction SilentlyContinue

# --------------------------------------------------
# 3. 安装 Caveman
# --------------------------------------------------
Write-Host "`n[3/4] Installing Caveman..." -ForegroundColor Yellow
try {
    irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex
    Write-Host "  Caveman installed!" -ForegroundColor Green
} catch {
    Write-Host "  ERROR installing Caveman: $_" -ForegroundColor Red
}

# --------------------------------------------------
# 4. 安装 9Router
# --------------------------------------------------
Write-Host "`n[4/4] Installing 9Router..." -ForegroundColor Yellow
try {
    npm install -g 9router
    Write-Host "  9Router installed!" -ForegroundColor Green
} catch {
    Write-Host "  ERROR installing 9Router: $_" -ForegroundColor Red
}

# --------------------------------------------------
# Done
# --------------------------------------------------
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart your terminal" -ForegroundColor White
Write-Host "  2. cd to your project and run: rtk init --agent kilocode" -ForegroundColor White
Write-Host "  3. Start 9Router: 9router" -ForegroundColor White
Write-Host "  4. In Kilo Code, type /caveman to activate" -ForegroundColor White
Write-Host "  5. Set API base URL to http://localhost:20128/v1" -ForegroundColor White
