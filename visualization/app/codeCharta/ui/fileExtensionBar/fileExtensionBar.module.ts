import "../../state/state.module"
import "../../ui/ui"
import angular from "angular"
import { fileExtensionBarComponent } from "./fileExtensionBar.component"

angular
	.module("app.codeCharta.ui.fileExtensionBar", ["app.codeCharta.state", "app.codeCharta.ui.codeMap"])
	.component(fileExtensionBarComponent.selector, fileExtensionBarComponent)
