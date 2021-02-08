---
categories:
    - How-to
tags:
    - jenkins
    - sonarimport
title: Integrating CodeCharte into a Jenkins 2 and Sonarqube pipeline
---

This writeup documents a way to use CC in a Jenkins 2 Pipeline. CC will take your project analysis and publish the CodeCharta web-application as an artifact.

# Prerequisites

-   Jenkins 2 with a Pipeline for your project
-   An integrated Sonarqube analysis in your pipeline
-   Bash or similar
-   JRE 8 (Oracle Java or OpenJDK)

# Base Configuration

1. Download latest `codecharta-analysis.zip`, it contains the analysis component to retrieve the Sonarqube analysis
2. Download latest `codecharta-web.zip`, it contains the CodeCharta web-application
3. Unzip both to a accessible location on your jenkins server. Remember to make the directories readable by the Jenkins user. We will call those directories `ANALYSIS_DIR` and `WEB_DIR` in this guide.
4. Set your global Jenkins configuration to allow loading resources from your artifact folders
    - This can be done by executing `System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")` in the Jenkins Script Console. Warning: This may be a security flaw.
    - [Further Reading, other methods and security details](https://wiki.jenkins.io/display/JENKINS/Configuring+Content+Security+Policy)
5. Set your Markup Formatter to Safe HTML (for rendered HTML in build descriptions) under your Jenkins Security Settings to enable rendering of HTML tags in your descriptions.

# Pipeline Steps

## Analysis

The first step is to analyze your code with a CodeCharta supported system. This step can differ for each supported system. We will use a Sonarqube analysis as an example.

```groovy
stage('Code Analysis') {
	/* Execute code analyses with SonarQube and post results */
	withSonarQubeEnv('SonarQube Server') {
	  sh "${SONAR}/bin/sonar-scanner"
	}
	step([$class: 'JacocoPublisher'])
	junit allowEmptyResults: true, testResults: '**/target/surefire-reports/*.xml'
}
```

Next, we need to generate a CodeCharta json file from our analysis results. Our resulting CodeCharta json file should be published as an artifact.
`CCSH_DIR` is the path to our downloaded analysis binaries e.g. `ANALYSIS_DIR/ccsh`. The generated file will be named `cc.json`. We assume that the sonarqube server instance is
reachable at `http://mysonarqubeinstance.com` and the project key of our project is `our:project:key`.

```groovy
stage('Generate Metrics') {
	sh "${CCSH_DIR} sonarimport -o cc.json http://mysonarqubeinstance.com our:project:key"
	archiveArtifacts artifacts: 'cc.json'
}
```

## Visualization

Now we can copy the downloaded web-application to our workspace.

```groovy
stage('Provide CodeCharta') {
	sh "cp -r ${WEB_DIR} ."
}
```

The last step is linking our the visualization with the generated cc.json and write the link to the build description. This allows convenient configuration and publishing of different views.

```groovy
stage('Provide Analysis And Set Description Links') {
	archiveArtifacts artifacts: 'CodeCharta/**/*'
	def cc1 = "<a href='${BUILD_URL}artifact/CodeCharta/index.html?file=../cc.json&areaMetric=complexity&heightMetric=ncloc&colorMetric=ncloc'>First view on cc.json</a>"
	def cc2 = "<a href='${BUILD_URL}artifact/CodeCharta/index.html?file=../cc.json&areaMetric=ncloc&heightMetric=complexity&colorMetric=complexity'>Second view on cc.json</a>"
	currentBuild.setDescription(cc1 + "<br />" + cc2);
}
```
