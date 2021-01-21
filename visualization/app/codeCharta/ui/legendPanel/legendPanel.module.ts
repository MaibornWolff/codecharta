import angular from "angular"
import "../../state/state.module"
import "../codeMap/codeMap.module"
import "../../codeCharta.module"

import { legendPanelComponent } from "./legendPanel.component"
import { legendMarkedPackagesComponent } from "./legendMarkedPackages/legendMarkedPackages.component"

angular
	.module("app.codeCharta.ui.legendPanel", [
		"app.codeCharta.state",
		"app.codeCharta.ui.codeMap",
		"app.codeCharta",
		"app.codeCharta.ui.customColorPicker"
	])
	.component(legendMarkedPackagesComponent.selector, legendMarkedPackagesComponent)
	.component(legendPanelComponent.selector, legendPanelComponent)
