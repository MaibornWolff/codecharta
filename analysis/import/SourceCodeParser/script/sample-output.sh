#!/usr/bin/env bash
echo Can only be run after jar is created by "gradle build"
echo ------------------------------------------------
echo    FolderOutput
echo ------------------------------------------------
java -jar build/libs/codecharta-sourcecodeparser-1.13.0.jar src/test/resources/ -out=table

echo
echo ------------------------------------------------
echo    Fileoutput
echo ------------------------------------------------
java -jar build/libs/codecharta-sourcecodeparser-1.13.0.jar src/test/resources/ScriptShellSample.java -out=table