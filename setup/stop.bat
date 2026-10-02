@echo off
rem Stop the PostgreSQL service (needs an Administrator terminal).
net stop postgresql-x64-17 2>nul
if not %errorlevel%==0 net stop postgresql-x64-16 2>nul
if not %errorlevel%==0 net stop postgresql-x64-15 2>nul
pg_isready -h 127.0.0.1 -p 5432
