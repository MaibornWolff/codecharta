---
title: "Data privacy"
description: "CodeCharta analyses and visualizes your code on your own machine: no upload, no tracking, no telemetry. Here is what stays local and how to run offline."
---

CodeCharta analyses and visualizes your code on your own machine. Your source code, its history and the metrics
derived from it are not uploaded, shared or sent to any service unless you share them yourself.

## What stays on your machine

- **Analysis**: the CodeCharta Shell (`ccsh`) reads your code and its git or svn history locally and writes the map to
  a file on your disk.
- **Visualization**: the Web Studio runs in your browser. When you use it at
  [codecharta.com](https://codecharta.com/visualization/app/index.html), the `.cc.json` files you load are read in the
  browser and not uploaded to a server.
- **No tracking**: CodeCharta contains no analytics, telemetry or usage tracking. GitHub may apply its own analytics
  when you visit the repository on GitHub; that is outside CodeCharta.

## Run offline

Both parts work without an internet connection once they are installed:

- **Analysis**: `npm i -g codecharta-analysis`, or the [Docker image](/docs/overview/getting-started/docker)
- **Visualization**: the [desktop app](/docs/overview/getting-started/desktop), or the
  [Web Studio Docker image](/docs/overview/getting-started/docker#host-the-web-studio) on your own server

## When data leaves your machine

Data leaves your machine only when you choose to send it, for example when you:

- share a `.cc.json` file with colleagues or commit it to version control
- host maps on your own server for your team
- send a link that loads a map from a URL: the link carries the file location and the settings, not the map itself

## Check it yourself

CodeCharta is open source on [GitHub](https://github.com/MaibornWolff/codecharta). You can read the code to verify
these points, or build and run your own instance from [source](/docs/overview/getting-started/local).
