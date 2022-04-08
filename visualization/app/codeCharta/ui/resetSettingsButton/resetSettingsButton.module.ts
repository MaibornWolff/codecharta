import "../../state/state.module"

import angular from "angular"

import { ResetSettingsButtonComponent } from "./resetSettingsButton.component"
import { downgradeComponent } from "@angular/upgrade/static"

angular
	.module("app.codeCharta.ui.resetSettingsButton", ["app.codeCharta.state"])
	.directive("ccResetSettingsButton", downgradeComponent({ component: ResetSettingsButtonComponent }))
