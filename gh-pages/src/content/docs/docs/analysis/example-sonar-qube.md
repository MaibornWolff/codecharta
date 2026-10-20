---
title: "Analyse a project with SonarQube"
description: "Run a local SonarQube server, scan your project and import its code metrics and code smells into a CodeCharta map with ccsh sonarimport."
sidebar:
  label: "SonarQube example"
---

SonarQube measures code smells, coverage, duplications and many more metrics for a wide range of languages.
This guide sets up a local SonarQube server, scans a project with it and imports the results into a CodeCharta map
with the [Sonar Importer](/docs/importer/sonar). If your team already runs a SonarQube server, skip to
[Import the metrics](#import-the-metrics).

## Start a local SonarQube server

### With Docker

```bash
docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:latest
```

See the [SonarQube image on Docker Hub](https://hub.docker.com/_/sonarqube) for other versions and settings.

### From the zip file

1. [Download](https://www.sonarsource.com/products/sonarqube/downloads/) SonarQube and unzip it.
2. Start the server with `bin\windows-x86-64\StartSonar.bat` on Windows or `bin/<os>/sonar.sh start` on Linux and
   macOS, from the folder you unzipped.

Either way, open `localhost:9000` in your browser and log in as `admin` with the password `admin`. SonarQube asks
you to change the password on the first login.

## Install SonarScanner

1. [Download SonarScanner CLI](https://docs.sonarsource.com/sonarqube-server/10.8/analyzing-source-code/scanners/sonarscanner/)
   and unzip it.
2. Add its `bin` folder to your `PATH`.

## Scan the project

1. In SonarQube, create a project and give it a project key and a display name.
2. Generate a token and pick the main language of the project.
3. Run the `sonar-scanner` command SonarQube shows you from the root folder of your project.

## Create a user token

The Sonar Importer needs a user token. Create one under your account, in the **Security** settings.

![SonarQube security settings with the form to generate a user token](/assets/images/docs/how-to/generate_user_token.png)

## Import the metrics

```bash
ccsh sonarimport http://localhost:9000 <project-key> --user-token=<user-token> -o project.sonar.cc.json
```

This writes `project.sonar.cc.json.gz`. Add `-m` with a comma-separated list to import only some metrics, and
`--merge-modules` for a multi-module project. To see the Sonar metrics next to the history, merge the file with the
result of other commands using the [Merge Filter](/docs/filter/merge-filter).

## Related

- [Sonar Importer](/docs/importer/sonar)
- [Analysis examples](/docs/analysis/examples)
- [simplecc.sh](/docs/analysis/codecharta-shell#analyse-with-simpleccsh): scans and imports in one script
