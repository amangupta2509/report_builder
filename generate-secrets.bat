@echo off
REM Script to generate secure secrets for environment variables

echo.
echo 🔐 Report Builder - Secret Generator
echo ====================================
echo.

REM Check if openssl is available
where openssl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ openssl is not installed or not in PATH.
    echo.
    echo To install:
    echo - Download from: https://slproweb.com/products/Win32OpenSSL.html
    echo - Or via Chocolatey: choco install openssl
    echo - Or via WSL: wsl openssl rand -base64 32
    exit /b 1
)

echo Generating secure secrets...
echo.

REM Generate JWT_SECRET
for /f "delims=" %%A in ('openssl rand -base64 32') do set JWT_SECRET=%%A
echo ✅ JWT_SECRET (32 chars, base64):
echo    JWT_SECRET=%JWT_SECRET%
echo.

REM Generate ENCRYPTION_KEY (64 hex chars)
for /f "delims=" %%B in ('openssl rand -hex 32') do set ENCRYPTION_KEY=%%B
echo ✅ ENCRYPTION_KEY (64 hex chars):
echo    ENCRYPTION_KEY=%ENCRYPTION_KEY%
echo.

echo ====================================
echo 📋 Copy these values to your .env.local or .env.production file
echo.
