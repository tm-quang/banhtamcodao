@echo off
setlocal

REM 1. Check if git is initialized
if not exist ".git" (
    echo This folder is not a git repository. Initializing...
    git init
)

REM 2. Check if remote 'origin' exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo No remote repository linked.
    set /p "RepoURL=Enter GitHub Repository URL: "
    if "!RepoURL!"=="" (
        echo URL cannot be empty.
        goto :End
    )
    git remote add origin !RepoURL!
    echo Linked to !RepoURL!
)

REM Check if a commit message was passed as an argument
if "%~1"=="" (
    set /p "CommitMessage=Enter commit message: "
) else (
    set "CommitMessage=%~1"
)

REM Check if message is still empty
if "%CommitMessage%"=="" (
    echo Commit message cannot be empty.
    goto :End
)

echo.
echo Adding all changes...
git add .

echo.
echo Committing...
git commit -m "%CommitMessage%"

echo.
echo Pushing to remote...
REM Try normal push first
git push >nul 2>&1
if %errorlevel% neq 0 (
    echo First push detected, setting upstream...
    git branch -M main
    git push -u origin main
)

echo.
echo Done!

:End
pause
endlocal
