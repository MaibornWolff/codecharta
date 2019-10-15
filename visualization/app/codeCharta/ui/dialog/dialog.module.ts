import angular from "angular"
import "angular-animate"
import "angular-aria"
import "angular-material"
import "../../state/state.module"
import { DialogService } from "./dialog.service"
import _ from "lodash"
import { dialogDownloadComponent } from "./dialog.download.component"
import { dialogGlobalSettingsComponent } from "./dialog.globalSettings.component"

angular
	.module("app.codeCharta.ui.dialog", ["ngMaterial", "app.codeCharta.state"])
	.service(_.camelCase(DialogService.name), DialogService)
	.component(dialogDownloadComponent.selector, dialogDownloadComponent)
	.component(dialogGlobalSettingsComponent.selector, dialogGlobalSettingsComponent)
