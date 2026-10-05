---
title: "Viewcube"
---

The **Viewcube** is the navigation widget in the top-right corner of the 3D map. It mirrors the orientation of the map's camera as a small 3D cube and lets you snap to a fixed viewing angle with a single click. Next to it sits the zoom slider.

![The Viewcube in the top-right corner, with the zoom slider](/assets/images/docs/visualization/user-controls/viewcube.jpeg)

The cube always reflects the current camera: as you orbit the map, the cube rotates in sync, so it doubles as a compass for the 3D scene. To its right is a vertical zoom slider showing the current zoom level (140% in the screenshot above).

The Viewcube belongs to the 3D [layouts](/docs/visualization/user-controls/layouts); the flat Sunburst and Radial TreeMap layouts have no camera to turn.

## Changing the camera angle

The cube is divided into clickable regions: its **faces**, **edges**, and **corners**. Clicking any of these snaps the map's camera to the matching perspective:

- **Faces** give you the straight-on views, for example looking down on the map from directly above (top), or head-on from the front or a side.
- **Edges** give you the angled views between two faces, such as a tilted top-front or top-side perspective.
- **Corners** give you the diagonal **isometric** views, looking at the map from above and off to one side at the same time.

As you hover over the cube, the region under the cursor highlights so you can see which perspective you are about to jump to. Clicking it rotates the camera to that fixed orientation. You can also **drag directly on the cube** to orbit the map freely, just as you would by dragging on the map itself.

To return to the default framing, use the **Center map** tool on the metric bar. It recenters and re-fits the camera so the whole map is in view again. See [Map Tools](/docs/visualization/user-controls/map-tools).

## Zooming

The vertical **zoom slider** to the right of the cube controls how close the camera is to the map. It runs from **10%** (zoomed all the way out) to **200%** (zoomed all the way in), and the current value is shown as a percentage beneath the slider.

You can:

- **Drag the slider handle** to set the zoom level directly.
- Use the **`+`** and **`-`** buttons at the top and bottom of the slider to step the zoom in or out in increments of 10%.

The slider stays in sync with zooming you do directly on the map (for example with the mouse wheel), so it always reflects the current zoom level.

## Center, screenshot and flashlight

The three buttons that used to sit above the cube — center map, screenshot and flashlight — are now on the tab at the right edge of the metric bar. See [Map Tools](/docs/visualization/user-controls/map-tools).
