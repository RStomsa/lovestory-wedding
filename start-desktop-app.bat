@echo off
chcp 65001 >nul
title LoveStory Studio - Desktop App Launcher
cls

echo =====================================================================
echo           💍 LOVESTORY STUDIO - UNG DUNG MAY TINH NATIVE v2.0
echo           DONG BO THOI GIAN THUC 2 CHIEU (WEB ^<-^> DESKTOP)
echo =====================================================================
echo.

:: 1. Kiem tra xem may chu Next.js dang chay tren port 3000 chua
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] May chu LoveStory dang hoat dong tren cong 3000.
) else (
    echo [..] Dang khoi dong may chu LoveStory tren cong 3000...
    start "LoveStory Server" /min cmd /c "npm run dev"
    timeout /t 5 >nul
)

:: 2. Kiem tra va khoi chay Ung Dung Desktop Native Webview2
echo [..] Dang khoi chay cua so Ung Dung Desktop LoveStory Studio...

set EDGE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist %EDGE_PATH% (
    set EDGE_PATH="C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

if exist %EDGE_PATH% (
    start "" %EDGE_PATH% --app="http://localhost:3000/admin/studio" --window-size=1440,920 --window-position=60,40 --enable-features=OverlayScrollbar
    echo [OK] Da mo Ung Dung Desktop LoveStory Studio thanh cong!
) else (
    start "" "http://localhost:3000/admin/studio"
    echo [OK] Da mo giao dien Studio tren trinh duyet mac dinh.
)

echo.
echo =====================================================================
echo   DONG BO REALTIME: Luong SSE Web ^<-^> Desktop dang ket noi.
echo   Moi thay doi ve Template, Do hoa, Khoi mau duoc tu dong cap nhat!
echo =====================================================================
echo.
timeout /t 3 >nul
exit
