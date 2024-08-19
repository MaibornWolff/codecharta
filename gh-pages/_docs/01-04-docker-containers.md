---
permalink: /docs/docker-containers/
title: "Docker Containers"

toc: true
toc_sticky: true
toc_label: "Jump to Section"
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

[//]: # "TODO: change this to an how to run docker containers, not only for vis"

# Docker Hub Install

The visualization is [published to Docker Hub](https://hub.docker.com/r/codecharta/codecharta-visualization).

## Visualization

```bash
# run visualization with
docker run -p 80:8080 codecharta/codecharta-visualization
```

## Sonar

See also [SonarQube Docs](https://docs.sonarqube.org/latest/setup/get-started-2-minutes/)

Open `localhost:9000` in your browser and log in with

- login: admin
- password: admin

Simply follow the steps for a manual, local project under Linux. You can also [check our tutorial for SonarQube](
{{site.baseurl}}{% link _docs/02-05-analyze-with-sonarqube.md %})
The sonar-scanner is already pre-installed in our analysis container.

## codecharta-visualization

See also [CodeCharta Visualization]({{site.baseurl}}{% link _docs/04-01-visualization.md %})

Open `localhost:9001` in your browser and open any file you want from your hard drive. To open files you have created in
the analysis container, copy them over using `docker cp`

## codecharta-analysis

See also [CodeCharta Analysis]({{site.baseurl}}{% link _docs/02-01-analysis.md %})

Almost all tools the ccsh can import data from are included in the container, so you can get started immediately.
Installed are:

- CodeCharta Shell `ccsh`
- Git `git`
- Tokei `tokei`
- CodeMaat `java -jar /opt/codemaat/codemaat.jar`
- MetricGardener `metric-gardener`
- SonarScanner `sonar-scanner`

Once you have your .cc.json file ready, you can copy it to your machine.
This is how the command could look like if I want to copy a file from the container to my current working directory:

```bash
docker cp codecharta-analysis:/root/junit4.cc.json.gz junit4.cc.json.gz
```

To check the name of the container, you can simply type `docker ps`.
To analyze your code you can follow one of our quick-start guides or check out the in-depth documentation for a certain
importer.

### Hands-On

Example execution of `codecharta-analysis` from the compose project:

```bash
docker run -it -v $(pwd):/src -w /src codecharta/codecharta-analysis ccsh gitlogparser repo-scan --repo-path /src -o my-project.cc.json -nc

# Explanation
# -it = interactive, tty-Terminal: Connects your terminal to the execution of your command
# -v = virtual-mount: Mount your current working directory inside the container to /src
#               Hint: You need to mount a absolute path, $(pwd) will print your working directory
# -w = working-directory:  Starting point of your command, in this case the /src folder where the directory was mounted to
# codecharta/codecharta-analysis: tag of the image
# gitlogparser [...] : check the gitlogparser documentation for more info
```

> Be aware, that by default the user inside the docker image is 'ubuntu' with an ID of 1000. You may
> encounter errors with `git` when you try to execute commands inside a repository cloned by a different `UID`

> For **macOS users**, it is necessary to add `--user=501:dialout` Before the image name. Why? Because docker on mac is fun :)

## Build it yourself

You can also build a docker image from the locally installed instance of codecharta. To do this, you would execute the following commands:

```bash
# to build the container you need to navigate into the analysis folder
cd analysis

# makes a clean build to ensure everything will be built correctly
./gradlew clean build

# builds the docker container with an image name of your choice
docker build . -t your-image-name

# executes bash inside of the created container
docker run -it your-image-name bash

# to run the docker container with your current working directory mounted into it,
# you can alternatively run this
docker run -it -v $(pwd):/src -w /src your-image-name bash
```

There is also the option to customize the used docker user during the build.
This will create a new user with the given name and IDs.

```bash
#USER_ADD: set it to any value to to add a new user
#USERNAME: the name of the user to be created
#USER_ID: the ID that is used for the new user and for its group
docker build ./analysis -t local-ccsh --build-arg USER_ADD=true --build-arg USER_ID=1001 --build-arg USERNAME=your_name
```
