# Integrating CodeCharte into a Jenkins 2 and Sonarqube pipeline

This writeup documents a way to use CC in a Jenkins 2 Pipeline. CC will take your project analysis and publish the CodeCharta web-application as an artifact.

## Prerequisites

* Gitlab CI Pipeline which uses the yml file and runs the builds on a windows machine
* A sonarqube instance
* Powershell or similiar (you can replace the ps scripts with other types)

## Base Configuration

1. Download "SonarScanner for MSBuild" on the build machine. 
2. Create three new hidden variables in your build pipeline and fill them with the correct values for your sonarqube instance: 
	* SONAR_USER
	* SONAR_PW
	* SONAR_TOKEN
3. If you use https and your build machine does not trust the certificate import the certificate into your JVM:
	* visit your SQ in your browser
	* download/export the certificate of your instance (please use google how to do it in your specific browser)
	* use the Java keytool to import the certificate e.g. `C:\"Program Files (x86)"\Java\jre1.8.0_40\bin\keytool -importcert -file sonar-cert.cer -alias sonar -keystore C:\"Program Files (x86)"\Java\jre1.8.0_40\lib\security\cacerts`
4. Create a new powershell script similiar to the following in order to run the analysis:
```
$SQ_RUNNER = "C:\Sonar\sonar-scanner-msbuild\MSBuild.SonarQube.Runner.exe"
 
$NUGET = "$Env:NUGET"
$MSBUILD = "$Env:MSBUILD"
$ROOT_DIRECTORY = "$Env:CI_PROJECT_DIR"
$BUILD_DIRECTORY = "..\..\Build"
$LIBS_DIRECTORY = "..\..\Libs"
$BUILD_MODE = "Debug"
$BUILD_PLATFORM = "x86"
$SOLUTION = "Source\MySolution.sln"
 
Set-Location $ROOT_DIRECTORY
 
# Begin Sonar
& $SQ_RUNNER "begin" "/k:MyProjectKey" "/n:MySolution" "/v:$Env:CI_BUILD_ID" "/d:sonar.login=$env:SONAR_USER" "/d:sonar.password=$env:SONAR_PW" "/d:sonar.host.url=https://mysonarinstance.com"

# Build your solution
& $NUGET restore $SOLUTION -NonInteractive
& $MSBUILD "$SOLUTION" "/nodereuse:false" "/v:m" "/m" "/tv:15.0" "/p:SkipInvalidConfigurations=true" "/clp:ErrorsOnly" "/p:Configuration=$BUILD_MODE" "/p:Platform=$BUILD_PLATFORM" "/p:OutDir=$BUILD_DIRECTORY" "/p:ReferencePath=$LIBS_DIRECTORY"
 
# you can also test your solution and do other things here. Sonar will try to integrate the results. For coverage usually you need to use opencover and reference the result in the begin step

# End Sonar
& $SQ_RUNNER "end" "/d:sonar.login=$env:SONAR_USER" "/d:sonar.password=$env:SONAR_PW"

```

5. Create a script similiar to the following in order to run CC analysis:
```
$ROOT_DIRECTORY = "$Env:CI_PROJECT_DIR"
$CCSH = ".\node_modules\codecharta-analysis\public\bin\ccsh.bat"
 
Set-Location $ROOT_DIRECTORY
 
npm install codecharta-analysis --silent
 
& "$CCSH" "sonarimport" "https://mysonarinstance.com" "MyProjectKey" "-u" "$Env:SONAR_TOKEN" "-o" "$ROOT_DIRECTORY\sonar_$Env:CI_BUILD_ID.cc.json"
```

6. Add your scripts to your pipeline definition
```

stages:
	...
	-PostProcessing
	...

PostProcessing:
	stage: quality
	only:
		- master
	script:
		- powershell -File Scripts\run-sonarQube.ps1
		- powershell -File Scripts\run-analysisCodecharta.ps1
	artifacts:
	paths:
		- ./*.cc.json
	expire_in: 2 week
	
```