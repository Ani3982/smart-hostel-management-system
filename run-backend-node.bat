@echo off
title Online Hostel Management - Node.js Backend (Port 8080)
echo ======================================================================
echo   Starting Node.js Backend Server with MySQL (Port 8080)
echo   College: New Arts, Commerce and Science College, Ahilyanagar
echo   Database: hostel_management_db (User: root)
echo ======================================================================
cd /d "%~dp0backend-node"
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
node server.js
pause
