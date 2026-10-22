---
name: Dependency view needs edge metrics
state: complete
version: 1
---

## Goal

The Dependencies tab shows only when the loaded files carry dependency levels and at least one edge with an edge
metric (any metric, not only `dependencies`). Otherwise the tab is hidden and opening the view redirects to the map.

## Tasks

### 1. Availability selector
- `hasDependencyDataSelector`: a visible file carries levels AND a visible file carries an edge with an edge metric (unaffected by excludes)

### 2. Redirect
- `isLoadedFileSetWithoutDependencyLensSelector`: true when no visible file has levels or no visible file has an edge
  metric, so the redirect-away effect also fires for files without edges

### 3. Changelog
- Fixed entry in `visualization/CHANGELOG.md`

## Steps

- [x] Complete Task 1: Availability selector
- [x] Complete Task 2: Redirect
- [x] Complete Task 3: Changelog

## Notes

- Visualization only; the DependencyParser keeps writing levels for projects without dependencies
- Declaration-level edges inside a file carry no edge metric and do not count
