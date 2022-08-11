---
categories:
    - How-To-SonarQube
tags:
    - sonarimport
    - analysis
title: "Analyze a project with SonarQube"
---

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
