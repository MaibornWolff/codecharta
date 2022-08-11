---
categories:
    - How-To-SonarQube
tags:
    - sonarimport
    - analysis
title: "Install SonarQube locally"
---

CodeCharta can import project metrics from SonarQube. SonarQube can generate a wide variety of project metrics for a variety of [languages](https://www.sonarqube.org/features/multi-languages/?gads_campaign=Europe4-SonarQube&gads_ad_group=Multi-Language&gads_keyword=c%20sonarqube&gclid=Cj0KCQjw_7KXBhCoARIsAPdPTfi5EtH4UHwuVjj4psqfPfzK2IQu-37u-0XL-lHpzY63-29XuxGOYDIaArF0EALw_wcB). It can be used for a local analysis, or it can be added to the build pipeline. In the following the installation and usage of a local sonar server is described.

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

### From the Docker image

You can also run SonarQube with Docker, for further information read [here](https://hub.docker.com/_/sonarqube/).

1. Install [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
2. Start the Sonar Server with the following command:
    > $ docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:latest
3. Open `localhost:9000` in your browser and log in with
    - login: admin
    - password: admin
