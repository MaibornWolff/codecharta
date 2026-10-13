---
name: analysis-bundle-workflow
issue: none
state: progress
version: next analysis release
---

## Goal

Get the analysis bundles of any branch from CI without releasing, so they can be downloaded and tested
by hand on Windows before a release publishes to npm.

## Tasks

### 1. Manually started bundle workflow
- `.github/workflows/bundle-analysis.yml`, `workflow_dispatch` only
- Build the distribution zip and the npm tarball the way the release does
- Fail when the npm tarball comes out without `ccsh`
- Upload both as one artifact named after the commit

### 2. Try it out
- Merge to `main` (GitHub only offers a manual workflow that exists on the default branch)
- Run it on the release candidate, download the artifact, install on Windows

## Steps

- [x] Complete Task 1: Manually started bundle workflow
- [ ] Complete Task 2: Try it out

## Notes

- No Windows job: the test stays manual on purpose
- `npm pack` verified locally, the tarball holds `public/bin/ccsh.bat` and the fat jar
