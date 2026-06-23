---
title: "npm"
description: "Install the CodeCharta Shell via npm"
---

The CodeCharta Shell (CCSH) is published on npm, so you can install it globally and run analyses straight from your terminal.

## Prerequisites

- Node **>= 20**
- Java **>= 11**

## Install the CodeCharta Shell

Install the `codecharta-analysis` package globally and verify the installation:

```bash
# Install the CodeCharta Shell globally
npm install -g codecharta-analysis

# Verify the installation (some terminals need to be restarted first)
ccsh -h
```

## Analyze a project with CCSH

### Generate your first map

Every parser and importer produces its own metrics — see [CodeCharta Shell](/docs/analysis/codecharta-shell) for an overview of the available tools. In this example we use the [Unified Parser](/docs/parser/unified), as it works on nearly every codebase:

```bash
# -o      output file name
# <path>  the project or file you want to analyze
ccsh unifiedparser -o=tutorial <path/to/your/project>
```

This generates a `tutorial.cc.json.gz`, ready to be opened in the Web Studio.

### Other ways to run CCSH

If you are not sure which tool to use, run the shell in **interactive mode** — it suggests applicable parsers for a given path and guides you through the configuration:

```bash
# guided, interactive analysis
ccsh -i
```

You can also call any tool directly — for example an importer:

```bash
ccsh csvimport example.csv -o=example
```

See [CodeCharta Shell](/docs/analysis/codecharta-shell) for interactive mode, parser suggestions, combining multiple metrics, and more.

## Open your map in the Web Studio

Open the [Web Studio](https://codecharta.com/visualization/app/index.html?file=codecharta_visualization.cc.json.gz&file=codecharta_analysis.cc.json.gz&area=rloc&height=sonar_complexity&color=sonar_complexity&edge=avgCommits&currentFilesAreSampleFiles=true) and load your `tutorial.cc.json.gz` with the folder-open button (**Load cc.json files**) in the top-left — see [Upload](/docs/visualization/user-controls/upload) for details. You can now explore your codebase to your heart's content.
