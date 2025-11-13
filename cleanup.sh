#!/bin/bash

# My Glucose Pal - 项目清理脚本
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🧹 My Glucose Pal - 项目清理${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. 显示当前大小
echo -e "${BLUE}📊 当前项目大小:${NC}"
du -sh cgm_butler/
echo ""

# 2. 创建备份（可选）
echo -e "${YELLOW}📦 正在创建备份...${NC}"
tar -czf cgm_butler_backup_$(date +%Y%m%d_%H%M%S).tar.gz cgm_butler/cgm-avatar-app/ cgm_butler/MIGRATION_PROGRESS.md cgm_butler/PRODUCTION_SETUP_GUIDE.md 2>/dev/null || true
echo -e "${GREEN}✓${NC} 备份已创建"
echo ""

# 3. 删除旧前端
echo -e "${RED}🗑️  删除旧前端 (cgm-avatar-app/)...${NC}"
if [ -d "cgm_butler/cgm-avatar-app" ]; then
    rm -rf cgm_butler/cgm-avatar-app/
    echo -e "${GREEN}✓${NC} 已删除 cgm-avatar-app/ (~171MB)"
else
    echo -e "${YELLOW}⚠${NC}  cgm-avatar-app/ 不存在，跳过"
fi
echo ""

# 4. 删除过时文档
echo -e "${RED}📄 删除过时文档...${NC}"
cd cgm_butler/

FILES_TO_DELETE=(
    "MIGRATION_PROGRESS.md"
    "PRODUCTION_SETUP_GUIDE.md"
    "TEST_GUIDE.md"
    "UI_FIXES_SUMMARY.md"
    "SETUP_COMPLETE.md"
    "SETUP_STATUS.md"
    "INSTALL_CLAUDE_CODE.md"
)

for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo -e "${GREEN}✓${NC} 已删除 $file"
    else
        echo -e "${YELLOW}⚠${NC}  $file 不存在，跳过"
    fi
done

cd ..
echo ""

# 5. 验证关键文件
echo -e "${BLUE}✅ 验证关键文件...${NC}"
ERRORS=0

if [ -d "cgm_butler/minerva" ]; then
    echo -e "${GREEN}✓${NC} minerva/ 存在"
else
    echo -e "${RED}✗${NC} minerva/ 不存在！"
    ERRORS=1
fi

if [ -f "cgm_butler/.env" ]; then
    echo -e "${GREEN}✓${NC} minerva .env 存在"
else
    echo -e "${YELLOW}⚠${NC}  minerva .env 不存在"
fi

if [ -d "apps/backend/cgm_butler" ]; then
    echo -e "${GREEN}✓${NC} 主后端存在"
else
    echo -e "${RED}✗${NC} 主后端不存在！"
    ERRORS=1
fi

if [ -d "apps/frontend" ]; then
    echo -e "${GREEN}✓${NC} 主前端存在"
else
    echo -e "${RED}✗${NC} 主前端不存在！"
    ERRORS=1
fi

echo ""

# 6. 显示清理后大小
echo -e "${BLUE}📊 清理后大小:${NC}"
du -sh cgm_butler/
echo ""

# 7. 显示 cgm_butler 目录结构
echo -e "${BLUE}📁 清理后的 cgm_butler/ 目录:${NC}"
ls -lh cgm_butler/ | grep -v "^total"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✨ 清理完成！${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}🧪 请测试所有功能:${NC}"
    echo -e "   ${BLUE}./start-all.sh${NC}"
    echo -e "   ${BLUE}访问 http://localhost:8080${NC}"
    echo ""
    echo -e "${YELLOW}📝 备份文件:${NC}"
    ls -lh cgm_butler_backup_*.tar.gz 2>/dev/null | tail -1
else
    echo -e "${RED}❌ 清理过程中发现错误！请检查上述消息。${NC}"
    exit 1
fi
