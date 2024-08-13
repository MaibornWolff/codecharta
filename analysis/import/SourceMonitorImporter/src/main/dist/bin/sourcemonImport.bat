@echo off &setlocal

set SOURCEMON="C:\Program Files (x86)\SourceMonitor\SourceMonitor.exe"

if "%3" == "" (
echo Usage: sourcemonImport ^<projectName^> ^<sourcePath^> ^<language^>
goto :eof
)
set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_HOME=%DIRNAME%..

:read_input_arguments
set NAME=%~1
set SOURCE_PATH=%~2
set LANGUAGE=%~3

:create_cmd_file
set PROJECT_FILE=%DIRNAME%\%NAME%.smproj
set TMPL_FILE=%APP_HOME%\etc\sourcemon_cmds.tmpl
set OUT_FILE=%DIRNAME%\codecharta_sm.csv
set CMD_FILE=%DIRNAME%\codecharta_sm_cmds.xml
(for /f "delims=" %%i in (%TMPL_FILE%) do (
    set "line=%%i"
    setlocal enabledelayedexpansion
    set "line=!line:%%NAME%%=%NAME%!"
	set "line=!line:%%SOURCE_PATH%%=%SOURCE_PATH%!"
	set "line=!line:%%LANGUAGE%%=%LANGUAGE%!"
	set "line=!line:%%OUT_FILE%%=%OUT_FILE%!"
	set "line=!line:%%PROJECT_FILE%%=%PROJECT_FILE%!"
	set "line=!line:%%TEMP%%=%TEMP%!"
    echo(!line!
    endlocal
))>"%CMD_FILE%"

:run_source_mon
%SOURCEMON% /C %CMD_FILE%

:run_importer
call %DIRNAME%\codecharta-sourcemonitorimport %OUT_FILE%