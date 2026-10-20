---
title: "Compare"
description: "Compare two CodeCharta maps, such as two releases, and see which files grew, shrank, appeared or disappeared, colored by the change of a code metric."
---

**Compare** shows the difference between two maps instead of a single one. Load two versions of a codebase, such as
the last release and today, and every building is colored by how its metric changed, so growth, clean-ups, new and
removed files stand out.

![Compare between two maps of CodeCharta, with grown files in green and shrunk or removed files in red](/assets/images/docs/visualization/user-controls/compare.jpeg)

## Starting Compare

1. Load at least two maps. Select several files at once in the file picker (Shift or Ctrl/Cmd click, as your
   operating system offers), or open them one after the other. See
   [Loading maps](/docs/visualization/user-controls/loading-maps).
2. Point at the **Metric** tab and pick **Compare** in the [mode bar](/docs/visualization/user-controls/views#the-mode-bar).

Compare belongs to the Metric view and is not offered while the map layout is Sunburst or Radial TreeMap. To link
straight to a comparison, add `mode=Delta` to a URL with two `file` parameters; the first map becomes the reference.
See [Open maps from a URL](/docs/visualization/user-controls/loading-maps#open-maps-from-a-url).

**Explore** in the mode bar leaves Compare and shows the maps you had before.

## Selecting the two maps

While Compare is on, the top bar shows two map selectors:

- **Reference** (left): the map you compare from.
- **Comparison** (right): the map you compare to.

The delta is the comparison minus the reference. The swap button between the selectors (**Switch reference and
comparison file**) exchanges them, which turns every increase into a decrease. It is enabled once a comparison map is
picked.

## Reading the delta

In Compare the building colors stand for the change of the **height metric**:

- **Green**: the value increased.
- **Red**: the value decreased.
- **Gray**: unchanged, or flattened.

**Invert colors** in the color settings swaps green and red, for a metric where more is better. The color settings
in Compare offer only the two delta colors, and the [legend](/docs/visualization/user-controls/legend) shows them as
**+Δ positive delta** and **–Δ negative delta**.

The [metric bar](/docs/visualization/user-controls/metrics) shows the change in numbers: next to the sum (Σ) of each
metric comes its delta, for example `Σ 18,679 Δ11,506` for `complexity`.

## Changes in the Inspector

Click a building or a folder to see its changes in the [Inspector](/docs/visualization/user-controls/inspector):

![The Inspector in Compare for a removed folder, with 29 removed files and negative deltas](/assets/images/docs/visualization/user-controls/compare-inspector.jpeg)

- Every metric shows its change next to its value, such as `Δ-162`, in the delta colors.
- A folder shows how many of its files were added, removed and changed, for example `Δ0 Δ-29 Δ0` for a folder whose
  29 files were all removed.

The [Dependencies view](/docs/visualization/user-controls/dependency-view) shows a single map, so it asks you to leave
Compare first.
