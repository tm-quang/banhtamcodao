@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Usage: start-server.bat [PORT]
REM Starts Next.js dev server on given PORT (default 3000)
REM Also pushes code to git before starting server

set PORT_DEFAULT=3300
set PORT=%1
if "%PORT%"=="" set PORT=%PORT_DEFAULT%

echo ========================================
echo Git Push Function
echo ========================================
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo Warning: Git is not installed or not in PATH
    echo Skipping git operations...
    goto :start_server
)

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo Warning: Not in a git repository
    echo Skipping git operations...
    goto :start_server
)

echo Checking git status...
git status --short

echo.
echo Adding all changes to git...
git add .

echo.
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Auto commit before starting server

echo.
echo Committing changes...
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo Warning: Commit failed or no changes to commit
    echo Continuing to start server...
    goto :start_server
)

echo.
echo Pushing to remote repository...
git push
if errorlevel 1 (
    echo Warning: Push failed. Check your remote configuration.
    echo Continuing to start server...
    goto :start_server
)

echo.
echo Git push completed successfully!
echo.

:start_server
echo ========================================
echo Starting Next.js dev server on port %PORT% ...
echo ========================================
echo.
REM Pass port to next via npm script using "--" to forward args
npm run dev -- -p %PORT%

endlocal

