@echo off
set "PATH=%~dp0node_portable\node-v20.15.0-win-x64;%PATH%"
echo Starting PedalUp development server...
npm run dev
pause
