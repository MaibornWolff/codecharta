import angular from "angular"
import { downgradeComponent } from "@angular/upgrade/static"

import "./artificialIntelligence/artificialIntelligence.module"
import "./screenshotButton/screenshotButton.module"
import "./edgeSettingsPanel/edgeSettingsPanel.module"
import "./presentationModeButton/presentationModeButton.module"
import "./codeMap/codeMap.module"
import "./dialog/dialog.module"
import "./resetSettingsButton/resetSettingsButton.module"
import "./ribbonBar/ribbonBar.module"
import "./toolBar/toolBar.module"
import "./viewCube/viewCube.module"
import { Export3DMapButtonComponent } from "./export3DMapButton/export3DMapButton.component"
import { LegendPanelComponent } from "./legendPanel/legendPanel.component"
import { SliderComponent } from "./slider/slider.component"

angular
	.module("app.codeCharta.ui", [
		"app.codeCharta.ui.artificialIntelligence",
		"app.codeCharta.ui.edgeSettingsPanel",
		"app.codeCharta.ui.presentationModeButton",
		"app.codeCharta.ui.codeMap",
		"app.codeCharta.ui.dialog",
		"app.codeCharta.ui.resetSettingsButton",
		"app.codeCharta.ui.ribbonBar",
		"app.codeCharta.ui.toolBar",
		"app.codeCharta.ui.viewCube"
	])
	.directive("ccExportThreedMapButton", downgradeComponent({ component: Export3DMapButtonComponent }))
	.directive("ccLegendPanel", downgradeComponent({ component: LegendPanelComponent }))
	.directive("ccSlider", downgradeComponent({ component: SliderComponent }))
