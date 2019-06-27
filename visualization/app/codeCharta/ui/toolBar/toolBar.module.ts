import "../../state/state.module"
import "../dialog/dialog.module"

import angular from "angular"
import { toolBarComponent } from "./toolBar.component"

angular
	.module("app.codeCharta.ui.toolBar", ["app.codeCharta.state", "app.codeCharta.ui.dialog"])
	.component(toolBarComponent.selector, toolBarComponent)
