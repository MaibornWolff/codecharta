---
permalink: /docs/how-to/load-map-using-url
tags:
  - sourcemonitorimport

title: Load map using URL Parameters

toc: true
toc_sticky: true
toc_label: "Jump to Section"
---

# Available URL Parameters

The web application allows the usage of the following query parameters in the URL.

- The `file` parameter can be used multiple times. Each accepts a file location, which must be reachable through XHR. With multiple `file` parameters you can load more than one map (See examples below)
- The following parameters require the file parameter to be used as well.
  - The `area` parameter sets the area-metric
  - The `height` parameter sets the area-metric
  - The `color` parameter sets the area-metric
  - The `edge` parameter sets the area-metric
- The `mode` parameter can be used to set one of the three different modes: `Single`, `Delta` or `Multiple`.
  - `Single` will only show the first imported files
  - `Delta` will show the first two imported files
  - `Multiple` will show all imported files aggregated together in one map

URL parameter are added by appending a `?` to the url, followed by a key-value pair `key=value`.
Additional parameters can be added by appending `&key2=value2 (See examples below)

# Examples

Use your web-domain

- `http://yourdomain.com/path_to_cc/index.html?file=something.cc.json`

Use your local codecharta-visualization instance

- `localhost:3000/?file=something.json`

Load one file and show as single map

- `localhost:3000/?file=something.cc.json`
- `localhost:3000/?file=something.cc.json&mode=Single`

Load one file and set the area, height and color metrics

- `localhost:3000/?file=something.cc.json&area=rloc&height=sonar_complexity&color=sonar_complexity`

Load two different files and by default show first map in single mode

- `localhost:3000/?file=something.cc.json&file=else.cc.json`
- `localhost:3000/?file=something.cc.json&file=else.cc.json&mode=Single`

Load two files with different versions of the project and show in delta mode

- `localhost:3000/?file=oldFile.cc.json&file=newFile.cc.json&mode=Delta`

Load two files and show in multiple mode to set every project as a child underneath a new root folder

- `localhost:3000/?file=component1.cc.json&file=component2.cc.json&mode=Multiple`
