---
categories:
    - How-to
title: Fixate folders using a custom cc.json
---

# Introduction

The [Squarified-Tree-Map-Algorithm](https://www.win.tue.nl/~vanwijk/stm.pdf) generates a layout for the visualized map.
The layout varies depending on the area of each node. Adding a new file to a folder might increase the area of the parent folder,
so that the algorithm decides that the parent-folder needs to be relocated. Thus, folders may not be located at the same position anymore as before.
Another way to follow this problem is by changing the area-metric.

# Fixate folders

In order to prevent folders from changing locations, we introduced a new attribute to the `.cc.json` called `fixedPosition`.
This attribute is not auto-generated during the analysis and has to be defined manually by editing the `.cc.json`.

Setting this property is restricted to the top level folders and won't have any effect on sub-folders (folders in folders).

# API

```json
 "fixedPosition": {
    "left": 60,
    "top:": 40,
    "width": 35,
    "height": 55
 }
```

The property values must be numbers in the range between 0 and 100. They represent the size of the value in percent.

## Example

![Example]({{site.baseurl}}/assets/images/posts/how-to/fixate-folders/fixated-folder-example.jpg)

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
					"name": "folder_1_red",
					"type": "Folder",
					"attributes": {},
					"children": [],
					"fixedPosition": {
						"left": 10,
						"top": 10,
						"width": 30,
						"height": 20
					}
				},
				{
					"name": "folder_2_orange",
					"type": "Folder",
					"attributes": {},
					"children": [],
					"fixedPosition": {
						"left": 50,
						"top": 10,
						"width": 40,
						"height": 20
					}
				},
				{
					"name": "folder_3_blue",
					"type": "Folder",
					"attributes": {},
					"children": [],
					"fixedPosition": {
						"left": 10,
						"top": 40,
						"width": 20,
						"height": 50
					}
				},
				{
					"name": "folder_4_green",
					"type": "Folder",
					"attributes": {},
					"children": [],
					"fixedPosition": {
						"left": 40,
						"top": 40,
						"width": 50,
						"height": 20
					}
				},
				{
					"name": "folder_5_magenta",
					"type": "Folder",
					"attributes": {},
					"children": [],
					"fixedPosition": {
						"left": 40,
						"top": 70,
						"width": 50,
						"height": 20
					}
				}
			]
		}
	]
}
```

A margin between folders is recommended. To apply one, set the coordinates for the folder in the top-left corner
to e.g., `left: 10` and `top: 10`. The margin between the border of the map and `folder_1` is therefore `10`. It may be chosen at will.
In order to define the coordinates of adjacent folders, apply any margin between `folder_1` and `folder_2`.
The example uses a margin of `10`, so that the coordinates of `folder_2` must be `left: 50` and `top: 10`.

## Restrictions

The following rules apply in order to build a valid custom `.cc.json`:

-   The values of `left`, `top`, `width` and `height` must be in range of `[0, 100]
-   The value `left + width` or `top + height` must be in a range of `[0, 100]`.
-   Folders may not overlap.
-   Leaving space between folders (for visibility reasons) is recommended.
-   All children of the root folder require the `fixedPosition` attribute.
