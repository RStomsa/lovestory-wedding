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
    echo [..] Cho may chu san sang trong 5 giay...
    timeout /t 5 >nul
)

:: 2. Khoi chay Ung Dung Desktop Native .EXE (True Native Window, No Browser Tabs)
echo [..] Dang khoi chay ung dung Desktop LoveStory Studio (.exe)...

set TAURI_EXE="src-tauri\target\release\lovestory-studio-desktop.exe"
set TAURI_DEV_EXE="src-tauri\target\debug\lovestory-studio-desktop.exe"

if exist %TAURI_EXE% (
    start "" %TAURI_EXE%
    echo [OK] Da mo thanh cong Ung dung Desktop Native LoveStory (.exe)!
    goto finish
)

if exist %TAURI_DEV_EXE% (
    start "" %TAURI_DEV_EXE%
    echo [OK] Da mo thanh cong Ung dung Desktop Native LoveStory (.exe)!
    goto finish
)

:: Neu chua co file release thi chay qua cargo run hoac standalone app container
echo [..] Dang khoi chay qua Cargo Tauri Native Runner...
start "" cargo run --manifest-path src-tauri/Cargo.toml

:finish
echo.
echo =====================================================================
echo   DONG BO REALTIME: Luong SSE Web ^<-^> Desktop dang ket noi.
echo   Moi thay doi ve Template, Do hoa, Khoi mau duoc tu dong cap nhat!
echo =====================================================================
echo.
timeout /t 3 >nul
exit
