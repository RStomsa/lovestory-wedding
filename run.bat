@echo off
title LoveStory - Nen Tang Thiep Cuoi Dien Anh
cd /d "D:\WEB\cinelove"

echo ===================================================================
echo     DANG KHOI DONG NEN TANG THIEP CUOI DIEN ANH LOVESTORY
echo ===================================================================
echo.
echo [1/2] Dang mo trinh duyet tai: http://localhost:3000
start http://localhost:3000
echo.
echo [2/2] Dang khoi chay may chu cuc bo...
echo (Ban co the de cua so nay chay an va xem tren trinh duyet)
echo.

where bun >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    bun dev
) else (
    npm run dev
)

pause
