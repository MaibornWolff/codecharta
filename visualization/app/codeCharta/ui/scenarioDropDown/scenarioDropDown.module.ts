import angular from "angular"
import { scenarioDropDownComponent } from "./scenarioDropDown.component"

angular
	.module("app.codeCharta.ui.scenarioDropDown", ["app.codeCharta.ui.codeMap.threeViewer", "app.codeCharta.state"])
	.component(scenarioDropDownComponent.selector, scenarioDropDownComponent)
