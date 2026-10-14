@echo off
title Hostel Management Backend - New Arts, Commerce and Science College
echo ======================================================================
echo   Starting Hostel Management Backend Server (Port 8080)
echo   College: New Arts, Commerce and Science College, Ahilyanagar
echo ======================================================================
cd /d "%~dp0"
if not exist "data" mkdir data
echo Using Maven Wrapper to start Spring Boot...
call mvnw.cmd spring-boot:run
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Backend failed with error code %ERRORLEVEL%.
    pause
)
