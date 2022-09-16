import angular from "angular"
import { downgradeComponent } from "@angular/upgrade/static"

import "./screenshotButton/screenshotButton.module"
import "./codeMap/codeMap.module"
import "./dialog/dialog.module"
import "./resetSettingsButton/resetSettingsButton.module"
import "./ribbonBar/ribbonBar.module"
import "./toolBar/toolBar.module"
import "./viewCube/viewCube.module"
import { LegendPanelComponent } from "./legendPanel/legendPanel.component"
import { SliderComponent } from "./slider/slider.component"

angular
	.module("app.codeCharta.ui", ["app.codeCharta.ui.codeMap", "app.codeCharta.ui.dialog", "app.codeCharta.ui.resetSettingsButton"])
	.directive("ccLegendPanel", downgradeComponent({ component: LegendPanelComponent }))
	.directive("ccSlider", downgradeComponent({ component: SliderComponent }))
