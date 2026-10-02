@echo off
rem Reset the local Grafidu database back to a fresh copy of full-dump.sql
rem (+ sessions migration). DESTRUCTIVE: wipes everything you changed locally.
set /p PGPASS=Postgres superuser password:
set PGPASSWORD=%PGPASS%
set PGBIN=C:\Program Files\PostgreSQL\17\bin
if not exist "%PGBIN%\psql.exe" set PGBIN=C:\Program Files\PostgreSQL\16\bin
if not exist "%PGBIN%\psql.exe" set PGBIN=C:\Program Files\PostgreSQL\15\bin
if not exist "%PGBIN%\psql.exe" (
  echo PostgreSQL bin folder not found - edit this file and set PGBIN.
  exit /b 1
)
set REPO=%~dp0..
"%PGBIN%\psql.exe" -U postgres -d postgres -c "DROP DATABASE IF EXISTS grafidu_admin_database;" -c "CREATE DATABASE grafidu_admin_database;"
"%PGBIN%\psql.exe" -U postgres -q -d grafidu_admin_database -f "%REPO%\full-dump.sql"
"%PGBIN%\psql.exe" -U postgres -q -d grafidu_admin_database -f "%REPO%\postgres\migrations\001-auth.sql"
echo Reset done. Profiles (expect 94):
"%PGBIN%\psql.exe" -U postgres -t -A -d grafidu_admin_database -c "SELECT count(*) FROM public.profiles;"
