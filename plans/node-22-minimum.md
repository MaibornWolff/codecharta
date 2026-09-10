---
name: Raise the Node minimum to 22.19
issue: <none>
state: complete
version: 1
---

## Goal

Node 20 is end-of-life since 2026-04-30. Require Node 22.19 (Node 22 is supported until 2027-04) wherever
the project states a minimum, and ship Node 24 in the analysis Docker image. Revisit >= 24 when Node 22 ends.

## Tasks

### 1. Minimum version
- `engines` in the root, visualization and node-wrapper package.json, plus each lockfile's root entry
- CLAUDE.md, dev_docs/DEV_START_GUIDE.md, gh-pages/README.md and the docs-site pages that list prerequisites

### 2. Docker image
- analysis/Dockerfile installs Node 24 from NodeSource instead of 20

### 3. Changelog
- one Changed entry each in visualization and analysis

## Steps

- [x] Complete Task 1: Minimum version
- [x] Complete Task 2: Docker image
- [x] Complete Task 3: Changelog

## Notes

- Real minimums per area (engines of every non-platform package in the lockfiles): analysis package 22.0,
  visualization package 22.12 (Angular 21), visualization development 22.13 (jsdom, watskeburt; enforced by
  `engine-strict=true`), docs site 22.19 (undici 8 via astro → unifont). One number everywhere: 22.19.
- CI and visualization/.node-version already use Node 24; Electron bundles its own Node.
- The analysis image builds on 2026-09-10 (arm64, legacy builder) and installs Node 24.21.0 from NodeSource.
- Node in the image is a leftover of Metric Gardener (npm-installed, support removed in #4000); kept on
  purpose, sonar-scanner's JS/TS analysis may use it.
