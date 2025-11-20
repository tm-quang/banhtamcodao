@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Usage: stop-server.bat [PORT]
REM Stops process listening on PORT (default 3000)

set PORT_DEFAULT=3000
set PORT=%1
if "%PORT%"=="" set PORT=%PORT_DEFAULT%

echo Looking for process using TCP port %PORT% ...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
  set PID=%%a
)

if not defined PID (
  echo No LISTENING process found on port %PORT%.
  goto :eof
)

echo Killing PID %PID% ...
taskkill /PID %PID% /F >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo Stopped process %PID% on port %PORT%.
) else (
  echo Failed to stop process %PID%. You may need to run as Administrator.
)

endlocal

