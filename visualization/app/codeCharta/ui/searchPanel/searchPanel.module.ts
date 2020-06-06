import "../../state/state.module"
import angular from "angular"
import { searchPanelComponent } from "./searchPanel.component"

angular
	.module("app.codeCharta.ui.searchPanel", ["app.codeCharta.state"])
	.component(searchPanelComponent.selector, searchPanelComponent)
