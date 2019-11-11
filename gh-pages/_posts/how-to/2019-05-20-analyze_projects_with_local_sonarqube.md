---
categories:
  - How-to
tags:
  - how-to
title: Analyze Projects with a local SonarQube Instance for CodeCharta
---

CodeCharta can import project metrics from SonarQube. SonarQube can generate a wide variety of project metrics for a variety of languages (see https://docs.sonarqube.org/display/PLUG/Plugin+Library). It can be used for a local analysis, or it can be added to the build pipeline. In the following the installation and usage of a local sonar server is described.

# Installing Sonar Server

see also https://docs.sonarqube.org/latest/setup/get-started-2-minutes/

1. Download the latest version of SonarQube at https://www.sonarqube.org/downloads/
2. Unzip the archive (use the chosen location for the next step)
3. Start the Sonar Server with
   `C:\sonarqube\bin\windows-x86-xx\StartSonar.bat` on Windows or
   `/opt/sonarqube/bin/[OS]/sonar.sh` on Linux/MacOS
4. Open `localhost:9000` in your browser and log in with admin/admin

# Analyze a project with SonarQube

1. Click on the plus icon to create a new project
2. Specify the project key and display name
3. Click the respective button to generate a token
4. Specify the main language for the project

(for further information consult https://docs.sonarqube.org/latest/project-administration/project-existence/)

## Java

5. Specify the build technology
6. Gradle: Copy the following snippet to the build.gradle file (https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+Gradle)
   ```
   plugins {
     id "org.sonarqube" version "2.7"
   }
   ```
   Maven: Set the plugin prefix in the `settings.xml` file as described on https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+Maven
7. Execute the appropriate command for maven or gradle:
   ```
   ./gradlew sonarqube \
     -Dsonar.projectKey=<PROJECT_KEY> \
     -Dsonar.host.url=<URL> \
     -Dsonar.login=<TOKEN>
   ```
   ```
   mvn sonar:sonar \
     -Dsonar.projectKey=<PROJECT_KEY> \
     -Dsonar.host.url=<URL> \
     -Dsonar.login=<TOKEN>
   ```

## C

In order to analyze a C# project, please refer to the SonarQube documentation https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+MSBuild

## Other

(Python, JavaScript, Typescript, CSS, HTML, C, C++, ...)

5. Download SonarQube Scanner
6. Extract and add location (of the SonarQube Scanner) to the PATH variable
7. Execute the following command on Linux/MacOS:
   ```
   sonar-scanner \
     -Dsonar.projectKey=<PROJECT_KEY> \
     -Dsonar.sources=. \
     -Dsonar.host.url=<URL> \
     -Dsonar.login=<TOKEN>
   ```
   and for Windows:
   ```
   sonar-scanner.bat -D"sonar.projectKey=<PROJECT_KEY>" -D"sonar.sources=." -D"sonar.host.url=<URL>" -
   D"sonar.login=<TOKEN>"
   ```

# Extract projects metrics from Sonar Server

Project metrics can be extracted from a Sonar server using the sonarimport of CodeCharta

> ./ccsh sonarimport \<URL> \<PROJECT_KEY>

With:

- URL: http://localhost:9000 (default)
- PROJECT_ID: The project key specified in SonarQube
