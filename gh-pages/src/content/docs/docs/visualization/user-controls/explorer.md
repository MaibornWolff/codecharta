---
title: "Explorer"
---

The **Explorer** is the side panel on the left of the map. It lists the contents of the
map (or maps) you have loaded as a searchable file and folder tree, and lets you filter that
tree down to the buildings you care about. From a search pattern or a metric condition you can
**flatten** buildings (de-emphasize them) or **exclude** them (remove them from the view) to
focus on the rest of your codebase.

![Explorer panel](/assets/images/docs/visualization/user-controls/explorer.jpeg)

At the top, three counters summarize the current state of the map — **SHOWN**, **FLATTENED**
and **EXCLUDED** — followed by the search box, the sort control and the file tree. Each row shows
the share of the map it accounts for and its number of files. The overflow menu (⋮) next to the
search box holds the **Flatten** and **Exclude** actions.

The panel can be resized by dragging its right edge (double-click the edge to reset the width) and
collapsed with the `«` button in its header. Collapsed, it leaves a small strip with the search box
at the top-left; the folder-tree button brings it back.

Every [view](/docs/visualization/user-controls/views) has an Explorer and keeps its own search, sort
order and width. The Dependencies view has no **FLATTENED** counter, and the
[Domain view](/docs/visualization/user-controls/domain-view) switches its Explorer between files and words.

## Searching

Type a pattern into the search box to filter the tree to the matching buildings. The search uses
[.gitignore-style](https://git-scm.com/docs/gitignore) glob patterns, so the same syntax you use
to ignore files in Git applies here. For example:

- `*.js` matches every JavaScript file in the map.
- `**/app/*` matches everything directly inside any `app` folder.

You can combine several patterns by separating them with commas (for example `*.js, **/app/*`,
as shown in the placeholder). Use the clear button in the search box to reset the pattern and
show the full tree again.

On the map, buildings the search misses are greyed out. The search does not hide anything on its own.

## Sorting

The sort control below the search box orders the tree by **Name**, **Number of Files** or
**Area Size**; the arrow beside it switches between ascending and descending.

## Flatten vs. Exclude

There are two ways to act on buildings, with different effects on the map:

- **Flatten** keeps the buildings in the map but flattens and greys them out, so they
  recede into the background while still providing context. This is useful for code you want to
  de-emphasize without losing sight of it entirely (for example generated or vendor code).
- **Exclude** removes the buildings from the view entirely, so they no longer take up
  space in the map. This is useful when large amounts of code (such as `node_modules` or test
  fixtures) only add noise.

The overflow (⋮) menu next to the search box offers both, in two forms:

- **Flatten** / **Exclude** turn the current search pattern into a rule. They stay disabled until
  you have entered a pattern.
- **Flatten by metric…** / **Exclude by metric…** open an editor in which you pick a metric, a
  comparison (greater than, at least, less than, at most, equal to, between) and a threshold. The
  editor shows how the metric is distributed and how many files the condition matches before you
  add the rule.

A rule keeps applying as the map updates: a metric rule is re-applied whenever the loaded files or
metrics change. A pattern containing wildcards becomes a reusable **RULE**; flattening or excluding
a single file or folder from its [context menu](/docs/visualization/user-controls/explore#right-click-actions)
creates a one-off **MANUAL** entry.

## Managing rules

The three counters at the top of the Explorer reflect how the rules currently divide up the map's
buildings:

- **SHOWN** — buildings that are visible in the map (neither flattened nor excluded). Large
  numbers are abbreviated, e.g. `2.8K`. Hover the counter to see how many of them have no area in
  the current area metric.
- **FLATTENED** — buildings that are currently flattened by one or more flatten rules.
- **EXCLUDED** — buildings that are currently excluded from the view.

The **FLATTENED** and **EXCLUDED** counters are clickable. Selecting one opens a popup that lists
every rule of that kind, each labelled **RULE** or **MANUAL**, together with the number of
buildings it affects. Clicking the ✕ next to a rule removes it, restoring the affected buildings
to the map. Below the list you can add a rule by metric, or clear the whole list in one step.

![Exclusion rules popup](/assets/images/docs/visualization/user-controls/explorer-exclusion-rules.jpeg)

In the example above, opening the **EXCLUDED** counter reveals a single rule, `*.spec.ts`, that
currently excludes 544 buildings. Removing it would bring those buildings back into the map.

To remove every flatten and exclude rule at once, use **Reset filters** in the
[Settings](/docs/visualization/user-controls/settings).

## Focus

While you are [focused](/docs/visualization/user-controls/explore#focus) on a folder, the Explorer
lists that folder alone under a **Focus mode** banner. **Show whole project** in the banner leaves
the focus.
