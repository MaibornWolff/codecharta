import { MatDialog } from "@angular/material/dialog"
import { downgradeInjectable } from "@angular/upgrade/static"
import angular from "angular"
import { scenarioDropDownComponent } from "./scenarioDropDown.component"

angular
	.module("app.codeCharta.ui.scenarioDropDown", ["app.codeCharta.ui.codeMap.threeViewer", "app.codeCharta.state"])
	.component(scenarioDropDownComponent.selector, scenarioDropDownComponent)
	.factory("dialog", downgradeInjectable(MatDialog))
