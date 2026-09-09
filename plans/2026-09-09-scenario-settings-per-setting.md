---
name: Scenarios — save and load every metrics-bar setting, chosen setting by setting
issue: -
state: complete
version: vis 2.1.1
---

## Goal

A scenario captures every setting the metrics bar can change plus the camera, and both the save and
the apply dialog let the reader pick what goes in and what comes out, setting by setting, grouped the
way the bar groups them.

## What is captured today, and what is missing

Saved already: the four metric selections, distribution metric, colour/height link, colour range,
gradient mode, all map colours (including the invert flags, edge colours and marking colours),
camera position and target, blacklist, focused node, marked packages and every label setting except
one.

Missing — all of them reachable from the bar:

| Bar group | Missing setting |
| --- | --- |
| Area | Margin, Invert Area |
| Height | Height scaling, Invert Height |
| Edge | Preview amount, Curve height, Show outgoing, Show incoming, Only nodes with edges, Disable edge metric |
| Labels | Top-labels scope (all maps / per map) |

Camera needs nothing new: zoom is the position-to-target distance, and orientation follows from
looking at the target. Layout algorithm, white background and hide-flat-buildings belong to the
global configuration dialog, not the bar — out of scope.

## Tasks

### 1. Describe scenario settings in one registry

- Replace the five hard-coded sections (`metrics`, `colors`, `camera`, `filters`,
  `labelsAndFolders`) with groups that mirror the bar: `area`, `height`, `color`, `edge`, `labels`,
  `camera`, `filters`.
- One registry entry per setting carries its group, the label the bar uses for it, how to read it
  from state (or from the camera), and the state patch that applies it. Building, applying, listing
  and the picker UI all read this registry, so a new setting is added in one place.
- Group membership follows the bar, control by control: folder colour overrides (marked packages) sit
  with Colour, not with Labels; the metric selection of each segment sits in that segment's group; the
  colour bands and the invert toggle are one Colour setting, while the outgoing and incoming edge
  colours — edited in the Edge popover — are Edge settings. Colours with no control on the bar (base,
  flat, label colour, marking colours) ride along with the bands.
- Save only what a control can change: height scaling stores `y`, since x and z have no control.
- Every setting is individually optional in a scenario. A scenario that omits one leaves the current
  value alone — the state patch walker already skips absent values.
- Drop `distributionMetric`: nothing but the initial file load sets it, so a scenario carrying it
  would be a setting no reader can see or opt out of. The version 1 translation omits it.

### 2. Read old scenarios

- Bump the `.ccscenario` schema to 2 and translate version 1 files and stored scenarios into groups
  on read, so saved and exported scenarios keep working: metrics split across the four segment
  groups, colours and marked packages into Colour, labels into Labels, camera and filters unchanged.
- Rewrite the built-in scenarios in the new shape.

### 3. Choose what to save

- The save dialog gains a collapsed "Extended settings" block under the description, listing the
  groups with their settings. Everything starts checked except Camera, which starts unchecked; a
  group checkbox checks or clears its settings and shows a partial state in between.
- Saving stores only the checked settings; unchecked ones are absent from the scenario, so the apply
  dialog and the list badges never offer them.

### 4. Choose what to apply

- The apply dialog uses the same picker, listing only what the scenario actually holds, so a reader
  can take a scenario's colours without its margins.
- Keep the two ordering constraints the current applier relies on: metric selections are patched
  before the settings that effects derive from them (changing the colour metric recalculates the
  colour range, changing the edge metric clamps the preview amount), and the camera is moved last
  with the existing auto-fit suppression.
- The missing-metric warning reads the metric selections from their new groups.

### 5. Tests and changelog

- Registry read/apply round trip, version 1 translation from a stored fixture and an imported file,
  saving with a partial selection, apply ordering, the picker's group/partial behaviour, both
  dialogs. Keep the suite at or above the 80% gate.
- Update the scenario e2e page object for the new save dialog markup.
- One Added entry in `visualization/CHANGELOG.md`.

## Steps

- [x] Complete Task 1: Describe scenario settings in one registry
- [x] Complete Task 2: Read old scenarios
- [x] Complete Task 3: Choose what to save
- [x] Complete Task 4: Choose what to apply
- [x] Complete Task 5: Tests and changelog

## Notes

- Decisions taken with the user: groups mirror the bar, selection is per setting, the save picker is
  collapsed with everything checked, Camera starts unchecked.
- The camera also starts unchecked in the apply dialog, for the reason the user gave for the save
  default: opening a scenario should never move the view unasked — and every scenario migrated from
  an earlier version carries a camera nobody chose to save.
- The model, the two dialogs and the picker landed in one commit: the registry replaces the section
  shape they are typed against, so neither compiles without the other.
- Review by a second agent found the ordering defect this branch introduced: the color-follows-height
  link was patched in the second pass, so switching it on re-derived the color range *after* the
  scenario's own range was written — every built-in lost its range on the first apply of a session.
  Settings now carry an `isAppliedFirst` flag and the link travels with the metric selections; a spec
  running the real reducers plus both metrics-bar effects pins it.
- Verified: full unit suite (425 suites, 2935 tests) green with the 80% gate, production build green,
  the whole Playwright suite green (85 tests) — among them applying a scenario, saving with a group
  unchecked, and switching every setting off and back to the default.
