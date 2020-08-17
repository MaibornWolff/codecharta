---
categories:
    - How-to
title: Fixate folders using a custom cc.json
---

# Introduction

The [Squarified-Tree-Map-Algorithm](https://www.win.tue.nl/~vanwijk/stm.pdf) generates a layout for the visualized map.
The layout varies depending on the area of each node. Adding a new file to a folder might increase the area of the parent folder,
so that the algorithm decides that the parent-folder needs to be relocated. Another way to follow this problem is by changing the area-metric.
Notice, that most folders will not be located at the same position as before.

# Fixate folders

In order to prevent folders from changing locations, we introduced a new attribute to the `.cc.json` called `fixed`.
This attribute will not be generated during the analysis. The user needs to edit the `.cc.json` by hand.

# API

```json
 "fixed": {
    "x": 60,
    "y:": 40,
    "width": 35,
    "height": 55
 }
```

```json
"margin": 5
```

The `fixed`-attribute includes a coordinate `x` and `y`. These represent the top-left corner of the folder. `width`
defines the length in x-direction and `height` defines the length in y-direction.

The `margin`-attribute defines how far apart those fixated folders should be.

Note, that these numbers represent percentages. The overall map size is therefore `100`. The `margin` is applied around
the map and between the folders.

## Example

```json
{
	"projectName": "example-project",
	"apiVersion": "1.2",
	"nodes": [
		{
			"name": "root",
			"type": "Folder",
			"attributes": {},
			"children": [
				{
					"name": "folder_1",
					"type": "Folder",
					"attributes": {},
					"children": [
						{
							"name": "children_1",
							"type": "File",
							"attributes": {
								"custom_metric": 2
							},
							"children": []
						}
					],
					"fixed": {
						"x": 5,
						"y:": 5,
						"width": 50,
						"height": 30
					}
				},
				{
					"name": "folder_2",
					"type": "Folder",
					"attributes": {},
					"children": [],
					"fixed": {
						"x": 60,
						"y:": 40,
						"width": 35,
						"height": 55
					}
				}
			]
		}
	],
	"margin": 5
}
```

Notice, that `folder_1` start at `x:5`, `y:5`, because we apply a margin of `5` around the map.
`folder_2` starts at `x:60`, `y:40`, because `folder_1` ends at `x:55`, `y:35` and we apply another margin of `5` between those.

## Restrictions

![Example]({{site.baseurl}}/assets/images/posts/how-to/fixate-folders/fixate-folder-example.jpg)

In order to build a valid custom `.cc.json`, these rules must be followed:

-   The value `x + width + margin` or `y + height + margin` must be <= 100
-   Folders can't overlap and should respect the margin.
-   Only folders on the root can have the `fixed`-attribute
-   If at least one folder is `fixed`, all folders on the root must be `fixed`
-   If `fixed` folders exist, a margin must be specified, otherwise the default of `0` is applied.
