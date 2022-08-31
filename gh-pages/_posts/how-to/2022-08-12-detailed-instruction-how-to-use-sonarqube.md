---
categories:
    - How-to
tags:
    - sonarimport
    - analysis
title: Detailed instruction of how to use SonarQube 9.4
---

## Analyze CodeCharta (Visualization Part) using SonarQube from zip file on Windows

1. Clone [CodeCharta](https://github.com/MaibornWolff/codecharta) from GitHub
2. [Download](https://www.sonarqube.org/downloads/) SonarQube 9.4 \
   ![download sonarqube]({{site.baseurl}}/assets/images/docs/how-to/download_sonarqube_9_4.png)
    1. Extract the downloaded zip file, jump into the folder and navigate to bin/windows-x86-64/ or any other OS
    2. double-click on `StartSonar.bat` file
    3. Wait until the terminal says `SonarQube is operational`
3. [Download](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/) the version 4.7 of SonarScanner \
   ![download_sonarscanner]({{site.baseurl}}/assets/images/docs/how-to/download_sonarscanner.png)
    1. Extract the downloaded zip file
    2. Add the `bin` directory of the sonar-scanner folder to the `%PATH%` environment variable
    3. To test if sonar-scanner works globally execute `sonar-scanner.bat -h` in your terminal
4. Open http://localhost:9000
5. Login with admin/admin \
   ![login sonarqube]({{site.baseurl}}/assets/images/docs/how-to/login_sonarqube.png)
6. Change your password
7. Create a project 'Manually' and set up a project name and key \
   ![create_project sonarqube]({{site.baseurl}}/assets/images/docs/how-to/create_project_sonarqube.png)
8. Choose 'Locally' to analyze the project
9. Generate a token and save it for later use \
   ![token sonarqube]({{site.baseurl}}/assets/images/docs/how-to/token_sonarqube.png)
10. Choose 'Other' and then 'Windows' to run analysis \
    ![analysis_setup sonarqube]({{site.baseurl}}/assets/images/docs/how-to/analysis_setup sonarqube.png)
11. Open the terminal, navigate to `CodeCharta/visualization/` project folder to analyze and execute scanner using the shown command
    > sonar-scanner.bat -D"sonar.projectKey=CodeCharta" -D"sonar.sources=." -D"sonar.host.url=http://localhost:9000" -D"sonar.login="user token"
12. After a successful execution the analyzed project is shown on localhost \
    ![analyzed_project sonarqube]({{site.baseurl}}/assets/images/docs/how-to/analyzed_project sonarqube.png)
13. Install CodeCharta analysis
    > npm i -g codecharta-analysis
14. Execute `ccsh sonarimport` in your terminal to generate a `cc.json` file to load it into [CodeCharta's Visualization](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz)
    > ccsh sonarimport "http://localhost:9000/" "CodeCharta" "--user=user token" "--output-file=output" "--merge-modules=false"
