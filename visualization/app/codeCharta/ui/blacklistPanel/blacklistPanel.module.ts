import "../rangeSlider/rangeSlider.module"
import "../../state/state.module"

import angular from "angular"

import { blacklistPanelComponent } from "./blacklistPanel.component"

angular
	.module("app.codeCharta.ui.blacklistPanel", ["app.codeCharta.state"])
	.component(blacklistPanelComponent.selector, blacklistPanelComponent)
