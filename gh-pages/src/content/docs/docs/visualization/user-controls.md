---
title: "Interface overview"
description: "Find your way around the CodeCharta Web Studio: top bar, Explorer, code map, metric bar and legend, with a link to the page for each control."
---

The Web Studio keeps the same frame in every view: the top bar, the Explorer on the left, the view itself in the
middle and a settings bar at the bottom. The screenshot shows the **Metric** view; the
[Domain](/docs/visualization/user-controls/domain-view) and
[Dependencies](/docs/visualization/user-controls/dependency-view) views put their own content into the same frame.

![The Metric view with numbered markers on each control listed below](/assets/images/docs/visualization/user-controls.png)

| #   | Control             | What it does                                                                                                                        |
| --- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Load cc.json files  | Opens one or several maps. See [Loading maps](/docs/visualization/user-controls/loading-maps).                                      |
| 2   | Map selector        | Picks which of the loaded maps are shown. See [Loading maps](/docs/visualization/user-controls/loading-maps#choose-the-maps-shown). |
| 3   | View tabs           | **Metric**, **Domain**, **Dependencies**. A tab appears only when the map carries data for it. See [Views](/docs/visualization/user-controls/views). |
| 4   | Mode bar            | Point at a view tab or this handle to drop down **Explore**, **Compare** and **3D Print**. See [Views](/docs/visualization/user-controls/views#the-mode-bar). |
| 5   | Settings            | Opens the **Global Configuration** dialog. See [Settings](/docs/visualization/user-controls/settings).                              |
| 6   | Explorer counters   | **SHOWN**, **FLATTENED**, **EXCLUDED**. Click the last two to manage their rules. See [Explorer](/docs/visualization/user-controls/explorer#managing-rules). |
| 7   | Search and ⋮ menu   | Search with [.gitignore-style](https://git-scm.com/docs/gitignore) patterns; the ⋮ menu turns a pattern or a metric condition into a rule. See [Explorer](/docs/visualization/user-controls/explorer). |
| 8   | Sort                | Orders the tree by **Name**, **Number of Files** or **Area Size**.                                                                  |
| 9   | File tree           | Folders and files of the map, each with its share of the area metric and its number of files.                                      |
| 10  | Code map            | Hover, click, double-click or right-click a building. See [The code map](/docs/visualization/user-controls/code-map).               |
| 11  | Viewcube            | Snaps the camera to a side, edge or corner view. See [Map tools and viewcube](/docs/visualization/user-controls/map-tools#viewcube). |
| 12  | Zoom slider         | Zooms the map; the current zoom is shown below it.                                                                                  |
| 13  | Layout              | Names the map layout and switches between the five layouts. See [Map layouts](/docs/visualization/user-controls/layouts).            |
| 14  | Map tools           | **Center map**, **Flashlight**, **Screenshot**, and **Unfocus** while a folder is focused. See [Map tools](/docs/visualization/user-controls/map-tools). |
| 15  | Area                | The metric behind each building's footprint. See [Metric bar](/docs/visualization/user-controls/metrics#area).                      |
| 16  | Height              | The metric behind each building's height. See [Metric bar](/docs/visualization/user-controls/metrics#height).                       |
| 17  | Link                | Ties height and color to the same metric. See [Metric bar](/docs/visualization/user-controls/metrics#linking-height-and-color).    |
| 18  | Color               | The metric behind each building's color. See [Metric bar](/docs/visualization/user-controls/metrics#color).                         |
| 19  | Edges               | Shown when the map carries edges: the edge metric and its settings. See [Metric bar](/docs/visualization/user-controls/metrics#edges). |
| 20  | Labels              | Which buildings get a label. See [Labels](/docs/visualization/user-controls/labels).                                                |
| 21  | Scenarios           | Saves and applies sets of settings. See [Scenarios](/docs/visualization/user-controls/scenarios).                                   |
| 22  | Legend              | Opens the **LEGEND** panel. See [Legend](/docs/visualization/user-controls/legend).                                                 |
| 23  | Distribution bar    | How the area metric splits across file extensions. See [Distribution bar](/docs/visualization/user-controls/distribution-bar).       |
| 24  | Bottom bar          | The path of the file or folder under the pointer on the left, the CodeCharta version on the right.                                  |

Clicking a building or a folder opens the [Inspector](/docs/visualization/user-controls/inspector) on the right, with
every metric of that node. All keyboard and mouse shortcuts are listed on
[Keyboard and mouse shortcuts](/docs/visualization/user-controls/keyboard-shortcuts).
