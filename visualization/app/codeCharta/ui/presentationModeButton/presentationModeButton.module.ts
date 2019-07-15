import "../../state/state.module"
import angular from "angular"
import { presentationModeButtonComponent } from "./presentationModeButton.component"

angular
	.module("app.codeCharta.ui.presentationModeButton", ["app.codeCharta.state"])
	.component(presentationModeButtonComponent.selector, presentationModeButtonComponent)
