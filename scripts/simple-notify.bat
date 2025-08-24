@echo off
REM Simple batch script for Windows notification sound

echo Task completed!
echo.

REM Play Windows notification sound
powershell -c "[System.Media.SystemSounds]::Exclamation.Play()"

REM Alternative: Simple beep
REM powershell -c "[console]::beep(1000, 500)"

exit /b 0