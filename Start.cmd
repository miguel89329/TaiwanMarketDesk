@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start.ps1"
if errorlevel 1 (
  echo Startup failed. Please send the error above or data\startup-error.log.
  pause
)
