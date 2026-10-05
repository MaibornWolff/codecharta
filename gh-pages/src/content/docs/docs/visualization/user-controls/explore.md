---
title: "Explore"
---

**Explore** is the default mode of the CodeCharta Web Studio. It lets you freely navigate a single map, inspect individual buildings, and drill into the parts of the codebase that interest you. It sits next to **Compare** and **3D Print** in the [mode bar](/docs/visualization/user-controls/views#the-mode-bar) that drops down below the view tabs.

![The Web Studio in Explore mode](/assets/images/docs/visualization/user-controls/explore.jpeg)

## Navigating the map

The map is a 3D treemap that you can move around freely:

- **Rotate** – drag with the left mouse button to orbit the camera around the map.
- **Pan** – drag with the right mouse button to move the map across the screen.
- **Zoom** – use the mouse wheel (or drag with the middle mouse button) to zoom in and out. Hold **Alt** while zooming to zoom towards the centre instead of the pointer.

You can also use the [Viewcube](/docs/visualization/user-controls/viewcube) in the top-right corner to jump to a fixed perspective by clicking a side or edge, and the **Center map** tool on the metric bar to bring the whole map back into view (see [Map Tools](/docs/visualization/user-controls/map-tools)).

The tallest buildings automatically get a **label** showing their file name, so the most prominent files are easy to spot. How many buildings are labelled, and what a label shows, is set in the [Labels](/docs/visualization/user-controls/labels) settings on the metric bar.

## Inspecting buildings

- **Hover** over a building to highlight it and see its name and metric values. The values for area, height and color also update in the metric bar, and the bottom bar shows the building's path.
- **Click** a building to select it. The selection opens the [Inspector](/docs/visualization/user-controls/sidebar), which lists all available metrics for that building.
- **Double-click** a building to open its source link in a new browser tab (when the file has a link, such as a repository or external URL).

## Right-click actions

Right-clicking a building or a folder — on the map or in the Explorer — opens a context menu with quick actions for that node. The top entry shows the path and copies it to the clipboard when clicked.

![The right-click context menu on a folder](/assets/images/docs/visualization/user-controls/explore-context-menu.jpeg)

- **Show in Explorer** – reveals and selects the node in the [Explorer](/docs/visualization/user-controls/explorer) on the left, so you can locate it in the file tree.
- **Show in Domain** / **Show in Dependencies** – opens the node in another [view](/docs/visualization/user-controls/views), when the map carries data for it.
- **Focus** – folders only. See [Focus](#focus) below.
- **Keep Highlight** – pins a constant highlight on the node and its children so it stays visible even when you move the mouse away. Use **Remove Highlight** to clear it again.
- **Flatten & decolor** – flattens the node and its children to the ground and greys them out, keeping the space they occupy. This de-emphasizes the area without removing it. A flattened node offers **Show** instead.
- **Exclude** – removes the node and its children from the map entirely. Useful for hiding vendor or generated code.
- **Folder colors** – for folders, the row of swatches at the bottom marks the folder with a color; the brush picks a custom one.

Flattened and excluded nodes are managed in the [Explorer](/docs/visualization/user-controls/explorer), where you can review and remove the rules at any time.

## Focus

**Focus** on a folder to work with that part of the project alone. The map is laid out around the focused folder so it fills the view, and the Explorer lists only that folder.

![The map focused on one folder](/assets/images/docs/visualization/user-controls/focus.jpeg)

- Only folders can be focused, and only one at a time: focusing another folder replaces the focus you had.
- The focus is shared by all [views](/docs/visualization/user-controls/views) — the Domain and Dependencies views limit themselves to the same folder.
- To leave the focus, use **Unfocus** in the context menu or in the [map tools](/docs/visualization/user-controls/map-tools), or **Show whole project** in the banner at the top of the Explorer. On a folder below the focused one, the context menu offers **Unfocus Parent**.
- In the Sunburst and Radial TreeMap layouts, clicking the centre while it shows the focused folder asks whether to unfocus and go up.
