import "../../state/state.module"
import angular from "angular"
import { unfocusButtonComponent } from "./unfocusButton.component"

angular
	.module("app.codeCharta.ui.unfocusButton", ["app.codeCharta.state"])
	.component(unfocusButtonComponent.selector, unfocusButtonComponent)
