---
name: Screenshot button in the dependency view
issue: -
state: complete
version: -
---

## Goal

The dependency view gets the same screenshot button (and Ctrl+Alt+S / Ctrl+Alt+F hotkeys) as the metrics and domain views.

## Tasks

### 1. Register the dependency graph chart
- Add `DependencyGraphChartRegistry` (a `ChartRegistry`) with its own lightweight facade, like the word cloud and radial map
- `DependencyGraphHost` registers the chart on attach and unregisters it on dispose

### 2. Screenshot service
- `DependencyGraphScreenshotService` extends `ChartScreenshotService`, subject "dependency graph", file suffix "dependencies"

### 3. Button
- Show `cc-toolbox-screenshot-button view="dependencies"` at the top right of the dependency map while a graph is drawn

## Steps

- [x] Complete Task 1: Register the dependency graph chart
- [x] Complete Task 2: Screenshot service
- [x] Complete Task 3: Button
- [x] Changelog, checks
