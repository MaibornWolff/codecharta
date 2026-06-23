---
title: "Docker"
description: "Run CodeCharta with Docker"
---

Both the CodeCharta Shell (CCSH) and the Web Studio are published as Docker images, so you can use CodeCharta without installing anything locally. The images are available on Docker Hub:

- [codecharta-analysis](https://hub.docker.com/r/codecharta/codecharta-analysis)
- [codecharta-visualization](https://hub.docker.com/r/codecharta/codecharta-visualization/)

All you need is a working [Docker](https://docs.docker.com/get-docker/) installation — the images are pulled automatically the first time you run them.

## Analyze a project with CCSH

The `codecharta-analysis` image bundles the CodeCharta Shell together with all the tools it can import from (Git, Tokei, CodeMaat, SonarScanner, …), so you can analyze a project straight away.

### Quick analysis with simplecc.sh

The fastest way to get a code map is `simplecc.sh`, which combines several analyzers into one well-rounded result. Mount the **parent folder** that contains your project into the container and pass your **project's folder name**:

```bash
docker run -v "<PARENT Folder>:/mnt/src" codecharta/codecharta-analysis bash -c "git config --global --add safe.directory /mnt/src/<ProjectName>; cd /mnt/src; simplecc.sh <ProjectName>"
```

- `<PARENT Folder>` — the directory that **contains** the project you want to analyze. It is mounted to `/mnt/src` inside the container.
- `<ProjectName>` — the name of your project's folder inside that parent directory.

For example, if your project lives at `/home/user/projects/myapp`, then the parent folder is `/home/user/projects` and the project name is `myapp`:

```bash
docker run -v "/home/user/projects:/mnt/src" codecharta/codecharta-analysis bash -c "git config --global --add safe.directory /mnt/src/myapp; cd /mnt/src; simplecc.sh myapp"
```

This writes a `myapp.cc.json.gz` next to your project in the parent folder, ready to be imported into the [Web Studio](/docs/visualization/web-studio).

### Other ways to run CCSH

`simplecc.sh` is just a convenient preset. You can also run the shell directly for full control over which parsers and importers to use. The examples below mount your current working directory into the container with `$(pwd)` — note that Docker requires an absolute path here.

Start an interactive **bash shell** inside the container to run `ccsh` and the other bundled tools by hand:

```bash
docker run --name codecharta-analysis -it -v $(pwd):$(pwd) -w $(pwd) codecharta/codecharta-analysis bash
```

Start the **guided interactive mode**, which walks you through the parsing and analysis step by step:

```bash
docker run --name codecharta-analysis -it -v $(pwd):$(pwd) -w $(pwd) codecharta/codecharta-analysis ccsh
```

Or run a **specific analyzer** directly — for example the [Unified Parser](/docs/parser/unified) on the current directory:

```bash
docker run --name codecharta-analysis -it -v $(pwd):$(pwd) -w $(pwd) codecharta/codecharta-analysis ccsh unifiedparser .
```

## Run the Web Studio offline

You can also run the Web Studio locally instead of in the browser:

```bash
docker run -p 9000:80 codecharta/codecharta-visualization
```

This pulls the visualization image and serves the Web Studio at `localhost:9000`, where you can open any `.cc.json` file from your hard drive.
