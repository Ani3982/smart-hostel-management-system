@echo off
title Online Hostel Management - Spring Boot Backend (MySQL)
echo ========================================================
echo Starting Spring Boot Backend with MySQL Server 8.0
echo College: New Arts, Commerce and Science College, Ahilyanagar
echo Database: hostel_management_db (User: root)
echo ========================================================
cd /d "%~dp0backend"
call mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=mysql" "-Dspring-boot.run.arguments=--spring.datasource.username=root --spring.datasource.password=Surajsonawane2004"
pause
