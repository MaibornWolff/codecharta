"use strict";

import angular from "angular";

// Plop: Append module import here
import "./areaSettingsPanel/areaSettingsPanel.module.ts";
import "./heightSettingsPanel/heightSettingsPanel.module.ts";
import "./settingsPanel/settingsPanel.module";
import "./viewCube/viewCube.module";
import "./revisionChooser/revisionChooser";
import "./legendPanel/legendPanel";
import "./fileChooser/fileChooser.module";
import "./detailPanel/detailPanel";
import "./scenarioDropDown/scenarioDropDown.module";
import "./mapTreeView/mapTreeView";
import "./codeMap/codeMap";
import "./metricChooser/metricChooser";
import "./rangeSlider/rangeSlider";
import "./colorSettingsPanel/colorSettingsPanel";
import "./experimentalSettingsPanel/experimentalSettingsPanel";
import "./mapTreeViewSearch/mapTreeViewSearch.module";
import "./resetSettingsButton/resetSettingsButton";
import "./dialog/dialog";
import "./nodeContextMenu/nodeContextMenu";
import "./ribbonBar/ribbonBar.module";
import "./layoutSwitcher/layoutSwitcher.module";
import "./optionsPanel/optionsPanel.module";
import "./weblinksPanel/weblinksPanel.module";
import "./sidenav/sidenav.module";
import "./blacklistPanel/blacklistPanel.module";
import "./tooltip/tooltip.module"

angular.module(
    "app.codeCharta.ui",
    [
        // Plop: Append component name here
        "app.codeCharta.ui.ribbonBar",
        "app.codeCharta.ui.codeMap",
        "app.codeCharta.ui.metricChooser",
        "app.codeCharta.ui.resetSettingsButton",
        "app.codeCharta.ui.rangeSlider",
        "app.codeCharta.ui.colorSettingsPanel",
        "app.codeCharta.ui.heightSettingsPanel",
        "app.codeCharta.ui.areaSettingsPanel",
        "app.codeCharta.ui.revisionChooser",
        "app.codeCharta.ui.viewCube",
        "app.codeCharta.ui.dialog",
        "app.codeCharta.ui.sidenav",
        "app.codeCharta.ui.settingsPanel",
        "app.codeCharta.ui.nodeContextMenu",
        "app.codeCharta.ui.legendPanel",
        "app.codeCharta.ui.detailPanel",
        "app.codeCharta.ui.optionsPanel",
        "app.codeCharta.ui.blacklistPanel",
        "app.codeCharta.ui.weblinksPanel",
        "app.codeCharta.ui.mapTreeViewSearch",
        "app.codeCharta.ui.mapTreeView",
        "app.codeCharta.ui.scenarioDropDown",
        "app.codeCharta.ui.fileChooser",
        "app.codeCharta.ui.experimentalSettingsPanel",
        "app.codeCharta.ui.layoutSwitcher",
        "app.codeCharta.ui.tooltip"
    ]);

