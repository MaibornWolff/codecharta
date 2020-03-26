import "../../state/state.module"
import angular from "angular"
import { sortingOptionComponent } from "./sortingOption.component"

angular
	.module("app.codeCharta.ui.sortingOptionDialog", ["app.codeCharta.state"])
	.component(sortingOptionComponent.selector, sortingOptionComponent)
