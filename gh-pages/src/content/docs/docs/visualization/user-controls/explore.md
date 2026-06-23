---
title: "Explore"
---

**Explore** is the default viewing mode of the CodeCharta Web Studio. It lets you freely navigate a single map, inspect individual buildings, and drill into the parts of the codebase that interest you. The mode is selected with the **Explore** tab in the top-right navigation (next to **Compare**, which is used to view the delta between two maps).

![The Web Studio in Explore mode](/assets/images/docs/visualization/user-controls/explore.jpeg)

## Navigating the map

The map is a 3D treemap that you can move around freely:

- **Rotate** – drag with the left mouse button to orbit the camera around the map.
- **Pan** – drag with the right mouse button to move the map across the screen.
- **Zoom** – use the mouse wheel (or drag with the middle mouse button) to zoom in and out.

You can also use the **Viewcube** in the top-right corner to jump to a fixed perspective by clicking a side or edge, or reset the camera with its compass icon.

The tallest buildings automatically get a **label** showing their file name and metric value, so the most prominent files are easy to spot. You can toggle labels or change how many buildings are labelled in the height metric details of the metric bar at the bottom.

## Inspecting buildings

- **Hover** over a building to highlight it and see its name and metric value. The current values for area, height and color also update in the metric bar at the bottom.
- **Click** a building to select it. The selection opens the [Inspector](/docs/visualization/user-controls/sidebar), which lists all available metrics for that building.
- **Double-click** a building to open its source link in a new browser tab (when the file has a link, such as a repository or external URL).

## Right-click actions

Right-clicking a building opens a context menu with quick actions for that node. The top entry shows the file path and copies it to the clipboard when clicked.

![The right-click context menu on a building](/assets/images/docs/visualization/user-controls/explore-context-menu.jpeg)

- **Show in Explorer** – reveals and selects the node in the [Explorer](/docs/visualization/user-controls/explorer) sidebar on the left, so you can locate it in the file tree.
- **Focus** – zooms in on the selected node and its children, hiding the rest of the map so you can concentrate on a single area. While focused, the menu offers **Unfocus** / **Unfocus All** to return to the full map.
- **Keep Highlight** – pins a constant highlight on the node and its children so it stays visible even when you move the mouse away. Use **Remove Highlight** to clear it again.
- **Flatten** – flattens the node and its children to the ground, keeping an empty space where they were. This de-emphasizes the area without removing it. Flattened nodes can be restored from the **Show** menu entry or managed in the [Explorer](/docs/visualization/user-controls/explorer).
- **Exclude** – removes the node and its children from the map entirely. Useful for hiding vendor or generated code. Excluded nodes can be restored from the [Explorer](/docs/visualization/user-controls/explorer).

For folders, the context menu additionally offers options to mark the folder with a color.

Flattened and excluded buildings are managed centrally in the [Explorer](/docs/visualization/user-controls/explorer) page, where you can review and restore them at any time.
