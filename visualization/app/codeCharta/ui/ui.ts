"use strict"

import angular from "angular"

// Plop: Append module import here
import "./metricValueHovered/metricValueHovered.module"
import "./downloadButton/downloadButton.module"
import "./globalSettingsButton/globalSettingsButton.module"
import "./metricDeltaSelected/metricDeltaSelected.module"
import "./nodePathPanel/nodePathPanel.module"
import "./attributeSideBar/attributeSideBar.module"
import "./edgeSettingsPanel/edgeSettingsPanel.module"
import "./edgeChooser/edgeChooser.module"
import "./presentationModeButton/presentationModeButton.module"
import "./centerMapButton/centerMapButton.module"
import "./matchingFilesCounter/matchingFilesCounter.module"
import "./searchPanel/searchPanel.module"
import "./searchPanelModeSelector/searchPanelModeSelector.module"
import "./searchBar/searchBar.module"
import "./areaSettingsPanel/areaSettingsPanel.module"
import "./blacklistPanel/blacklistPanel.module"
import "./codeMap/codeMap.module"
import "./colorSettingsPanel/colorSettingsPanel.module"
import "./dialog/dialog.module"
import "./fileChooser/fileChooser.module"
import "./fileExtensionBar/fileExtensionBar.module"
import "./heightSettingsPanel/heightSettingsPanel.module"
import "./legendPanel/legendPanel.module"
import "./loadingGif/loadingGif.module"
import "./mapTreeView/mapTreeView.module"
import "./metricChooser/metricChooser.module"
import "./metricType/metricType.module"
import "./nodeContextMenu/nodeContextMenu.module"
import "./rangeSlider/rangeSlider.module"
import "./resetSettingsButton/resetSettingsButton.module"
import "./filePanel/filePanel.module"
import "./ribbonBar/ribbonBar.module"
import "./scenarioDropDown/scenarioDropDown.module"
import "./toolBar/toolBar.module"
import "./viewCube/viewCube.module"

angular.module("app.codeCharta.ui", [
	// Plop: Append component name here
	"app.codeCharta.ui.metricValueHovered",
	"app.codeCharta.ui.downloadButton",
	"app.codeCharta.ui.globalSettingsButton",
	"app.codeCharta.ui.metricDeltaSelected",
	"app.codeCharta.ui.nodePathPanel",
	"app.codeCharta.ui.attributeSideBar",
	"app.codeCharta.ui.edgeSettingsPanel",
	"app.codeCharta.ui.edgeChooser",
	"app.codeCharta.ui.presentationModeButton",
	"app.codeCharta.ui.centerMapButton",
	"app.codeCharta.ui.matchingFilesCounter",
	"app.codeCharta.ui.searchPanel",
	"app.codeCharta.ui.searchPanelModeSelector",
	"app.codeCharta.ui.searchBar",
	"app.codeCharta.ui.metricType",
	"app.codeCharta.ui.areaSettingsPanel",
	"app.codeCharta.ui.blacklistPanel",
	"app.codeCharta.ui.codeMap",
	"app.codeCharta.ui.colorSettingsPanel",
	"app.codeCharta.ui.dialog",
	"app.codeCharta.ui.fileChooser",
	"app.codeCharta.ui.fileExtensionBar",
	"app.codeCharta.ui.filePanel",
	"app.codeCharta.ui.heightSettingsPanel",
	"app.codeCharta.ui.legendPanel",
	"app.codeCharta.ui.loadingGif",
	"app.codeCharta.ui.mapTreeView",
	"app.codeCharta.ui.metricChooser",
	"app.codeCharta.ui.metricType",
	"app.codeCharta.ui.nodeContextMenu",
	"app.codeCharta.ui.rangeSlider",
	"app.codeCharta.ui.resetSettingsButton",
	"app.codeCharta.ui.ribbonBar",
	"app.codeCharta.ui.scenarioDropDown",
	"app.codeCharta.ui.toolBar",
	"app.codeCharta.ui.viewCube"
])
