@echo off
rem Start the PostgreSQL service installed by the EDB installer.
rem (It normally auto-starts at boot; this is for when it was stopped.)
rem NOTE: "net start" needs an Administrator terminal.
pg_isready -h 127.0.0.1 -p 5432 >nul 2>&1
if %errorlevel%==0 (
  echo PostgreSQL is already running.
  exit /b 0
)
net start postgresql-x64-17 2>nul
if not %errorlevel%==0 net start postgresql-x64-16 2>nul
if not %errorlevel%==0 net start postgresql-x64-15 2>nul
pg_isready -h 127.0.0.1 -p 5432
if not %errorlevel%==0 (
  echo.
  echo Could not start PostgreSQL. Open an Administrator terminal and run:
  echo   net start postgresql-x64-17
  exit /b 1
)
