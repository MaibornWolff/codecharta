---
title: "Dependency inspector"
description: "See what a file, folder or declaration uses and what uses it, its cycles and its upward dependencies in the inspector of the CodeCharta dependency graph."
---

The inspector beside the [dependency graph](/docs/visualization/user-controls/dependency-view) explains the selected
file, declaration, folder, package or edge:

![The dependency Inspector of a Kotlin file with the Uses section open](/assets/images/docs/visualization/user-controls/dependency-inspector.jpeg)

- **The header** names the box and its parent (click the parent to select it), with badges such as **file**, its
  package, its number of declarations and its cycles. The copy button copies the path. **Open in graph** and
  **Close in graph** open or close the box without a double-click. For an edge, **Unfold in graph** opens its ends
  down to the declarations it connects.
- **Cycles** lists every cycle the box takes part in, step by step, with **Show in graph** to mark it.
- **Upward** lists the upward dependencies, also with **Show in graph**.
- **Uses** and **Used by** list the dependencies going out and coming in, grouped by file, with the kind of use and
  the edge type.
- **Declarations** lists the declarations of a file.
- For a selected edge, **Stands for** lists the single dependencies the edge stands for.

For a box, a section opens and closes with a click on its title; long lists end in **and N more**. Pointing at a row marks the
boxes and edges it names in the graph. **Close inspector** (✕) closes it, and its left edge resizes it like the
[Inspector](/docs/visualization/user-controls/inspector) of the Metric view.

## Related

- [The dependency graph](/docs/visualization/user-controls/dependency-view)
- [Dependency bar](/docs/visualization/user-controls/dependency-bar)
