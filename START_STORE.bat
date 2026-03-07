@echo off
cd /d %~dp0
echo Starting Pocket Hash demo environment...
call npm run db:init
if errorlevel 1 goto :fail
call npm run db:seed-demo
if errorlevel 1 goto :fail
call npm run build
if errorlevel 1 goto :fail
echo Launching storefront on http://localhost:3000 ...
call npm run start
goto :eof

:fail
echo Startup failed. Review the error output above.
pause
exit /b 1
