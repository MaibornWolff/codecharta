import angular from "angular"
import { downgradeComponent } from "@angular/upgrade/static"

import "./artificialIntelligence/artificialIntelligence.module"
import "./customConfigs/customConfigs.module"
import "./metricValueHovered/metricValueHovered.module"
import "./downloadButton/downloadButton.module"
import "./screenshotButton/screenshotButton.module"
import "./globalSettingsButton/globalSettingsButton.module"
import "./nodePathPanel/nodePathPanel.module"
import "./edgeSettingsPanel/edgeSettingsPanel.module"
import "./edgeChooser/edgeChooser.module"
import "./presentationModeButton/presentationModeButton.module"
import "./centerMapButton/centerMapButton.module"
import "./searchPanel/searchPanel.module"
import "./searchPanelModeSelector/searchPanelModeSelector.module"
import "./areaSettingsPanel/areaSettingsPanel.module"
import "./blacklistPanel/blacklistPanel.module"
import "./codeMap/codeMap.module"
import "./colorSettingsPanel/colorSettingsPanel.module"
import "./dialog/dialog.module"
import "./fileChooser/fileChooser.module"
import "./fileExtensionBar/fileExtensionBar.module"
import "./heightSettingsPanel/heightSettingsPanel.module"
import "./metricChooser/metricChooser.module"
import "./metricType/metricType.module"
import "./rangeSlider/rangeSlider.module"
import "./resetSettingsButton/resetSettingsButton.module"
import "./filePanel/filePanel.module"
import "./ribbonBar/ribbonBar.module"
import "./scenarioDropDown/scenarioDropDown.module"
import "./toolBar/toolBar.module"
import "./viewCube/viewCube.module"
import "./layoutSelection/layoutSelection.module"
import "./maxTreeMapFiles/maxTreeMapFiles.module"
import "./sharpnessModeSelector/sharpnessModeSelector.module"
import { MetricDeltaSelectedComponent } from "./attributeSideBar/metricDeltaSelected/metricDeltaSelected.component"
import { MapTreeViewComponent } from "./mapTreeView/mapTreeView.component"
import { SortingOptionComponent } from "./sortingOption/sortingOption.component"
import { MatchingFilesCounterComponent } from "./matchingFilesCounter/matchingFilesCounter.component"
import { SortingButtonComponent } from "./sortingButton/sortingButton.component"
import { AttributeTypeSelectorComponent } from "./attributeSideBar/attributeTypeSelector/attributeTypeSelector.component"
import { Export3DMapButtonComponent } from "./export3DMapButton/export3DMapButton.component"
import { LegendPanelComponent } from "./legendPanel/legendPanel.component"

angular
	.module("app.codeCharta.ui", [
		"app.codeCharta.ui.artificialIntelligence",
		"app.codeCharta.ui.customConfigs",
		"app.codeCharta.ui.metricValueHovered",
		"app.codeCharta.ui.downloadButton",
		"app.codeCharta.ui.screenshotButton",
		"app.codeCharta.ui.globalSettingsButton",
		"app.codeCharta.ui.nodePathPanel",
		"app.codeCharta.ui.edgeSettingsPanel",
		"app.codeCharta.ui.edgeChooser",
		"app.codeCharta.ui.presentationModeButton",
		"app.codeCharta.ui.centerMapButton",
		"app.codeCharta.ui.searchPanel",
		"app.codeCharta.ui.searchPanelModeSelector",
		"app.codeCharta.ui.metricType",
		"app.codeCharta.ui.areaSettingsPanel",
		"app.codeCharta.ui.blacklistPanel",
		"app.codeCharta.ui.codeMap",
		"app.codeCharta.ui.colorSettingsPanel",
		"app.codeCharta.ui.dialog",
		"app.codeCharta.ui.fileChooser",
		"app.codeCharta.ui.fileExtensionBar",
		"app.codeCharta.ui.heightSettingsPanel",
		"app.codeCharta.ui.metricChooser",
		"app.codeCharta.ui.metricType",
		"app.codeCharta.ui.rangeSlider",
		"app.codeCharta.ui.resetSettingsButton",
		"app.codeCharta.ui.ribbonBar",
		"app.codeCharta.ui.scenarioDropDown",
		"app.codeCharta.ui.toolBar",
		"app.codeCharta.ui.viewCube",
		"app.codeCharta.ui.layoutSelection",
		"app.codeCharta.ui.sharpnessModeSelector",
		"app.codeCharta.ui.maxTreeMapFiles",
		"app.codeCharta.ui.filePanel"
	])
	.directive("ccSortingButton", downgradeComponent({ component: SortingButtonComponent }))
	.directive("ccSortingOption", downgradeComponent({ component: SortingOptionComponent }))
	.directive("ccMetricDeltaSelected", downgradeComponent({ component: MetricDeltaSelectedComponent }))
	.directive("ccMapTreeView", downgradeComponent({ component: MapTreeViewComponent }))
	.directive("ccMatchingFilesCounter", downgradeComponent({ component: MatchingFilesCounterComponent }))
	.directive("ccAttributeTypeSelector", downgradeComponent({ component: AttributeTypeSelectorComponent }))
	.directive("ccExportThreedMapButton", downgradeComponent({ component: Export3DMapButtonComponent }))
	.directive("ccLegendPanel", downgradeComponent({ component: LegendPanelComponent }))
