import "../../state/state.module"
import angular from "angular"
import { layoutSelectionComponent } from "./layoutSelection.component"

angular
	.module("app.codeCharta.ui.layoutSelection", ["app.codeCharta.state"])
	.component(layoutSelectionComponent.selector, layoutSelectionComponent)
