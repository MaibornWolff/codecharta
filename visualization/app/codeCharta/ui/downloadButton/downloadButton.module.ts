import "../../state/state.module"
import "../dialog/dialog.module"
import angular from "angular"
import { downloadButtonComponent } from "./downloadButton.component"
import { isStandalone } from "../../util/envDetector"
import { downloadButtonStandaloneComponent } from "./downloadButton.standalone.component"

const module = angular.module("app.codeCharta.ui.downloadButton", ["app.codeCharta.state", "app.codeCharta.ui.dialog"])

if (isStandalone()) {
	module.component(downloadButtonStandaloneComponent.selector, downloadButtonStandaloneComponent)
} else {
	module.component(downloadButtonComponent.selector, downloadButtonComponent)
}
