---
name: Focus re-roots the 3D map
issue:
state: complete
version:
---

## Goal

Focusing a folder in the metrics view lays the 3D map out with that folder as its root, as the
dependency and radial maps already do, so it fills the map and gets floor labels, floor colours and
ground level as if it were the whole project.

## Tasks

### 1. Resolve the focused node in the render model
- A `focusedNodeSelector` resolves the focused path to its node, exported through the facade

### 2. Lay out from the focused folder
- `CodeMapRenderService.getNodes` hands the focused folder to every 3D layout (treemap and streets)
- Node depth counts from the layout root, so floor colours and floor labels start at the focused folder
- A focused fixed folder is laid out at full map size
- Visibility no longer filters by focus, the layout holds nothing outside it
- Floor labels are drawn for any layout root, not only the node with id 0

### 3. Keep the project-wide scales
- Heights and colours stay scaled against the whole project (decision), including the street height scale

## Steps

- [x] Complete Task 1: Resolve the focused node in the render model
- [x] Complete Task 2: Lay out from the focused folder
- [x] Complete Task 3: Keep the project-wide scales
- [x] Run format, tests, lint and type check
- [x] Update the changelog

## Notes

- Decisions (asked): re-root instead of keeping the cut-out slice, whole-project scales, all 3D layouts
- Radial, dependency and metrics-bar selectors still resolve the focused node themselves; they can
  move to `focusedNodeSelector` in a separate structural commit
