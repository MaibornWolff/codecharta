---
title: "The dependency graph"
description: "Find dependency cycles and upward dependencies in your architecture with the CodeCharta dependency graph, arranged by level, down to single declarations."
---

The **Dependencies** view draws the dependencies between the folders and files of a map as a graph arranged by level:
what a box depends on lies below it. In a cleanly layered codebase every edge points down, so the edges that run in
cycles or point upward are the ones that show where the architecture erodes.

![The dependency graph of a Kotlin package, opened level by level, with cycle edges in blue and red](/assets/images/docs/visualization/user-controls/dependency-view.jpeg)

## Opening the view

The **Dependencies** tab appears when the loaded map carries dependency data. Create it with the
[Dependency parser](/docs/parser/dependency) (`ccsh dependencyparser`), which [`ccsh analyse`](/docs/analysis/analyse)
runs for you. The [online demo](/docs/visualization/web-studio#try-it-online) includes it.

The view shows one map at a time; in [Compare](/docs/visualization/user-controls/compare) it asks you to leave
compare mode.

## Reading the graph

- **Boxes** are folders, files and, in an opened file, declarations. A closed folder stands for everything inside it.
  A closed file that holds declarations is drawn as a small stack, with its number of declarations when there is more
  than one.
- **Levels** stack the boxes inside a folder: a box on a higher level depends on boxes on lower levels. Dashed lines
  separate the levels, each labeled with its number.
- **Edges** are dependencies. An edge between two closed folders stands for all dependencies between their contents,
  and by default it is drawn thicker the more of them it stands for.
- **Badges** on a closed box count what it hides: cycles between files, cycles inside a file and upward dependencies.

The graph starts with the edges that need attention, those **In a cycle** and those that **Point upward**, and leaves
the plain dependencies out. The box under the pointer shows all of its edges. The **LEGEND** tab explains every line,
badge and icon:

![The legend of the Dependencies view with the four edge types, the badges and the declaration kinds](/assets/images/docs/visualization/user-controls/dependency-legend.jpeg)

| Edge type                            | Line (default colors)  | Meaning                                                    |
| ------------------------------------ | ---------------------- | ---------------------------------------------------------- |
| **Dependency**                       | gray                   | Follows the levels.                                        |
| **In a cycle**                       | blue                   | Part of a dependency cycle, but still pointing down.       |
| **Points upward**                    | red, dashed            | A dependency between folders that goes against the levels. |
| **Points upward and closes a cycle** | red                    | The dependency that closes a cycle.                        |

## Working with the graph

- **Hover** a box to see its name, its level, the cycles and upward dependencies inside it and whether it can be
  opened. Hover an edge to see what it connects, how many dependencies it stands for and its type.
- **Click** a box or an edge to select it and show it in the [dependency inspector](/docs/visualization/user-controls/dependency-inspector).
- **Double-click** a folder or package to open it level by level, and a file to open its classes, functions and other
  declarations. Double-click again to close it. A box keeps its place on screen when it opens or closes, and an opened
  box that does not fit is brought into view whole.
- **Click a badge** to select its box and open its cycles or upward dependencies in the inspector.
- **Drag** a box to move it out of the way. **Reset layout** in the tools tab puts every dragged box back.
- **Mouse wheel** zooms. Drag the background, hold Space and drag, or drag with the right mouse button to pan; the
  last two work from anywhere, also from a box.
- **Right-click** a box for its context menu: copy its path, **Show in Explorer**, **Show in Metrics** /
  **Show in Domain**, **Focus** (folders) and **Exclude**.
- **Show whole graph** in the tools tab fits the graph into the view; **Screenshot** takes a picture of it. See
  [Map tools](/docs/visualization/user-controls/map-tools).

The boxes can also be reached from the keyboard: Tab moves into the graph, the arrow keys walk from box to box, Enter
selects a box and Space opens or closes it.

![A Kotlin file opened into its functions and classes, next to closed files drawn as stacks](/assets/images/docs/visualization/user-controls/dependency-declarations.jpeg)

The [Explorer](/docs/visualization/user-controls/explorer) on the left lists the files that take part in the graph.
Its search and its **Exclude** rules work as in the Metric view; exclusions and the
[focus](/docs/visualization/user-controls/code-map#focus) are shared with the other views. Focusing a folder or
leaving the focus keeps the boxes you opened and moved, and leaving it shows the folder where it lies in the whole
graph.

Select a box or an edge to see its details in the
[dependency inspector](/docs/visualization/user-controls/dependency-inspector), and choose which edges are drawn and how
with the [dependency bar](/docs/visualization/user-controls/dependency-bar).

## Related

- [Dependency parser](/docs/parser/dependency)
- [Quality gate](/docs/analysis/quality-gate)
- [Keyboard and mouse shortcuts](/docs/visualization/user-controls/keyboard-shortcuts)
