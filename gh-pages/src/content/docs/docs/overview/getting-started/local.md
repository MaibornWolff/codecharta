---
title: "Build from source"
description: "Build the CodeCharta Shell and the Web Studio from source to run the latest development version or to contribute to CodeCharta."
sidebar:
  label: From source
---

Build both parts from the [repository](https://github.com/MaibornWolff/codecharta) to run the latest development
version or to work on CodeCharta yourself.

## Prerequisites

- Git
- Java **>= 22**. The build compiles with JDK 25, which Gradle downloads when it is missing.
- Node **22.22.3** or newer on 22.x, **24.15** or newer on 24.x, or **26** and newer

## Clone the repository

```bash
git clone https://github.com/MaibornWolff/codecharta
cd codecharta
```

## Build the CodeCharta Shell

The analysis is a Kotlin project built with Gradle. Run every Gradle command from the `analysis` folder:

```bash
cd analysis
./gradlew installDist
```

The build puts `ccsh` into `build/install/codecharta-analysis/bin/`. It works like the installed `ccsh`, for example
with [`ccsh analyse`](/docs/analysis/analyse):

```bash
./build/install/codecharta-analysis/bin/ccsh -h
./build/install/codecharta-analysis/bin/ccsh analyse path/to/your/project
```

The map lands in the current folder as `<project folder name>.cc.json.gz`. See
[CodeCharta Shell](/docs/analysis/codecharta-shell) for every command.

## Build and run the Web Studio

The visualization is an Angular application. From the repository root:

```bash
cd visualization
npm install
npm run dev
```

`npm run dev` starts a development server with the Web Studio, where you can load the maps the shell writes.

For a production build, and to start the desktop app from it:

```bash
npm run build
npm run start
```

## Contribute

The [contribution guide](https://github.com/MaibornWolff/codecharta/blob/main/dev_docs/CONTRIBUTING.md) and the
[developer start guide](https://github.com/MaibornWolff/codecharta/blob/main/dev_docs/DEV_START_GUIDE.md) explain the
workflow, the tests and the checks a pull request has to pass.
