import "../../state/state.module"
import angular from "angular"
import { attributeTypeSelectorComponent } from "./attributeTypeSelector.component"

angular
	.module("app.codeCharta.ui.attributeTypeSelector", ["app.codeCharta.state"])
	.component(attributeTypeSelectorComponent.selector, attributeTypeSelectorComponent)
