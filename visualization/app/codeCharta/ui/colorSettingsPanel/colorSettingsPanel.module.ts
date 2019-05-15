import "../../state/state.module"

import angular from "angular"

import { colorSettingsPanelComponent } from "./colorSettingsPanel.component"

angular
	.module("app.codeCharta.ui.colorSettingsPanel", ["app.codeCharta.state"])
	.component(colorSettingsPanelComponent.selector, colorSettingsPanelComponent)
