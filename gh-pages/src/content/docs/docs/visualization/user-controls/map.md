---
title: "Map"
---

The code map is the heart of the Web Studio: a central 3D canvas that renders your codebase as a city. It turns abstract metrics into a shape you can look at, walk around, and reason about at a glance.

![Code map](/assets/images/docs/visualization/user-controls/map.jpeg)

## The city metaphor

CodeCharta visualizes your codebase as a 3D treemap, a city built from your folder structure:

- **Each file is a building.** Every source file becomes one building standing on the map.
- **Each folder is a district.** Folders group their files into nested districts, separated by streets, so the layout mirrors your project's directory tree. The root of the project forms the ground plate at the bottom.

Because the city is laid out directly from your folders, files that live close together in the code also stand close together on the map.

## Visual dimensions

The buildings are not just placeholders, their shape and color encode metrics. Three visual dimensions carry meaning, and you choose which metric drives each one:

- **Area (footprint)** is driven by the **Area metric**. A building's footprint on the ground reflects this metric, for example lines of code, so larger files take up more space.
- **Height** is driven by the **Height metric**. The taller a building, the higher its value, making outliers such as highly complex files easy to spot above the skyline.
- **Color** is driven by the **Color metric**. Buildings are colored along a scale (typically green to red) so that you can read a metric's severity directly from the city.

If your map provides them, **edges** between buildings represent an **edge metric**, drawing connections (such as how often two files change together) on top of the city.

The four selectable metrics are shown in the metric bar at the bottom of the map. To learn how to pick metrics and tune their color ranges, see the [Metrics](/docs/visualization/user-controls/metrics) page.

## Navigating the map

You can move the camera freely to inspect the city from any angle: drag to rotate, pan to move across the map, and scroll to zoom in and out. The tallest buildings are automatically labeled so you can orient yourself.

This page covers what the map represents. For hovering, selecting buildings, reading per-building details, and other interactions, see the [Explore](/docs/visualization/user-controls/explore) page.
