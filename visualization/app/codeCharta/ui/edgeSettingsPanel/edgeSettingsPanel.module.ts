import "../../state/state.module"
import angular from "angular"
import { edgeSettingsPanelComponent } from "./edgeSettingsPanel.component"

angular
	.module("app.codeCharta.ui.edgeSettingsPanel", ["app.codeCharta.state"])
	.component(edgeSettingsPanelComponent.selector, edgeSettingsPanelComponent)
