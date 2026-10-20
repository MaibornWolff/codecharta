---
title: "Map layouts"
description: "Lay out the CodeCharta code map as a squarified treemap, a street map or a flat radial chart, and set the levels and folder colors of the radial layouts."
---

The layout decides how the files and folders of a map are arranged. The default city packs every folder tightly; the street layouts make the folder structure easier to follow; the radial layouts show the hierarchy ring by ring. The **Layout** tab on the left edge of the [metric bar](/docs/visualization/user-controls/metrics) names the current layout. Click it to pick one of five:

![The layout picker with the five map layouts](/assets/images/docs/visualization/user-controls/metrics-layout.jpeg)

| Layout             | What it draws                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| Squarified TreeMap | The default. Folders nest inside each other and every bit of floor is used.                           |
| StreetMap          | Folders become streets, files line up along them.                                                     |
| TreeMapStreet      | Streets for the upper folders, treemaps near the files.                                               |
| Sunburst           | Folders as rings around the center, drawn flat without heights.                                       |
| Radial TreeMap     | A band per folder level around the center, each folder filled with a treemap of its contents.         |

The first three are 3D layouts: files are buildings with an area, a height and a color, as described on the [code map](/docs/visualization/user-controls/code-map) page. The last two are flat, radial layouts and behave differently, see below.

By default the camera is reset when the layout changes; **Reset camera when map layout changes** in the [Settings](/docs/visualization/user-controls/settings) turns that off.

## TreeMapStreet: Maximum TreeMap Files

When **TreeMapStreet** is picked, a **Maximum TreeMap Files** control appears under the layouts (a slider plus a number input, range 1–1000). Folders with up to that many files are drawn as a treemap; larger ones become streets.

## Sunburst and Radial TreeMap

Both radial layouts show the folder you are in at the center and its contents ring by ring around it. A segment's size follows the **area metric**, its color the **color metric**.

![The Sunburst layout of CodeCharta with the root at the center and folders as rings](/assets/images/docs/visualization/user-controls/layout-sunburst.jpeg)

In the **Sunburst**, every folder and file is a slice of its ring. In the **Radial TreeMap**, each folder's band is filled with a treemap of its contents instead of thin slices, which keeps small files readable.

![The Radial TreeMap layout with each folder band filled by a treemap](/assets/images/docs/visualization/user-controls/layout-radial-treemap.jpeg)

### Navigating

- **Click a folder** to step into it; it becomes the new center.
- **Click the center** to step back out to the parent folder.
- **Hover** a segment to see its metrics and fade the rest of the map.
- **Click a file** to select it; it takes the selection color and opens in the [Inspector](/docs/visualization/user-controls/inspector).
- **Right-click** a segment for the same [context menu](/docs/visualization/user-controls/code-map#context-menu) as in the 3D map.

Searching in the [Explorer](/docs/visualization/user-controls/explorer) grays out what the search misses, hovering a file type in the [distribution bar](/docs/visualization/user-controls/distribution-bar) lights up those files, and folders marked with a color keep that color.

### Visible levels

With a radial layout selected, the layout picker shows a **Visible levels** slider (1–10) that sets how many folder levels are drawn around the center.

![The layout picker with the Visible levels slider](/assets/images/docs/visualization/user-controls/metrics-layout-radial.jpeg)

### The metric bar in radial layouts

Height, edges and labels do not apply to a flat layout, so the metric bar hides **Height**, the link button, **Edges** and **Labels**, and shows a **Folders** column next to **Color**. The [map tools](/docs/visualization/user-controls/map-tools) are reduced to **Screenshot** (and **Unfocus**), and [Compare](/docs/visualization/user-controls/compare) and [3D Print](/docs/visualization/user-controls/3d-print) are not offered.

A file has one value of the color metric, a folder has many. The **Folders** column decides which one a folder's color shows:

- Click the value (for example **max**) to choose how a folder's value is derived from the files below it: their sum, maximum, minimum, median, or an average.
- Click the gear icon to open **Folder style** and choose between **Tinted by value**, where folders take a lighter shade of the color their value maps to, with an adjustable **Tint strength**, and **Neutral**, which keeps folders gray so only the files carry color. **Reset folder colors** restores the defaults.

![The Folder style popover](/assets/images/docs/visualization/user-controls/metrics-folders.jpeg)
