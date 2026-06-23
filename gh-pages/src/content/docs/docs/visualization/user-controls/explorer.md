---
title: "Explorer"
---

The **Explorer** is the side panel on the left of the map. It lists the contents of the
map (or maps) you have loaded as a searchable file and folder tree, and lets you filter that
tree down to the buildings you care about. Once you have narrowed a selection with a search
pattern, you can **flatten** matching buildings (de-emphasize them) or **exclude** them (remove
them from the view) to focus on the rest of your codebase.

![Explorer panel](/assets/images/docs/visualization/user-controls/explorer.jpeg)

At the top, three counters summarize the current state of the map — **SHOWN**, **FLATTENED**
and **HIDDEN** — followed by the search box and the file tree. Each folder row shows the share
of the map it accounts for. The overflow menu (⋮) next to the search box holds the **Flatten**
and **Exclude** actions.

## Searching

Type a pattern into the search box to filter the tree to the matching buildings. The search uses
[.gitignore-style](https://git-scm.com/docs/gitignore) glob patterns, so the same syntax you use
to ignore files in Git applies here. For example:

- `*.js` matches every JavaScript file in the map.
- `**/app/*` matches everything directly inside any `app` folder.

You can combine several patterns by separating them with commas (for example `*.js, **/app/*`,
as shown in the placeholder). Use the clear button in the search box to reset the pattern and
show the full tree again.

The search only filters what is displayed in the tree and which buildings the **Flatten** and
**Exclude** actions apply to — it does not change the map on its own. Those actions stay disabled
until you have entered a pattern.

## Flatten vs. Exclude

Once you have a search pattern, open the overflow (⋮) menu next to the search box to apply it as a
rule. There are two ways to act on the matched buildings, with different effects on the map:

- **Flatten** keeps the matching buildings in the map but flattens and greys them out, so they
  recede into the background while still providing context. This is useful for code you want to
  de-emphasize without losing sight of it entirely (for example generated or vendor code).
- **Exclude** removes the matching buildings from the view entirely, so they no longer take up
  space in the map. This is useful when large amounts of code (such as `node_modules` or test
  fixtures) only add noise.

Both actions turn the current search pattern into a saved rule that keeps applying as the map
updates. A pattern containing wildcards becomes a reusable **RULE**; selecting a single concrete
building instead creates a one-off **MANUAL** entry.

## Managing hidden & flattened rules

The three counters at the top of the Explorer reflect how the rules currently divide up the map's
buildings:

- **SHOWN** — buildings that are visible in the map (neither flattened nor excluded). Compact
  numbers are abbreviated, e.g. `1.6K`.
- **FLATTENED** — buildings that are currently flattened by one or more flatten rules.
- **HIDDEN** — buildings that are currently excluded from the view.

The **FLATTENED** and **HIDDEN** counters are clickable. Selecting one opens a popup that lists
every rule of that kind, each labelled **RULE** or **MANUAL**, together with the number of
buildings it affects. Clicking the ✕ next to a rule removes it, restoring the affected buildings
to the map.

![Hidden rules popup](/assets/images/docs/visualization/user-controls/explorer-hidden-rules.jpeg)

In the example above, opening the **HIDDEN** counter reveals a single rule, `*.kt`, that currently
excludes 487 buildings. Removing it would bring those buildings back into the map.
