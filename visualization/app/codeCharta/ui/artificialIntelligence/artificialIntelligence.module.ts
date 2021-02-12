import "../../state/state.module"
import angular from "angular"
import { artificialIntelligenceComponent } from "./artificialIntelligence.component"

angular
	.module("app.codeCharta.ui.artificialIntelligence", ["app.codeCharta.state"])
	.component(artificialIntelligenceComponent.selector, artificialIntelligenceComponent)
