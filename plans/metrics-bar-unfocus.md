---
name: Unfocus on the metric bar
issue: -
state: complete
version: -
---

## Goal

Offer the Unfocus tool of the dependency bar's tools tab on the metric bar too, in the 3D map and the radial layouts,
so every view that can focus can leave it from the bar. The domain view has no focus and gets none.

## Tasks

### 1. Extract the unfocus tool and divider (structural)
- Shared `cc-unfocus-tool` and `cc-bar-tools-divider`, used by the dependency tools

### 2. Unfocus on the metric bar
- 3D map tools and radial map tools reveal Unfocus while a folder is focused, followed by the divider
- Unfocus leaves every focus, as in the dependency view
- Specs, changelog entry updated

## Steps

- [x] Complete Task 1: Extract the unfocus tool and divider
- [x] Complete Task 2: Unfocus on the metric bar
- [x] Run format:check, npm test, npm run lint, tsc

## Notes

- Unfocus clears all focus levels ("Unfocus All" in the context menu); the context menu keeps stepping back one level
