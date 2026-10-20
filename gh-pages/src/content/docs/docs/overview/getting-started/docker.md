---
title: "Run with Docker"
description: "Map a codebase in one command with simplecc.sh in Docker, with Git, Tokei, Code Maat and SonarScanner bundled, and host the Web Studio yourself."
sidebar:
  label: Docker
---

The CodeCharta Shell and the Web Studio are published as Docker images, so you can map a codebase without installing
Node or Java. The images are on Docker Hub:

- [codecharta/codecharta-analysis](https://hub.docker.com/r/codecharta/codecharta-analysis): `ccsh` together with Git,
  Tokei, Code Maat and SonarScanner
- [codecharta/codecharta-visualization](https://hub.docker.com/r/codecharta/codecharta-visualization): the Web Studio,
  served by nginx

The analysis image is also mirrored to the GitHub Container Registry as `ghcr.io/maibornwolff/codecharta-analysis`.

You need a working [Docker](https://docs.docker.com/get-docker/) installation; the images are pulled the first time you
run them.

## Map a project

The image bundles the CodeCharta Shell with the tools it imports from. Its [`simplecc.sh`](/docs/analysis/codecharta-shell#analyse-with-simpleccsh)
runs the CodeCharta parsers together with Tokei and `complexity` (and SonarQube, when you pass a token) and merges
everything into one map. Mount the **parent folder** of your project and pass the **project's folder name**:

```bash
docker run -v "<PARENT Folder>:/mnt/src" codecharta/codecharta-analysis bash -c "git config --global --add safe.directory /mnt/src/<ProjectName>; cd /mnt/src; simplecc.sh <ProjectName>"
```

- `<PARENT Folder>`: the folder that **contains** your project. It is mounted to `/mnt/src` in the container.
- `<ProjectName>`: the name of your project's folder inside it.

For a project at `/home/user/projects/myapp`, the parent folder is `/home/user/projects` and the project name is
`myapp`:

```bash
docker run -v "/home/user/projects:/mnt/src" codecharta/codecharta-analysis bash -c "git config --global --add safe.directory /mnt/src/myapp; cd /mnt/src; simplecc.sh myapp"
```

This writes `myapp.cc.json.gz` next to your project in the parent folder, ready to load into the
[Web Studio](/docs/visualization/web-studio). The `git config` part lets Git read a repository that belongs to another
user than the one in the container; without it, the map has no git history.

The image has no `svn`, so the svn history is not available in Docker.

### Other ways to run the shell

Start a **bash shell** in the container to run `ccsh` and the bundled tools by hand:

```bash
docker run --rm -it -v "$(pwd)":"$(pwd)" -w "$(pwd)" codecharta/codecharta-analysis bash
```

Start the **interactive mode**, which suggests the analysers that fit a folder and asks for their options:

```bash
docker run --rm -it -v "$(pwd)":"$(pwd)" -w "$(pwd)" codecharta/codecharta-analysis ccsh -i
```

Run [`ccsh analyse`](/docs/analysis/analyse) on the current folder, which maps it with the parsers and the git history
but without Tokei, `complexity` and SonarQube:

```bash
docker run --rm -v "$(pwd)":"$(pwd)" -w "$(pwd)" codecharta/codecharta-analysis \
  bash -c 'git config --global --add safe.directory "$PWD" && ccsh analyse'
```

Run a **single analyser**, for example the [Unified Parser](/docs/parser/unified):

```bash
docker run --rm -v "$(pwd)":"$(pwd)" -w "$(pwd)" codecharta/codecharta-analysis ccsh unifiedparser . -o metrics.cc.json
```

This writes `metrics.cc.json.gz`, because the output is gzip-compressed by default.

## Host the Web Studio

Serve the Web Studio from your own machine:

```bash
docker run --rm -p 9000:80 codecharta/codecharta-visualization
```

Then open `http://localhost:9000` and load any `.cc.json` or `.cc.json.gz` file from your disk.

## Use docker compose

The `docker-compose.yml` at the root of the [repository](https://github.com/MaibornWolff/codecharta) starts three
services: a SonarQube server on port 9000, the Web Studio on port 9001 (9000 is taken by SonarQube) and the analysis
container, which reaches SonarQube at `http://sonar:9000`.

```bash
docker compose pull
docker compose up -d
docker exec -it codecharta-analysis bash
```

The analysis service mounts no folder: add a `volumes` entry for your project to the file, or clone the project inside
the container. See [SonarQube example](/docs/analysis/example-sonar-qube) for how to analyse a project with SonarQube and import its
metrics.
