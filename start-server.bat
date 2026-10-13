@echo off
title Web Vui Hoc - Localhost Server (Port 3000)
chcp 65001 >nul
echo ========================================================
echo   HE THONG HOC LIEU & VUI HOC TIN HOC - CLASSROOM APP
echo ========================================================
echo [INFO] Dang khoi dong Web Server tai http://localhost:3000/
echo [INFO] Trinh duyet se tu dong mo trang web sau giay lat...
echo [INFO] Nhan Ctrl + C de dung server khi khong su dung.
echo ========================================================

start "" "http://localhost:3000/"
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
