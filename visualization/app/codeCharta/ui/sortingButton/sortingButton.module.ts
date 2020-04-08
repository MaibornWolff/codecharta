import "../../state/state.module"
import angular from "angular"
import { sortingButtonComponent } from "./sortingButton.component"

angular
	.module("app.codeCharta.ui.sortingButton", ["app.codeCharta.state"])
	.component(sortingButtonComponent.selector, sortingButtonComponent)
