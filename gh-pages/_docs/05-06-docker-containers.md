---
permalink: /docs/docker-containers/
title: "Docker Containers"
---

CodeCharta also comes as a full Docker environment, where all supported tools come pre-installed. To start all
containers, you can type `docker compose pull && docker compose up --detach` while you're in the same directory as our
docker-compose.yml

## The Container Landscape

| Container-Name           | Description                             | How to use                                                      |
| ------------------------ | --------------------------------------- | --------------------------------------------------------------- |
| sonar                    | Hosts an instance of SonarQube          | localhost:9000 in the browser, follow the steps for Linux       |
| codecharta-visualization | Runs the visualisation part o CodeChara | localhost:9001, load files from your hard-drive                 |
| codecharta-analysis      | Contains all tools the ccsh can import  | Connect via terminal `docker exec -it codecharta-analysis bash` |

> To see the actual names of the containers on your system, run `docker ps`

All containers share a volume for the quick transfer of files. You can find it under /mnt/data in each container.
Please note that you will need to copy finished cc.json files to **your** hard-drive to open them in Visualization.

### Sonar

See also [SonarQube Docs](https://docs.sonarqube.org/latest/setup/get-started-2-minutes/)

Open `localhost:9000` in your browser and log in with

-   login: admin
-   password: admin

Simply follow the steps for a manual, local project under Linux. You can also [check our tutorial for SonarQube](
{{site.baseurl}}{% link _docs/analyze-with-sonarqube.md %})
The sonar-scanner is already pre-installed in our analysis container.

### codecharta-visualization

See also [CodeCharta Visualization]({{site.baseurl}}{% link _docs/visualization.md %})

Open `localhost:9001` in your browser and open any file you want from your hard drive.
To open files you have created in the analysis container, copy them over using `docker cp`

### codecharta-analysis

See also [CodeCharta Analysis]({{site.baseurl}}{% link _docs/analysis.md %})

Almost all tools the ccsh can import data from are included in the container, so you can get started immediately.
Installed are:

-   CodeCharta Shell `ccsh`
-   Git `git`
-   Tokei `tokei`
-   CodeMaat `java -jar /opt/codemaat/codemaat.jar`
-   MetricGardener `metric-gardener`
-   SonarScanner `sonar-scanner`

Once you have your .cc.json file ready, you can copy it to your machine.
This is how the command could look like if I want to copy a file from the container to my current working directory:

```bash
docker cp codecharta-analysis:/root/junit4.cc.json.gz junit4.cc.json.gz
```

To check the name of the container, you can simply type `docker ps`.
To analyze your code you can follow one of our quick-start guides or check out the in-depth documentation for a certain
importer.
