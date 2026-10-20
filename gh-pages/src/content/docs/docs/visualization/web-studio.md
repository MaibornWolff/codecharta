---
title: "Web Studio"
description: "Explore your code metrics as an interactive 3D code map, a word cloud and a dependency graph in the CodeCharta Web Studio, online or on your machine."
---

The Web Studio is the visualization part of CodeCharta. It opens the `.cc.json` maps the
[CodeCharta Shell](/docs/analysis/codecharta-shell) writes and shows them as an interactive 3D code map, so hotspots,
large files and complex code stand out at a glance. Depending on what was analysed, the same map can also be read as a
word cloud of its domain language and as a graph of its dependencies. See [Views](/docs/visualization/user-controls/views).

![The Web Studio showing CodeCharta's own code as a 3D code map in the Metric view](/assets/images/docs/visualization/web-studio.jpeg)

## Try it online

Open the hosted [Web Studio](https://codecharta.com/visualization/app/index.html?file=codecharta_visualization.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true)
in your browser. It starts with two sample maps of CodeCharta's own code, so you can look around before you analyse
anything. To open your own map, use the folder button in the top bar. See
[Loading maps](/docs/visualization/user-controls/loading-maps).

## Run it yourself

The Web Studio also runs on your machine: from npm, as a Docker container, or as a desktop app for Windows, macOS and
Linux. See [Getting started](/docs/overview/getting-started) for each option.

## Your data stays local

The Web Studio runs entirely in your browser. A map you open is read on your machine and is not uploaded anywhere,
also on the hosted version. See [Data privacy](/docs/overview/data-privacy).

The Web Studio remembers the loaded maps and your settings in the browser, so a reload brings you back to where you
left off. **Reset map to default** in the [Settings](/docs/visualization/user-controls/settings) clears them.

## What's new after an update

The first time you open a newer version, the **What's new in CodeCharta?** dialog lists the changes since the version
you used last. **View full changelog** opens the release notes on GitHub, **Got it** closes the dialog.

## Related

- [Interface overview](/docs/visualization/user-controls)
- [Getting started](/docs/overview/getting-started)
- [Keyboard and mouse shortcuts](/docs/visualization/user-controls/keyboard-shortcuts)
