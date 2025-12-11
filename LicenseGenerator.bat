@echo off
cd /d "%~dp0"
echo License Generator ishga tushirimoqda...
call npm run license-gen
pause
