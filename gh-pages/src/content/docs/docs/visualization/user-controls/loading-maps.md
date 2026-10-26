---
title: "Loading maps"
description: "Open cc.json maps in the CodeCharta Web Studio from your disk or a URL, show several maps together and pick which ones are on screen."
---

The Web Studio shows the maps the [CodeCharta Shell](/docs/analysis/codecharta-shell) writes: a `.cc.json` file or its
gzip-compressed `.cc.json.gz`. You open them from your disk with the folder button, or from a URL with query
parameters. To create a map of your own code, run [`ccsh analyse`](/docs/analysis/analyse).

![The map selector open with three loaded maps, all of them shown](/assets/images/docs/visualization/user-controls/loading-maps.jpeg)

## Open maps from your disk

Click the folder button (**Load cc.json files**) next to the logo. The file picker accepts `.json` and `.gz` files and
lets you select several at once.

- The maps you open are shown right away. Maps you loaded earlier stay loaded, so you can bring them back with the
  map selector.
- The sample maps of the online demo are replaced by the first map you open yourself.
- A file that is already loaded is not added a second time. A different map with a name already in use gets a
  distinct name.
- A file that is not a valid map is rejected, and a dialog lists what is wrong with it.

The file stays on your machine. See [Data privacy](/docs/overview/data-privacy).

## Choose the maps shown

The button next to the folder names the map on screen, with a count such as `+2` when several are shown. Click it to
open the map selector:

- Tick one map to show it alone, or several to show them together in one map.
- **All**, **None** and **Invert** change the selection in one click.
- The trash icon removes a map from the session; the undo icon brings it back before you apply.
- **Apply** shows the selection. It stays disabled until at least one map is ticked and the selection differs from
  what is shown. Closing the selector without **Apply** discards the changes.

To see the difference between two maps instead, switch to [Compare](/docs/visualization/user-controls/compare).

## Open maps from a URL

The Web Studio can load maps directly from a URL, with parameters to choose files, metrics and comparisons.
See [Visualization URL Parameters](/docs/integrations/visualization-url-params) in the Integrations guide for the parameter reference
and an example.

## Related

- [Views](/docs/visualization/user-controls/views)
- [Compare](/docs/visualization/user-controls/compare)
- [Getting started](/docs/overview/getting-started)
