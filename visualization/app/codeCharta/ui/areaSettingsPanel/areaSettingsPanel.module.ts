import "../../state/state.module"
import angular from "angular"
import { areaSettingsPanelComponent } from "./areaSettingsPanel.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { InvertAreaOptionComponent } from "./invertAreaOption/invertAreaOption.component"

angular
	.module("app.codeCharta.ui.areaSettingsPanel", ["app.codeCharta.state", "app.codeCharta.ui.codeMap"])
	.component(areaSettingsPanelComponent.selector, areaSettingsPanelComponent)
	.directive("ccInvertAreaOption", downgradeComponent({ component: InvertAreaOptionComponent }))
