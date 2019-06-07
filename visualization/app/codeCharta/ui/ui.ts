"use strict"

import angular from "angular"

// Plop: Append module import here
import "./areaSettingsPanel/areaSettingsPanel.module"
import "./metricType/metricType.module"
import "./loadingGif/loadingGif.module"
import "./blacklistPanel/blacklistPanel.module"
import "./codeMap/codeMap.module"
import "./colorSettingsPanel/colorSettingsPanel.module"
import "./detailPanel/detailPanel.module"
import "./dialog/dialog.module"
import "./experimentalSettingsPanel/experimentalSettingsPanel.module"
import "./fileChooser/fileChooser.module"
import "./fileExtensionBar/fileExtensionBar.module"
import "./heightSettingsPanel/heightSettingsPanel.module"
import "./layoutSwitcher/layoutSwitcher.module"
import "./legendPanel/legendPanel.module"
import "./loadingGif/loadingGif.module"
import "./mapTreeView/mapTreeView.module"
import "./mapTreeViewSearch/mapTreeViewSearch.module"
import "./metricChooser/metricChooser.module"
import "./nodeContextMenu/nodeContextMenu.module"
import "./optionsPanel/optionsPanel.module"
import "./rangeSlider/rangeSlider.module"
import "./resetSettingsButton/resetSettingsButton.module"
import "./revisionChooser/revisionChooser.module"
import "./ribbonBar/ribbonBar.module"
import "./scenarioDropDown/scenarioDropDown.module"
import "./settingsPanel/settingsPanel.module"
import "./sidenav/sidenav.module"
import "./viewCube/viewCube.module"
import "./weblinksPanel/weblinksPanel.module"

angular.module("app.codeCharta.ui", [
	// Plop: Append component name here
	"app.codeCharta.ui.metricType",
	"app.codeCharta.ui.areaSettingsPanel",
	"app.codeCharta.ui.blacklistPanel",
	"app.codeCharta.ui.codeMap",
	"app.codeCharta.ui.colorSettingsPanel",
	"app.codeCharta.ui.detailPanel",
	"app.codeCharta.ui.dialog",
	"app.codeCharta.ui.experimentalSettingsPanel",
	"app.codeCharta.ui.fileChooser",
	"app.codeCharta.ui.fileExtensionBar",
	"app.codeCharta.ui.heightSettingsPanel",
	"app.codeCharta.ui.layoutSwitcher",
	"app.codeCharta.ui.legendPanel",
	"app.codeCharta.ui.loadingGif",
	"app.codeCharta.ui.mapTreeView",
	"app.codeCharta.ui.mapTreeViewSearch",
	"app.codeCharta.ui.metricChooser",
	"app.codeCharta.ui.nodeContextMenu",
	"app.codeCharta.ui.optionsPanel",
	"app.codeCharta.ui.rangeSlider",
	"app.codeCharta.ui.resetSettingsButton",
	"app.codeCharta.ui.revisionChooser",
	"app.codeCharta.ui.ribbonBar",
	"app.codeCharta.ui.scenarioDropDown",
	"app.codeCharta.ui.settingsPanel",
	"app.codeCharta.ui.sidenav",
	"app.codeCharta.ui.viewCube",
	"app.codeCharta.ui.weblinksPanel"
])
