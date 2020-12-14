import "../../state/state.module"
import angular from "angular"
import { attributeSideBarComponent } from "./attributeSideBar.component"
import { nodePathComponent } from "./nodePath/nodePath.component"

angular
	.module("app.codeCharta.ui.attributeSideBar", ["app.codeCharta.state"])
	.component(nodePathComponent.selector, nodePathComponent)
	.component(attributeSideBarComponent.selector, attributeSideBarComponent)
