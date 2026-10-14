@echo off
echo ==========================================================
echo Launching Full-Stack Hostel Management System (Node.js)
echo New Arts, Commerce and Science College, Ahilyanagar (Autonomous)
echo ==========================================================
start "Hostel Backend (Node.js Express: 8080)" cmd /k "%~dp0run-backend-node.bat"
timeout /t 3 /nobreak >nul
start "Hostel Frontend (React Vite: 5173)" cmd /k "%~dp0run-frontend.bat"
echo Services launched!
echo Frontend: http://localhost:5173
echo Node.js Backend API: http://localhost:8080/api
pause
