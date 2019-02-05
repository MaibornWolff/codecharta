import angular from "angular"
import "angular-messages"
import "../../core/core.module"

import { mapTreeViewSearchComponent } from "./mapTreeViewSearch.component"

angular
	.module("app.codeCharta.ui.mapTreeViewSearch", ["app.codeCharta.core", "ngMessages"])
	.component(mapTreeViewSearchComponent.selector, mapTreeViewSearchComponent)
