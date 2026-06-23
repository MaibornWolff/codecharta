---
title: "Fileextensionbar"
---

The **distribution bar** is the thin horizontal bar at the very bottom of the Web Studio. It shows how the currently selected **area metric** (for example `rloc`) is distributed across the file types (extensions) in the loaded map, drawn as proportional colored segments.

![File extension distribution bar](/assets/images/docs/visualization/user-controls/fileextensionbar.jpeg)

## What it shows

The label on the left (with a pie-chart icon) names the metric the distribution is based on — this is always the currently selected **Area metric**. See [Metrics](/docs/visualization/user-controls/metrics) for how to choose it.

To the right, each colored segment represents one file extension. CodeCharta walks every (non-excluded) file in the map, sums the area metric per extension, and sizes each segment by that extension's share of the total. So in the example above `ts` accounts for 84.43% of the total `rloc`, followed by `json` (6.38%) and `html` (4.30%).

A few details about how the segments are built:

- **Sizing and percentage** — each segment grows in proportion to its relative share of the metric and is labeled with that percentage (e.g. `ts 84.43%`).
- **"other" bucket** — extensions whose share is below 3% are not shown individually. They are grouped into a single neutral-gray **other** segment (4.90% in the example).
- **Files without an extension** — files that have no extension are tracked separately as a "None" group; depending on its size it is shown on its own or folded into **other**.
- **Colors** — each extension gets a stable color derived from its name (the same extension always gets the same color), while **other** and "None" use a neutral gray.
- **Scope** — by default the bar reflects the whole map. When you hover or select a folder, the bar updates to show the distribution within that folder instead.

## Interaction

- **Hover** a segment to highlight all buildings of that file extension in the 3D map (hovering **other** highlights every grouped extension at once).
- **Click** a segment to toggle the labels between relative percentages and absolute metric values.
- **Right-click** a segment to open a context menu with actions for that extension: **Flatten** (or **Show** if already flattened) and **Exclude**.
