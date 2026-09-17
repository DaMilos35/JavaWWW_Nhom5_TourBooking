@echo off
echo ===================================================
echo    TOUR BOOKING PROJECT STARTUP SCRIPT
echo ===================================================
echo.
echo Starting Backend (Spring Boot)...
start "Backend - Spring Boot" cmd /c "cd backend && mvnw spring-boot:run"

echo Starting Frontend (React)...
start "Frontend - React" cmd /c "cd frontend && npm install && npm start"

echo.
echo Both backend and frontend are starting in separate windows.
echo Please wait a moment for them to initialize.
echo - Backend will be at: http://localhost:8080
echo - Frontend will be at: http://localhost:3000
echo.
pause
