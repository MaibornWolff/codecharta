import "../../state/state.module"
import angular from "angular"
import { sharpnessModeSelectorComponent } from "./sharpnessModeSelector.component"

angular
	.module("app.codeCharta.ui.sharpnessModeSelector", ["app.codeCharta.state"])
	.component(sharpnessModeSelectorComponent.selector, sharpnessModeSelectorComponent)
