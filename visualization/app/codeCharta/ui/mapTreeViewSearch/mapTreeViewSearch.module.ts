import angular from "angular"
import "angular-messages"
import "../../state/state.module"
import "../../codeCharta.module"

import { mapTreeViewSearchComponent } from "./mapTreeViewSearch.component"

angular
	.module("app.codeCharta.ui.mapTreeViewSearch", ["app.codeCharta.state", "ngMessages", "app.codeCharta"])
	.component(mapTreeViewSearchComponent.selector, mapTreeViewSearchComponent)
