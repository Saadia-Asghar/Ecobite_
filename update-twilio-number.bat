@echo off
echo ========================================
echo Updating Twilio Phone Number
echo ========================================
echo.
echo Your Twilio Number: +14133936073
echo.

REM Check if .env exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please run setup-env.bat first.
    pause
    exit /b 1
)

echo Updating TWILIO_PHONE_NUMBER in .env...
echo.

REM Create temporary file
powershell -Command "(Get-Content .env) -replace 'TWILIO_PHONE_NUMBER=\+923159127771', 'TWILIO_PHONE_NUMBER=+14133936073' | Set-Content .env.tmp"

REM Replace original file
move /Y .env.tmp .env > nul

echo ========================================
echo SUCCESS! Twilio number updated!
echo ========================================
echo.
echo Configuration:
echo - Account SID: ACc78ad85
echo - Auth Token: 07d1054865
echo - Phone Number: +14133936073
echo.
echo Your SMS notifications are now ready!
echo.
echo Test SMS:
echo cd server
echo npx ts-node -e "import { sendSMS } from './services/sms'; sendSMS('+923159127771', 'Test!');"
echo.
pause
