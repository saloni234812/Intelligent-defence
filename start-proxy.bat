@echo off
echo Starting Intelligence Defense System with Proxy Server...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run dev"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd client && npm run dev"

echo Waiting 3 seconds for frontend to start...
timeout /t 3 /nobreak > nul

echo Starting Proxy Server...
start "Proxy Server" cmd /k "npm run dev:proxy"

echo.
echo All servers are starting...
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo Proxy:    http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
