import angular from "angular"
import "angular-animate"
import "angular-aria"
import "angular-material"
import "../../state/state.module"
import { DialogService } from "./dialog.service"
import camelCase from "lodash.camelcase"
import { dialogDownloadComponent } from "./dialog.download.component"

angular
	.module("app.codeCharta.ui.dialog", ["ngMaterial", "app.codeCharta.state"])
	.service(camelCase(DialogService.name), DialogService)
	.component(dialogDownloadComponent.selector, dialogDownloadComponent)
