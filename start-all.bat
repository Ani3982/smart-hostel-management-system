@echo off
echo ==========================================================
echo Launching Full-Stack Hostel Management System
echo New Arts, Commerce and Science College, Ahilyanagar (Autonomous)
echo ==========================================================
start "Hostel Backend (Spring Boot: 8080)" cmd /k "%~dp0run-backend.bat"
timeout /t 5 /nobreak >nul
start "Hostel Frontend (React Vite: 5173)" cmd /k "%~dp0run-frontend.bat"
echo Services launched!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8080
pause
