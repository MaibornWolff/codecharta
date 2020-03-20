import "../../state/state.module"
import angular from "angular"
import { sortingControlsComponent } from "./sortingControls.component"

angular
	.module("app.codeCharta.ui.sortingControls", ["app.codeCharta.state"])
	.component(sortingControlsComponent.selector, sortingControlsComponent)
