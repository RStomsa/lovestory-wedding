@echo off
setlocal
cd /d "%~dp0"

echo =====================================================================
echo           LOVESTORY STUDIO - DESKTOP NATIVE APP LAUNCHER
echo           REALTIME 2-WAY SYNC (WEB ^<-^> DESKTOP)
echo =====================================================================
echo.

:: 1. Kiem tra Next.js tren cong 3000
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] May chu LoveStory dang hoat dong tren cong 3000.
) else (
    echo [..] May chu cong 3000 chua bat. Dang khoi dong may chu LoveStory...
    start "LoveStory Server" /min cmd /c "npm run dev"
    echo [..] Dang doi may chu san sang tren cong 3000...
    :wait_server
    ping 127.0.0.1 -n 3 >nul
    netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo [..] Dang ket noi may chu LoveStory...
        goto wait_server
    )
    echo [OK] May chu LoveStory da khoi dong thanh cong!
)

echo.
:: 2. Tim kiem trinh duyet de chay Native App Window
set BROWSER_EXE=

if exist "%LOCALAPPDATA%\CentBrowser\Application\chrome.exe" (
    set "BROWSER_EXE=%LOCALAPPDATA%\CentBrowser\Application\chrome.exe"
    goto found_browser
)
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=C:\Program Files\Google\Chrome\Application\chrome.exe"
    goto found_browser
)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    goto found_browser
)
if exist "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" (
    set "BROWSER_EXE=C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
    goto found_browser
)
if exist "C:\Program Files\CocCoc\Browser\Application\browser.exe" (
    set "BROWSER_EXE=C:\Program Files\CocCoc\Browser\Application\browser.exe"
    goto found_browser
)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    goto found_browser
)
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    goto found_browser
)

:found_browser
if not defined BROWSER_EXE (
    echo [CANH BAO] Khong tim thay trinh duyet phu hop, mo qua trinh duyet mac dinh...
    start http://localhost:3000/admin/studio
    goto finish
)

:: 3. Khoi chay Cua So Ung Dung Doc Lap (Native Window)
echo [..] Dang mo Cua So Ung Dung LoveStory Studio tren Desktop...
start "" "%BROWSER_EXE%" --app="http://localhost:3000/admin/studio" --window-size=1440,920

echo [OK] Da mo thanh cong Cua So Ung Dung LoveStory Studio!

:finish
echo.
echo =====================================================================
echo   DONG BO REALTIME: Luong SSE Web ^<-^> Desktop dang hoat dong.
echo   Moi thay doi duoc cap nhat ngay lap tuc!
echo =====================================================================
echo.
ping 127.0.0.1 -n 3 >nul
exit