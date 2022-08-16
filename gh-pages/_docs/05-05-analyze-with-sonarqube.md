---
categories:
    - How-To-SonarQube
tags:
    - sonarimport
    - analysis
title: "Analyze a project with SonarQube"
---

CodeCharta can import project metrics from SonarQube. SonarQube can generate a wide variety of project metrics for a variety of [languages](https://www.sonarqube.org/features/multi-languages/). It can be used for a local analysis, or it can be added to the build pipeline. In the following the installation and usage of a local sonar server is described.

## Run SonarQube Server locally

### From the zip file

see also [SonarQube Docs](https://docs.sonarqube.org/latest/setup/get-started-2-minutes/)

1. [Download](https://www.sonarqube.org/downloads/) the latest version of SonarQube
2. Unzip the archive (use the chosen location for the next step)
3. Start the Sonar Server with
   `C:\sonarqube\bin\windows-x86-xx\StartSonar.bat` on Windows or
   `/opt/sonarqube/bin/[OS]/sonar.sh` on Linux/MacOS
4. Open `localhost:9000` in your browser and log in with
    - login: admin
    - password: admin

#### Install SonarScanner

1. [Download](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/) the latest version of SonarScanner
2. Unzip the archive
3. Add the `bin` directory to the `%PATH%`(Windows) or `PATH`(Linux/MacOS) environment variable

### From the Docker image

You can also run SonarQube with Docker, for further information read [here](https://hub.docker.com/_/sonarqube/).

1. Download and install [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/) if not already present on your system
2. [Download](https://hub.docker.com/_/sonarqube/) the latest version of SonarQube Docker Image
3. Start the Sonar Server with the following command:
    > $ docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:latest
4. Open `localhost:9000` in your browser and log in with
    - login: admin
    - password: admin

#### Install SonarScanner CLI

Also see for detailed instructions [here](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/).

1. [Download](https://hub.docker.com/r/sonarsource/sonar-scanner-cli) the latest version of SonarScanner CLI
2. Add a `sonar-project.properties` file to your project's root directory

## Analyze project

After you installed SonarQube do the following steps to analyze your Project:

1. Click on the plus icon to create a new project
2. Specify the project key and display name
3. Click the respective button to generate a token
4. Specify the main language for the project
5. Follow the instructions from SonarQube

When using SonarQube version >= 9.5, you need to create a user token. In your account settings select the security settings.

![Generate user token]({{site.baseurl}}/assets/images/docs/how-to/generate_user_token.png)

For further information read [here](https://docs.sonarqube.org/latest/project-administration/project-existence/)

## Extract project metrics from Sonar Server

To visualize your project metrics created by Sonar use CodeCharta's [sonar importer]({{site.baseurl}}{% link _docs/04-05-sonarimporter.md %}) to generate a `cc.json` file.

## Beginner's Guide for using SonarQube

If you are totally new to SonarQube, you are welcome to read more detailed instructions [here]({{site.baseurl}}{% link _post/how-to/2022-08-12-detailed-instruction-how-to-use-sonarqube.md %}).
