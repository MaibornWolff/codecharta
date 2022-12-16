---
permalink: /docs/user-controls/
title: "User Controls"

gallery:
    - url: "/assets/images/docs/visualization/user-controls.png"
      image_path: "/assets/images/docs/visualization/user-controls.png"
      title: "User Controls"
---

{% include gallery %}

The controls that are available to you are:

| #   | Type            | Action                                                                                                                                                                                                                                                           |
| --- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Settings        | Load cc.json map or multiple maps (_hold shift_).                                                                                                                                                                                                                |
| 2   | Settings        | Download the current map as a JSON-file. **Deprecation Warning!** This feature will soon be removed. It is already replaced by the controls nr. 15 and 16.                                                                                                       |
| 3   | Settings        | Export screenshot as a file.                                                                                                                                                                                                                                     |
| 4   | Settings        | Copy the names of files with highest metric values to clipboard.                                                                                                                                                                                                 |
| 5   | Settings        | Download model as stl-file for 3D-printing.                                                                                                                                                                                                                      |
| 6   | Settings        | Switch between showing maps in **standard mode** or seeing the **delta** between two maps, provided you have loaded multiple maps.                                                                                                                               |
| 7   | Settings        | Select the map being shown.                                                                                                                                                                                                                                      |
| 8   | Settings        | Turn on/off **presentation mode**. Beneficial when using a projector.                                                                                                                                                                                            |
| 9   | Settings        | Global settings like background color map layout, quality and experimental features.                                                                                                                                                                             |
| 10  | Metric Controls | The **distribution bar** shows the distribution of file extensions for a metric.                                                                                                                                                                                 |
| 11  | Search/Filter   | Search for buildings [.gitignore style](https://git-scm.com/docs/gitignore).                                                                                                                                                                                     |
| 12  | Search/Filter   | Hide/exclude the buildings from the search result. **Hidden** buildings are flattened in the map, **excluded** buildings are no longer visible. Useful if you have lots of vendor code in your map.                                                              |
| 13  | Search/Filter   | Switch between the treeview or see the hidden and excluded buildings. The latter menus can be used to restore these buildings again.                                                                                                                             |
| 14  | Metric Controls | Select a scenario, which changes multiple metrics at once.                                                                                                                                                                                                       |
| 15  | Metric Controls | Save, load and manage individual configurations of the selected map.                                                                                                                                                                                             |
| 16  | Metric Controls | Add the current view of the map as a custom configuration.                                                                                                                                                                                                       |
| 17  | Metric Controls | Use the **metric bar** to select a metrics per building area, height and color. Click on the arrow to change metric details such as color range. If your map has the right data, you can also display edges between buildings and change the number of previews. |
| 18  | Metric Controls | Link height and color metric to be the same metric.                                                                                                                                                                                                              |
| 19  | Navigation      | Use the Viewcube to quickly change the camera perspective or reset the view by clicking the compass icon.                                                                                                                                                        |
| 20  | Exploration     | Explore metrics for each building. Hover over the building to see its name and metric displayed in the metric bar. Click on it to view additional details. If you have imported sonar metrics, buildings can also be **double clicked** to see sonar details.    |
| 21  | Exploration     | The tallest buildings automatically gets a label. You can change that in the height metric details.                                                                                                                                                              |
