@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Usage: start-server.bat [PORT]
REM Starts Next.js dev server on given PORT (default 3000)

set PORT_DEFAULT=3300
set PORT=%1
if "%PORT%"=="" set PORT=%PORT_DEFAULT%

echo Starting Next.js dev server on port %PORT% ...
REM Pass port to next via npm script using "--" to forward args
npm run dev -- -p %PORT%

endlocal

