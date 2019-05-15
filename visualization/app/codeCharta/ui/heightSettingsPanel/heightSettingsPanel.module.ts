import "../../state/state.module"
import angular from "angular"
import { heightSettingsPanelComponent } from "./heightSettingsPanel.component"

angular
	.module("app.codeCharta.ui.heightSettingsPanel", ["app.codeCharta.state"])
	.component(heightSettingsPanelComponent.selector, heightSettingsPanelComponent)
