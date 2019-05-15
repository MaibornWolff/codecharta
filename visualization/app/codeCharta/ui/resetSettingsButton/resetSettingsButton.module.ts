import "../../state/state.module"

import angular from "angular"

import { resetSettingsButtonComponent } from "./resetSettingsButton.component"

angular
	.module("app.codeCharta.ui.resetSettingsButton", ["app.codeCharta.state"])
	.component(resetSettingsButtonComponent.selector, resetSettingsButtonComponent)
