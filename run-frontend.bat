@echo off
title Hostel Management Frontend
echo ======================================================================
echo   Starting Hostel Management Frontend (Port 5173)
echo ======================================================================
cd /d "%~dp0frontend"
npm run dev
