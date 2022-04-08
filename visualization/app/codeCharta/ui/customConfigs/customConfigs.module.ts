import "../../state/state.module"
import angular from "angular"
import { customConfigsComponent } from "./customConfigs.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { OpenCustomConfigsButtonComponent } from "./openCustomConfigsButton.component"
import { AddCustomConfigButtonComponent } from "./addCustomConfigButton/addCustomConfigButton.component"

angular
	.module("app.codeCharta.ui.customConfigs", ["app.codeCharta.state"])
	.component(customConfigsComponent.selector, customConfigsComponent)
	.directive("ccAddCustomConfigButton", downgradeComponent({ component: AddCustomConfigButtonComponent }))
	//.directive("ccDownloadCustomConfigsButton", downgradeComponent({ component: DownloadCustomConfigsButtonComponent }))
	//.directive("ccUploadCustomConfigButton", downgradeComponent({ component: UploadCustomConfigButtonComponent }))
	.directive("ccOpenCustomConfigsButton", downgradeComponent({ component: OpenCustomConfigsButtonComponent }))
