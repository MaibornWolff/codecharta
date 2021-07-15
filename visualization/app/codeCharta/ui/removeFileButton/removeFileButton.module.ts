import "../../state/state.module"
import angular from "angular"
import { removeFileButtonComponent } from "./removeFileButton.component"

angular
	.module("app.codeCharta.ui.removeFileButton", ["app.codeCharta.state"])
	.component(removeFileButtonComponent.selector, removeFileButtonComponent)
