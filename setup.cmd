@echo off
rem Naye computer par ek dafa chalayein. Restaurant studio ke packages daalta hai aur check karta hai
rem ke Node aur ffmpeg maujood hain.

where node >nul 2>nul || (echo Node nahi mila. https://nodejs.org se Node 20 ya naya install karein. & pause & exit /b 1)
where ffmpeg >nul 2>nul || (echo ffmpeg nahi mila. PowerShell me chalayein: winget install Gyan.FFmpeg & pause & exit /b 1)

cd /d "%~dp0plugins\studio\restaurant-studio\assets\remotion-template"
call npm ci --no-audit --no-fund || (echo npm ci nahi chala. Uper wali ghalati dekhein. & pause & exit /b 1)

cd /d "%~dp0automation\social-scheduler"
call node scheduler.mjs channels || (echo Buffer se jawab nahi aaya. .env me BUFFER_API_KEY dekhein. & pause & exit /b 1)

echo.
echo Sab theek hai! Zaiqa Lounge & Grill restaurant studio taiyar hai.
pause
