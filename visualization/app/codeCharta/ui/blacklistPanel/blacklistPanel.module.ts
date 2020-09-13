import "../rangeSlider/rangeSlider.module"
import "../../state/state.module"

import angular from "angular"

import { blacklistPanelFlattenComponent, blacklistPanelExcludeComponent } from "./blacklistPanel.component"

angular
	.module("app.codeCharta.ui.blacklistPanel", ["app.codeCharta.state"])
	.component(blacklistPanelFlattenComponent.selector, blacklistPanelFlattenComponent)
	.component(blacklistPanelExcludeComponent.selector, blacklistPanelExcludeComponent)
