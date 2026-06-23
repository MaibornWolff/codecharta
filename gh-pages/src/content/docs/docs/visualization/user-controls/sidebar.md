---
title: "Sidebar"
---

The **Inspector** sidebar shows the details of a single building. It opens on the right when you click (select) a building in the map (hovering only highlights the building), and it lists everything CodeCharta knows about that node: its location in the project, the metrics currently mapped to area, height and color, and the full set of metric values measured for that file.

![The Inspector sidebar for a selected building, showing its path, metric mapping and metric list](/assets/images/docs/visualization/user-controls/sidebar-map.jpeg)

At the top, the Inspector shows the building's parent path and file name. The name links out to the file's source (the external-link icon) when a link is available, and a copy button next to it copies the full path to the clipboard. A badge indicates whether the node is a file or a folder.

The Inspector complements the right-click **Explore** actions: while the sidebar is for reading a building's metrics, the context menu is for acting on it (focus, flatten, exclude, and so on). See the [Explore](/docs/visualization/user-controls/explore) page for those actions.

## Metric mapping

The **Metric Mapping** section shows the three metrics that are currently driving the visualization, together with this building's value for each:

- **Area** – the metric mapped to the building's footprint. In the screenshot this is `rloc` with a value of `429`.
- **Height** – the metric mapped to the building's height (`complexity`, `79`).
- **Color** – the metric mapped to the building's color (`complexity`, `79`).

Each entry links out to the metric's definition when a descriptor link is available, and is annotated with `· inverted` when its color direction is inverted. If your map provides edge metrics, an additional edge entry shows the in/out edge counts. These three mappings mirror the area, height and color metrics you choose in the metric bar at the bottom of the map.

## All metrics

Below the mapping, the **Metrics** section lists every metric available for the building, sorted alphabetically, regardless of whether it is currently mapped. This is the full per-file picture: `branch_coverage`, `comment_lines`, `comment_ratio`, `complexity`, `functions`, `line_coverage`, `loc`, and so on, each shown with its raw value.

Metrics whose value is `0` (or otherwise empty) are moved into a separate collapsed group at the bottom of the list, so the visible list stays focused on the metrics that actually carry a value for this file. Each metric name links to its definition when one is available.

## Map vs. range view

A **map / range** toggle in the header of the Metrics section changes how each metric's small bar beneath its value is drawn. The toggle defaults to **map**.

- **map** – compares the building's value against the whole map. The bar shows how large this file's value is relative to the map's total for that metric, so you can see how much this single file contributes.
- **range** – compares the building's value against the **min/max range** across all files in the map. The bar shows where this file's value falls between the smallest and largest value seen for that metric, so you can tell at a glance whether the file is low, average or high compared to the rest of the codebase.

![The Inspector sidebar with the range toggle active, showing each metric's position within the map's value range](/assets/images/docs/visualization/user-controls/sidebar-range.jpeg)

The numbers themselves do not change between the two views; only the bars do. The bar color reflects the metric's severity (for example greener for better, redder for worse) according to the metric's direction.
