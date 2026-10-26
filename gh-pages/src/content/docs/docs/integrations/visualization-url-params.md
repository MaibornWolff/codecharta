---
title: "Visualization URL Parameters"
description: "Link directly to CodeCharta maps with URL parameters for files, metrics and comparisons."
---

The Web Studio loads maps named in its URL. Use these parameters to link a teammate straight to a map on a server
or open analysis results from another tool.

## Example

```text
https://codecharta.com/visualization/app/index.html?file=codecharta_visualization.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true
```

## Parameters

| Parameter | Effect |
| --- | --- |
| `file=<url>` | Loads the map at this URL, relative to the Web Studio or absolute. Repeat it to load several maps. |
| `area=<metric>` | Area metric to start with. |
| `height=<metric>` | Height metric to start with. |
| `color=<metric>` | Color metric to start with. |
| `edge=<metric>` | Edge metric to start with. |
| `mode=Delta` | Opens [Compare](/docs/visualization/user-controls/compare) with the first two maps: the first `file` is the reference and the second is the comparison. Needs at least two `file`s. |
| `currentFilesAreSampleFiles=true` | Treats the maps as samples: the first map the user opens replaces them. |

- Compare belongs to the Metric view and is not offered with the Sunburst or Radial TreeMap layout.
- A metric the map does not contain is ignored.
- While a `file` parameter is present, the Web Studio keeps `area`, `height`, `color` and `edge` in the address bar up
  to date, so the URL always reproduces the metrics on screen.
- The browser fetches the files itself. A map on another server needs that server to allow cross-origin requests
  (CORS).

## Related

- [Loading maps](/docs/visualization/user-controls/loading-maps)
- [Compare](/docs/visualization/user-controls/compare)
- [cc.json file format](/docs/integrations/file-format)
