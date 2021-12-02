import angular from "angular"
import { downgradeComponent } from "@angular/upgrade/static"

import "../../state/state.module"
import "../codeMap/codeMap.module"
import "../../codeCharta.module"
import { legendPanelComponent } from "./legendPanel.component"
import { LegendMarkedPackagesComponent } from "./legendMarkedPackages/legendMarkedPackages.component"

angular
	.module("app.codeCharta.ui.legendPanel", [
		"app.codeCharta.state",
		"app.codeCharta.ui.codeMap",
		"app.codeCharta",
		"app.codeCharta.ui.customColorPicker"
	])
	.directive("ccLegendMarkedPackages", downgradeComponent({ component: LegendMarkedPackagesComponent }))
	.component(legendPanelComponent.selector, legendPanelComponent)
