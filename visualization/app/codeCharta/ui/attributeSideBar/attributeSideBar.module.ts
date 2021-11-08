import angular from "angular"
import { downgradeComponent } from "@angular/upgrade/static"

import "../../state/state.module"
import { attributeSideBarComponent } from "./attributeSideBar.component"
import { NodePathComponent } from "./nodePath/nodePath.component"

angular
	.module("app.codeCharta.ui.attributeSideBar", ["app.codeCharta.state"])
	.directive("ccNodePath", downgradeComponent({ component: NodePathComponent }))
	.component(attributeSideBarComponent.selector, attributeSideBarComponent)
