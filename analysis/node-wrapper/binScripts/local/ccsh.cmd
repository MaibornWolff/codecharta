@ECHO off
GOTO start
:find_dp0
SET dp0=%~dp0
EXIT /b
:start
SETLOCAL
CALL :find_dp0

"%dp0%\..\codecharta-analysis\public\bin\ccsh.bat" %*
