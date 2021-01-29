import "../../state/state.module"
import angular from "angular"
import { sharpnessSelectorComponent } from "./sharpnessSelector.component"

angular
	.module("app.codeCharta.ui.sharpnessSelector", ["app.codeCharta.state"])
	.component(sharpnessSelectorComponent.selector, sharpnessSelectorComponent)
