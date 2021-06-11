import "../../state/state.module"
import "../dialog/dialog.module"

import angular from "angular"
import { screenshotButtonComponent } from "./screenshotButton.component"

angular
	.module("app.codeCharta.ui.screenshotButton", ["app.codeCharta.state", "app.codeCharta.ui.dialog"])
	.component(screenshotButtonComponent.selector, screenshotButtonComponent)
