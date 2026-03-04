---
name: fix-label-rendering-issues
issue: n/a
state: complete
version: 1
---

## Goal

Fix three label rendering issues: collision detection not running on label count change, label lines ignoring depth buffer, and Color mode not showing the correct metric values.

## Tasks

### 1. Run collision detection immediately after label count change

Currently, changing `amountOfTopLabels` (e.g. 10 to 50) creates all labels but collision detection only runs on the next Three.js render (camera move, interaction). Labels remain visible until something triggers `afterRender$`.

- After labels are created/recreated in `CodeMapRenderService.setLabels()`, trigger a collision detection pass immediately
- This ensures excess overlapping labels are hidden right away, not just on the next user interaction

### 2. Replace SVG label lines with Three.js 3D lines

Label connector lines (from label to building roof) are currently SVG overlays that always render on top of everything. They should participate in the Three.js depth buffer so buildings in front occlude the lines.

- Replace SVG line drawing in `LabelCollisionService` with Three.js `Line` or `LineSegments` objects
- Lines must have `depthTest: true` so they are occluded by buildings in front
- Lines still connect CSS2D label position to the 3D building roof position
- Update line positions each frame (same timing as current SVG update)
- Clean up SVG container creation/management code

### 3. Show correct metric value based on label mode

When `labelMode` is `Color`, labels still display the height metric value. They should show the color metric's value instead.

- In `CodeMapRenderService.setBuildingLabel()` (or wherever metric value text is set), check current `labelMode`
- If Height mode: display `node.attributes[heightMetric]`
- If Color mode: display `node.attributes[colorMetric]`

## Steps

- [x] Complete Task 3: Show correct metric value based on label mode (smallest change, quick win)
- [x] Complete Task 1: Run collision detection after label count change
- [x] Complete Task 2: Replace SVG lines with Three.js 3D lines
- [x] Run all unit tests and fix any failures

## Notes

- Task 3 is the simplest and most isolated, do it first
- Task 2 is the most invasive — the SVG line system in `labelCollision.service.ts` needs significant rework
- For Task 2, line positions must update every frame since labels are CSS2D (screen-space) but lines are 3D (world-space)
