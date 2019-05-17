import "../../state/state.module"
import angular from "angular"
import { areaSettingsPanelComponent } from "./areaSettingsPanel.component"

angular
	.module("app.codeCharta.ui.areaSettingsPanel", ["app.codeCharta.state", "app.codeCharta.ui.codeMap"])
	.component(areaSettingsPanelComponent.selector, areaSettingsPanelComponent)
