import "../../state/state.module"
import angular from "angular"
import { attributeSideBarComponent } from "./attributeSideBar.component"
import { ccNodePathComponent } from "./ccNodePath/ccNodePath.component"

angular
	.module("app.codeCharta.ui.attributeSideBar", ["app.codeCharta.state"])
	.component(ccNodePathComponent.selector, ccNodePathComponent)
	.component(attributeSideBarComponent.selector, attributeSideBarComponent)
