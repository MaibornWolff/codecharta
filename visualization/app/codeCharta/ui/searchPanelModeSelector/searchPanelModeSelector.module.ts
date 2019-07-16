import "../../state/state.module"
import angular from "angular"
import { searchPanelModeSelectorComponent } from "./searchPanelModeSelector.component"

angular
	.module("app.codeCharta.ui.searchPanelModeSelector", ["app.codeCharta.state"])
	.component(searchPanelModeSelectorComponent.selector, searchPanelModeSelectorComponent)
