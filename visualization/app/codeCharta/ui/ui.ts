"use strict";

import angular from "angular";

// Plop: Append module import here
import "./settingsPanel/index";
import "./viewCube/viewCube.module";
import "./revisionChooser/revisionChooser";
import "./legendPanel/legendPanel";
import "./fileChooser/fileChooser";
import "./detailPanel/detailPanel";
import "./scenarioButtons/scenarioButtons";
import "./mapTreeView/mapTreeView";
import "./codeMap/codeMap";
import "./metricChooser/metricChooser";
import "./rangeSlider/rangeSlider";
import "./colorSettingsPanel/colorSettingsPanel";
import "./experimentalSettingsPanel/experimentalSettingsPanel";
import "./mapTreeViewSearch/mapTreeViewSearch";
import "./resetSettingsButton/resetSettingsButton";
import "./dialog/dialog";
import "./nodeContextMenu/nodeContextMenu";
import "./ribbonBar/ribbonBar.module";
import "./layoutSwitcher/layoutSwitcher";
import "./optionsPanel/optionsPanel";
import "./weblinksPanel/weblinksPanel";
import "./sidenav/sidenav.module";
import "./blacklistPanel/blacklistPanel";
import "./multipleFilePanel/multipleFilePanel";

angular.module(
    "app.codeCharta.ui",
    [
        // Plop: Append component name here
        "app.codeCharta.ui.viewCube",
        "app.codeCharta.ui.mapTreeView",
        "app.codeCharta.ui.ribbonBar",
        "app.codeCharta.ui.settingsPanel",
        "app.codeCharta.ui.revisionChooser",
        "app.codeCharta.ui.legendPanel",
        "app.codeCharta.ui.fileChooser",
        "app.codeCharta.ui.detailPanel",
        "app.codeCharta.ui.scenarioButtons",
        "app.codeCharta.ui.codeMap",
        "app.codeCharta.ui.metricChooser",
        "app.codeCharta.ui.colorSettingsPanel",
        "app.codeCharta.ui.experimentalSettingsPanel",
        "app.codeCharta.ui.rangeSlider",
        "app.codeCharta.ui.resetSettingsButton",
        "app.codeCharta.ui.dialog",
        "app.codeCharta.ui.nodeContextMenu",
        "app.codeCharta.ui.layoutSwitcher",
        "app.codeCharta.ui.mapTreeViewSearch",
        "app.codeCharta.ui.optionsPanel",
        "app.codeCharta.ui.sidenav",
        "app.codeCharta.ui.blacklistPanel",
        "app.codeCharta.ui.weblinksPanel",
        "app.codeCharta.ui.multipleFilePanel"
    ]);

