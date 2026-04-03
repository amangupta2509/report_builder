@echo off
REM Security Configuration Setup for Windows

setlocal enabledelayedexpansion

echo.
echo ================================================
echo Report Builder - Security Configuration Setup
echo ================================================
echo.

REM Check if .env file exists
if exist .env (
    echo Current .env file found. Backing up to .env.backup
    copy .env .env.backup
) else (
    echo Creating .env from template...
    copy .env.example .env
)

echo.
echo =========================================
echo JWT and Encryption Key Generation
echo =========================================
echo.
echo To generate secure keys, you have two options:
echo.
echo Option 1: Use PowerShell (Recommended for Windows)
echo Run the following commands in PowerShell as Administrator:
echo.
echo $jwtSecret = [Convert]::ToBase64String((1..32 ^| ForEach-Object { [byte](Get-Random -Maximum 256) })) -replace '\+|/|=' | Select-Object -First 43
echo Write-Host "JWT_SECRET=$jwtSecret"
echo.
echo $encryptionKey = [BitConverter]::ToString((1..32 ^| ForEach-Object { [byte](Get-Random -Maximum 256) })) -replace '-'
echo Write-Host "ENCRYPTION_KEY=$encryptionKey"
echo.
echo.
echo Option 2: Use online tool
echo Visit: https://www.random.org/bytes/
echo - Generate 32 bytes (256 bits) and convert to base64 for JWT_SECRET  
echo - Generate 32 bytes (256 bits) and convert to hex for ENCRYPTION_KEY
echo.
echo =========================================
echo 3. Update .env file manually
echo =========================================
echo.
echo Edit .env file and update:
echo   - JWT_SECRET=[your generated key]
echo   - ENCRYPTION_KEY=[your generated key - 64 hex characters]
echo   - DATABASE_URL=[your connection string]
echo   - NODE_ENV=production
echo   - NEXT_PUBLIC_APP_URL=https://yourdomain.com
echo.
echo =========================================
echo 4. Verify Configuration
echo =========================================
echo.
findstr "^JWT_SECRET=" .env >nul
if %ERRORLEVEL%==0 (
    echo [OK] JWT_SECRET is configured
) else (
    echo [WARN] JWT_SECRET not properly configured
)

findstr "^ENCRYPTION_KEY=" .env >nul
if %ERRORLEVEL%==0 (
    echo [OK] ENCRYPTION_KEY is configured
) else (
    echo [WARN] ENCRYPTION_KEY not properly configured
)

findstr "^DATABASE_URL=" .env >nul
if %ERRORLEVEL%==0 (
    echo [OK] DATABASE_URL is configured
) else (
    echo [WARN] DATABASE_URL not configured
)

echo.
echo =========================================
echo 5. Security Checklist
echo =========================================
echo.
echo [ ] JWT_SECRET configured (32+ characters)
echo [ ] ENCRYPTION_KEY configured (64 hex characters)
echo [ ] DATABASE_URL configured
echo [ ] NODE_ENV set to 'production'
echo [ ] NEXT_PUBLIC_APP_URL set to your domain
echo [ ] .env added to .gitignore
echo [ ] .env NOT committed to repository
echo.
echo =========================================
echo 6. Next Steps
echo =========================================
echo.
echo 1. Review .env file for all required variables
echo 2. Never commit .env to version control
echo 3. Run 'npm install' to install dependencies
echo 4. Run 'npm run build' to verify configuration
echo 5. Run 'npm start' to start production server
echo 6. Read SECURITY_FIXES.md for security recommendations
echo.
echo =========================================
echo Configuration setup complete!
echo =========================================
echo.
pause
