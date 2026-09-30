---
name: Exploratory testing of the visualization
issue: <none>
state: complete
version: <none>
---

## Goal

Exploratory-test the visualization built from current `main` and report up to 30 bugs, time-boxed to 30 minutes.

## Tasks

### 1. Build and serve
- Build current `main` in a scratch worktree, serve it with `e2e.staticServer.mjs`

### 2. Explore
- Drive the app with Playwright: load sample files, metrics bar, sidebar explorer/inspector, radial maps, domain view,
  context menu, settings, legend, scenarios, delta mode, URL params, screenshots
- Record each bug with steps to reproduce, expected and actual behaviour

### 3. Report
- Hand the bug list to the user; no fixes

## Steps

- [x] Complete Task 1: Build and serve
- [x] Complete Task 2: Explore
- [x] Complete Task 3: Report

## Notes

- Started 2026-09-28 08:16, stop at 08:46 or 30 bugs
