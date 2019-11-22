import "../../state/state.module"
import "../dialog/dialog.module"
import angular from "angular"
import { downloadButtonComponent } from "./downloadButton.component"

angular
	.module("app.codeCharta.ui.downloadButton", ["app.codeCharta.state", "app.codeCharta.ui.dialog"])
	.component(downloadButtonComponent.selector, downloadButtonComponent)
