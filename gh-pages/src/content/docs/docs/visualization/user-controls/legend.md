---
title: "Legend"
---

The **Legend** decodes the current visualization. It is opened from the **LEGEND** tab in the bottom-right corner of the map and explains what the map's visuals mean: which metric is mapped to area, height, color and edges, how the color scale is divided into ranges, and which colors represent the different edge directions.

![Legend panel](/assets/images/docs/visualization/user-controls/legend.jpeg)

The legend reflects the currently selected metrics, so its contents change whenever you pick different metrics in the [metrics controls](/docs/visualization/user-controls/metrics). The LEGEND tab toggles the panel open and closed.

## Metric mapping

The top of the legend lists the four visual channels and the metric currently assigned to each:

- **AREA** — the metric driving the footprint (ground area) of each building, e.g. _Real Lines of Code_.
- **HEIGHT** — the metric driving how tall each building is, e.g. _Complexity_.
- **COLOR** — the metric driving the building color, e.g. _Complexity_.
- **EDGE** — the metric driving the edges drawn between buildings, e.g. _dependencies_. This row only appears when an edge metric is active.

Each row shows the metric's full, human-readable name. Where a description is available for a metric, the row exposes it as a tooltip on hover, giving the definition along with hints about what high and low values mean.

## Color scale

The **COLOR SCALE** section explains how the color metric's values map to building colors. It shows the configured ranges:

- A **positive** band for the lower range of values (for example, `0 to 60`), shown in green.
- A **neutral** band for the middle range (for example, `61 to 122`), shown in yellow.
- A **negative** band for the highest values, shown in red.

When a band's range contains no buildings (this can apply to the positive, neutral, or negative band), that band is labelled **– (no matching buildings)**.

The **selected** color indicates buildings that are currently selected (for example, via search or marking) and are highlighted regardless of their metric value.

## Edges

When an edge metric is active, the legend shows the colors used for the directional edges between buildings:

- **Outgoing Edge** — edges leaving a building.
- **Incoming Edge** — edges arriving at a building.

## Legend in screenshots

When the legend is open, it is included in exported screenshots of the map, so you can capture the metric mapping and color scale alongside the visualization.

There is a catch: **clicking anywhere outside the legend closes it** — including the camera button in the [viewcube toolbox](/docs/visualization/user-controls/viewcube). Clicking it would dismiss the legend before the screenshot is taken, leaving it out of the image. To keep the legend in the screenshot, use the keyboard shortcuts instead:

- **Ctrl+Alt+S** (macOS: **Control+Option+S**) — save the screenshot as a file
- **Ctrl+Alt+F** (macOS: **Control+Option+F**) — copy the screenshot to the clipboard

Open the legend, then press the shortcut without clicking elsewhere.
