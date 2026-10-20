---
title: "Getting started"
description: "Map your own codebase in three steps with ccsh analyse, then choose how to run CodeCharta: npm, Docker, the desktop app or a build from source."
sidebar:
  label: Overview
---

You get from source code to an interactive code map in three steps: install the CodeCharta Shell, analyse your
project, open the map. To look around first, open the
[live demo](https://codecharta.com/visualization/app/index.html?file=codecharta_visualization.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true)
with CodeCharta's own code.

## Quick start

You need Node 22.19 or newer and Java 22 or newer.

1. Install the [CodeCharta Shell](/docs/analysis/codecharta-shell):

   ```bash
   npm i -g codecharta-analysis
   ```

2. Analyse your project:

   ```bash
   cd my-project
   ccsh analyse
   ```

   [`ccsh analyse`](/docs/analysis/analyse) runs an opinionated selection of parsers and options to get you started,
   adds the git or svn history and writes the map to `my-project.cc.json.gz` in the current folder.

3. Open the [Web Studio](https://codecharta.com/visualization/app/index.html) and load `my-project.cc.json.gz` with the
   folder button (**Load cc.json files**). See [Loading maps](/docs/visualization/user-controls/loading-maps).

## Choose how to run CodeCharta

| Option | What you get | Needs |
| --- | --- | --- |
| [npm](/docs/overview/getting-started/npm) | `ccsh` on your machine, the most direct way to analyse | Node, Java |
| [Docker](/docs/overview/getting-started/docker) | `ccsh` with Git, Tokei, Code Maat and SonarScanner bundled, and a self-hosted Web Studio | Docker |
| [Desktop app](/docs/overview/getting-started/desktop) | the Web Studio as an app for Windows, macOS and Linux | nothing, or Node for the npm package |
| [From source](/docs/overview/getting-started/local) | the latest development version of both parts | Git, Node, Java |

The Web Studio at codecharta.com runs entirely in your browser: the map you load is not uploaded. See
[Data privacy](/docs/overview/data-privacy).

## Next steps

- Find your way around the map in the [interface overview](/docs/visualization/user-controls).
- Add metrics from SonarQube, coverage reports and other tools with the [importers](/docs/analysis/codecharta-shell).
- Check every build against your own limits with the [quality gate](/docs/analysis/quality-gate).
