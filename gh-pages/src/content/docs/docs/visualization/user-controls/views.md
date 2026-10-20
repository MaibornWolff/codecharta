---
title: "Views"
description: "Read the same code map three ways in the CodeCharta Web Studio: the Metric view, the Domain word cloud and the Dependencies graph, and switch modes."
---

The Web Studio shows a loaded map in up to three views, so you can ask different questions of the same code: how big
and complex it is, what it is about, and how its parts depend on each other. The tabs in the middle of the top bar
switch between them:

- **Metric**: the 3D code map, or one of the flat radial [layouts](/docs/visualization/user-controls/layouts), driven
  by the metrics you pick. See [The code map](/docs/visualization/user-controls/code-map).
- **Domain**: a word cloud of the vocabulary used in the code. See
  [Domain view](/docs/visualization/user-controls/domain-view).
- **Dependencies**: a graph of the dependencies between files and folders, arranged by level. See
  [Dependency view](/docs/visualization/user-controls/dependency-view).

A tab appears only when the loaded map has data for it:

| Tab          | Appears when the map was analysed with                                                  |
| ------------ | --------------------------------------------------------------------------------------- |
| Metric       | always                                                                                  |
| Domain       | the [Domain Language parser](/docs/parser/domain-language)                              |
| Dependencies | the [Dependency parser](/docs/parser/dependency)                                        |

[`ccsh analyse`](/docs/analysis/analyse) runs both parsers where they apply, so a map made with it usually has all
three tabs.

## The mode bar

Point at a view tab, or at the small handle below the tabs, and a bar with the modes of that view drops down over the
map:

![The mode bar below the Metric tab with Explore, Compare and 3D Print](/assets/images/docs/visualization/user-controls/views-mode-bar.jpeg)

- **Explore**: the default mode of every view.
- **Compare**: Metric view only. Shows the difference between two maps. See
  [Compare](/docs/visualization/user-controls/compare).
- **3D Print**: Metric view only. Exports the map as a printable model. See
  [3D Print](/docs/visualization/user-controls/3d-print).

Picking a mode also opens its view, so you can go from the Domain view straight to **Compare**. **Compare** and
**3D Print** are not offered while the map layout is Sunburst or Radial TreeMap.

## What the views share

- **The loaded maps** and the selection of maps in the top bar.
- **The Explorer** on the left. Each view keeps its own search, sort order, width and collapsed state.
- **Focus.** Focusing a folder in one view focuses it in the others. See
  [Focus](/docs/visualization/user-controls/code-map#focus).
- **Exclusions.** A file excluded in the Metric or Dependencies view is gone from the other one too.
- **Jumping with a node.** The context menu of a file or folder offers **Show in Metrics**, **Show in Domain** and
  **Show in Dependencies** for the other available views, and opens that view with the same node selected.

A view that still has to be built shows a spinner while the top bar stays usable.
