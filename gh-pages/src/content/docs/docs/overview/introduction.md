---
title: "Introduction"
description: "What CodeCharta is, who it is for and how it turns a codebase into code maps of metrics, domain language and dependencies."
---

CodeCharta is an open-source code visualization tool. It turns a codebase into a map you can explore: a 3D city of code
metrics, a word cloud of its domain language and a graph of its dependencies. The map makes the shape of the code
visible, so you can find the hotspots, show them to others and agree on what to change first.

## Three views of one map

- **[Metric view](/docs/visualization/user-controls/code-map)**: every file is a building, every folder a district. You
  choose what area, height and color stand for, such as lines of code, complexity, number of commits or number of
  authors.
- **[Domain view](/docs/visualization/user-controls/domain-view)**: the words in identifiers, comments and strings,
  sized by frequency or TF-IDF. It shows what a folder is about, not how big it is.
- **[Dependencies view](/docs/visualization/user-controls/dependency-view)**: folders and files arranged by level, with
  dependency cycles and dependencies that point against the layering marked.

[Compare](/docs/visualization/user-controls/compare) puts two versions of a map side by side as one delta map, and
[3D print](/docs/visualization/user-controls/3d-print) turns the city into a model you can hold.

## Who it is for

CodeCharta is built for developers and tech leads who need to understand a codebase quickly or talk about it with
people who do not read code. Typical questions it answers:

- Which files are large, complex and changed all the time?
- Which parts of the code does only one person know?
- Which files always change together, even without depending on each other?
- What is this folder about, and where does a business term live in the code?
- Where do the dependencies run in circles or against the architecture?
- What changed between two releases?

MaibornWolff develops CodeCharta and uses it in its [Software Health Checks](/docs/overview/service-offerings), where
the map helps teams and managers talk about the same parts of the code.

## How it works

CodeCharta has two parts:

1. The **[CodeCharta Shell](/docs/analysis/codecharta-shell)** (`ccsh`) analyses your code, reads the git or svn
   history, imports metrics from tools such as SonarQube, and writes the result into one `.cc.json` file.
   `ccsh analyse` does all of this in one step.
2. The **[Web Studio](/docs/visualization/web-studio)** opens that file and renders it as an interactive map. It runs
   in your browser or as a desktop app.

Both run on your machine. Your code and your metrics are not uploaded anywhere; see
[Data privacy](/docs/overview/data-privacy).

## Next steps

- Try the [live demo](https://codecharta.com/visualization/app/index.html?file=codecharta_visualization.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true)
  with CodeCharta's own code.
- Map your own project with [Getting started](/docs/overview/getting-started).
- Learn the interface in the [interface overview](/docs/visualization/user-controls).
