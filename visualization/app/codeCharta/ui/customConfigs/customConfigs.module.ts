import "../../state/state.module"
import angular from "angular"
import { customConfigsComponent } from "./customConfigs.component"
import { AddCustomConfigButtonComponent } from "./addCustomConfigButton/addCustomConfigButton.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { DownloadCustomConfigsButtonComponent } from "./downloadCustomConfigsButton/downloadCustomConfigsButton.component"
import { CustomConfigListComponent } from "./customConfigList/customConfigList.component"

angular
	.module("app.codeCharta.ui.customConfigs", ["app.codeCharta.state"])
	.component(customConfigsComponent.selector, customConfigsComponent)
	.directive("ccAddCustomConfigButton", downgradeComponent({ component: AddCustomConfigButtonComponent }))
	.directive("ccDownloadCustomConfigsButton", downgradeComponent({ component: DownloadCustomConfigsButtonComponent }))
	.directive("ccCustomConfigList", downgradeComponent({ component: CustomConfigListComponent }))
