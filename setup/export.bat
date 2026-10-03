@echo off
rem Export the local Grafidu database to a .sql file that restores cleanly on
rem a fresh database (roles prelude + schema + data):
rem   psql -U postgres -d grafidu_admin_database -f <file>
rem PRIVACY: the file contains user data + password hashes - private repos only.
set /p PGPASS=Postgres superuser password:
set PGPASSWORD=%PGPASS%
set PGBIN=C:\Program Files\PostgreSQL\17\bin
if not exist "%PGBIN%\pg_dump.exe" set PGBIN=C:\Program Files\PostgreSQL\16\bin
if not exist "%PGBIN%\pg_dump.exe" set PGBIN=C:\Program Files\PostgreSQL\15\bin
if not exist "%PGBIN%\pg_dump.exe" (
  echo PostgreSQL bin folder not found - edit this file and set PGBIN.
  exit /b 1
)
if not exist "%~dp0exports" mkdir "%~dp0exports"
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set TS=%%i
set OUT=%~dp0exports\grafidu-export-%TS%.sql
copy /y "%~dp0roles-prelude.sql" "%OUT%" >nul
echo -- ==== database dump ==== >> "%OUT%"
"%PGBIN%\pg_dump.exe" --format=plain --no-owner --clean --if-exists >> "%OUT%"
echo Exported to: %OUT%
echo Privacy reminder: contains user data - private repository only.
