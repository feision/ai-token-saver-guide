#!/bin/bash
# Unix (macOS / Linux / WSL) 一键安装脚本

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}========================================"
echo -e "  AI Token Saver - Unix Installer"
echo -e "  RTK + Caveman + 9Router"
echo -e "========================================${NC}"

# --------------------------------------------------
# 1. Check Node.js
# --------------------------------------------------
echo -e "\n${YELLOW}[1/4] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi
echo -e "  ${GREEN}Node.js $(node --version) detected${NC}"

# --------------------------------------------------
# 2. Install RTK
# --------------------------------------------------
echo -e "\n${YELLOW}[2/4] Installing RTK...${NC}"
if command -v rtk &> /dev/null; then
    echo -e "  ${GREEN}RTK already installed: $(rtk --version)${NC}"
else
    curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
    echo -e "  ${GREEN}RTK installed!${NC}"
fi

# --------------------------------------------------
# 3. Install Caveman
# --------------------------------------------------
echo -e "\n${YELLOW}[3/4] Installing Caveman...${NC}"
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
echo -e "  ${GREEN}Caveman installed!${NC}"

# --------------------------------------------------
# 4. Install 9Router
# --------------------------------------------------
echo -e "\n${YELLOW}[4/4] Installing 9Router...${NC}"
if command -v 9router &> /dev/null; then
    echo -e "  ${GREEN}9Router already installed${NC}"
else
    npm install -g 9router
    echo -e "  ${GREEN}9Router installed!${NC}"
fi

# --------------------------------------------------
# Done
# --------------------------------------------------
echo -e "\n${CYAN}========================================"
echo -e "  Installation Complete!"
echo -e "========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. cd to your project and run: ${GREEN}rtk init --agent kilocode${NC}"
echo -e "  2. Start 9Router: ${GREEN}9router${NC}"
echo -e "  3. In Kilo Code, type ${GREEN}/caveman${NC} to activate"
echo -e "  4. Set API base URL to ${GREEN}http://localhost:20128/v1${NC}"
