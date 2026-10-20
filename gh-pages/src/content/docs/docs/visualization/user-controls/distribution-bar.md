---
title: "Distribution bar"
description: "See how the area metric of a CodeCharta map splits across file extensions, light up the files of one language and flatten or exclude them."
---

The distribution bar is the thin bar at the bottom of the Metric view, directly above the bottom bar. It shows how the
area metric splits across the file extensions of the map, so you see at a glance which languages make up most of the
code.

![The distribution bar with ts, kt, html and other segments for the rloc metric](/assets/images/docs/visualization/user-controls/distribution-bar.jpeg)

## What it shows

The label on the left names the metric the bar is based on. It is always the
[area metric](/docs/visualization/user-controls/metrics#area).

Each segment is one file extension, sized and labeled by its share of the total. In the example, `ts` files hold
47.89% of all `rloc`, followed by `kt` with 40.43%.

- **other**: extensions with a share below 3% are grouped into one gray **other** segment.
- **None**: files without an extension are counted as **None**; depending on their share they get a segment of their
  own or join **other**.
- **Colors**: an extension always gets the same color, derived from its name.
- **Scope**: the bar covers the whole map without its excluded files. While you hover or select a folder, it shows
  the split inside that folder.

## Interaction

- **Hover** a segment to light up all files of that extension on the map, in the radial layouts too. Hovering
  **other** lights up every extension in it.
- **Click** the bar to switch between percentages and absolute metric values.
- **Right-click** a segment for **Flatten** (or **Show** when already flattened) and **Exclude**, which act on every
  file of that extension. See [Explorer](/docs/visualization/user-controls/explorer#flatten-vs-exclude).
