import "../../state/state.module"

import angular from "angular"

import { weblinksPanelComponent } from "./weblinksPanel.component"

angular
	.module("app.codeCharta.ui.weblinksPanel", ["app.codeCharta.state"])
	.component(weblinksPanelComponent.selector, weblinksPanelComponent)
