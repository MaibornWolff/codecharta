---
name: Bar tools tab
issue: -
state: complete
version: -
---

## Goal

Move the view tools that float top-right over each view (center map, flashlight, screenshot, show whole graph,
reset layout, unfocus) into a small tab on the top-right edge of the metrics, domain and dependency bar. Each tool
is an icon whose name slides open on hover or keyboard focus, pushing its neighbours aside (design option 05).

## Tasks

### 1. Rename the view-cube toolbox feature (structural)
- `features/viewCubeToolbox` → `features/mapTools`; the toolbox component and its stores follow the new name
- No behaviour change; own commit

### 2. Shared tab and tool
- `cc-bar-tools-tab`: the tab riding on the bar's top-right edge, mirroring the Layout tab
- `cc-bar-tool`: icon button, label left of the icon opens in ~120ms on hover/focus-visible (none with reduced
  motion); `pressed` for toggles, `revealed` slides a contextual tool in and out and makes it inert while hidden
- The metrics and domain bars take their tools from the view through content projection

### 3. Wire the bars
- Metrics bar: center map (right-click zoom menu), flashlight, screenshot; radial layout only screenshot
- Domain bar: screenshot; remove the domain toolbox feature
- Dependency bar: unfocus and reset layout appear only when they apply, then show whole graph and screenshot; the
  View segment goes away
- Remove the old toolboxes from the view cube, radial map, dependency map and domain view

### 4. Tests, e2e, changelog
- Specs for the new shared components, updated specs for moved buttons, e2e locators
- CHANGELOG entry

## Steps

- [x] Complete Task 1: Rename the view-cube toolbox feature
- [x] Complete Task 2: Shared tab and tool
- [x] Complete Task 3: Wire the bars
- [x] Complete Task 4: Tests, e2e, changelog
- [x] Run format:check, npm test, npm run lint, tsc

## Notes

- Design canvas: https://claude.ai/artifact/AxgAWPz5ixdxFai1nt5u7K, prototype: https://claude.ai/artifact/GxV2QkwMHMEE3MhKqSzyN9
- View cube and zoom slider stay on the canvas
- No click confirmations in the label; the pressed tint shows the flashlight state
- The screenshot button keeps its SCREENSHOT_CAPTURE provider; each tools component provides the capture of its view
- Verified: full unit suite, lint, tsc, format, 42 e2e tests of the touched views, screenshots of each tab at rest and
  on hover
