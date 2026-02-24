@echo off
REM PivaiTech Website Launcher for Windows
REM Double-click this file to start the website

title PivaiTech Website Server

echo ============================================================
echo   PivaiTech Website Server
echo ============================================================
echo.

echo Starting server on http://localhost:5500/
echo Opening your browser...
echo.
echo Press Ctrl+C to stop the server when done
echo ============================================================
echo.

REM Start Python server and open browser
start http://localhost:5500/index.html
python -m http.server 5500

REM This runs when server is stopped
echo.
echo Server stopped. You can close this window.
pause