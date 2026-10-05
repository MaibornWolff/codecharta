---
title: "Views"
---

The Web Studio shows a loaded map in up to three views. The tabs in the middle of the top bar switch between them:

- **Metric** – the 3D code map (or one of the flat radial [layouts](/docs/visualization/user-controls/layouts)), driven by the metrics you pick. Always available.
- **Domain** – a word cloud of the vocabulary used in the code. See [Domain View](/docs/visualization/user-controls/domain-view).
- **Dependencies** – a graph of the dependencies between files and folders, arranged by level. See [Dependency View](/docs/visualization/user-controls/dependency-view).

A tab only appears when the loaded map has something to show in it:

| Tab          | Appears when                                                                                                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Metric       | always                                                                                                                                                                                                         |
| Domain       | the map was analysed with the [Domain Language parser](/docs/parser/domain-language)                                                                                                                           |
| Dependencies | the map was analysed with the [Dependency parser](/docs/parser/dependency) **and** **Enable Dependency View (experimental)** is switched on in the [Settings](/docs/visualization/user-controls/settings) |

## The mode bar

Hovering a view tab — or clicking the small handle that hangs below the tabs — drops a bar down over the map with the modes of that view:

![The mode bar below the view tabs](/assets/images/docs/visualization/user-controls/views-mode-bar.jpeg)

- **Explore** – the default mode of every view. See [Explore](/docs/visualization/user-controls/explore).
- **Compare** – Metric view only: shows the difference between two maps. See [Compare](/docs/visualization/user-controls/compare).
- **3D Print** – Metric view only: exports the map as a printable model. See [3D Print](/docs/visualization/user-controls/3d-print).

Picking a mode opens its view as well, so you can go from the Domain view straight to **Compare**. **Compare** and **3D Print** are not offered while the map layout is Sunburst or Radial TreeMap.

## What the views share

- **The loaded map and the selection of maps** in the top bar.
- **The Explorer** on the left. Each view keeps its own search, sort order, width and collapsed state.
- **Focus.** Focusing a folder in one view focuses it in the others. See [Focus](/docs/visualization/user-controls/explore#focus).
- **Exclusions.** A file excluded in the Metric or Dependencies view is gone from the other one too.
- **Jumping with a node.** The right-click menu of a file or folder offers **Show in Metrics**, **Show in Domain** and **Show in Dependencies** for the other views that are available, and opens that view with the same node selected.

Switching to a view that still has to be built shows a spinner in that view; the top bar stays usable meanwhile.
