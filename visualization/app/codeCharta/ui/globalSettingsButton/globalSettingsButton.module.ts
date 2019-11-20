import "../../state/state.module"
import "../dialog/dialog.module"
import angular from "angular"
import { globalSettingsButtonComponent } from "./globalSettingsButton.component"

angular
	.module("app.codeCharta.ui.globalSettingsButton", ["app.codeCharta.state", "app.codeCharta.ui.dialog"])
	.component(globalSettingsButtonComponent.selector, globalSettingsButtonComponent)
