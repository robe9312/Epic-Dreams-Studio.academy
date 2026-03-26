@echo off
echo =========================================================
echo 🎬 EPIC DREAMS ACADEMY - FRONTEND SETUP
echo =========================================================
echo.
echo Installing dependencies for the Cinematic Workbench...
echo (Requires Node.js and npm)
echo.

npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR: Installation failed. Please ensure you have Node.js installed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ SUCCESS: Dependencies installed. 
echo Red error lines in VS Code should disappear now!
echo.
echo Use "npm run dev" to start the studio workbench.
echo.
pause
