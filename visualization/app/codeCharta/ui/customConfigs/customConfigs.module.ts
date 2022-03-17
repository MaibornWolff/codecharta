import "../../state/state.module"
import angular from "angular"
import { customConfigsComponent } from "./customConfigs.component"
import { AddCustomConfigButtonComponent } from "./addCustomConfigButton/addCustomConfigButton.component"
import { downgradeComponent } from "@angular/upgrade/static"

angular
	.module("app.codeCharta.ui.customConfigs", ["app.codeCharta.state"])
	.component(customConfigsComponent.selector, customConfigsComponent)
	.directive("ccAddCustomConfigButton", downgradeComponent({ component: AddCustomConfigButtonComponent }))
