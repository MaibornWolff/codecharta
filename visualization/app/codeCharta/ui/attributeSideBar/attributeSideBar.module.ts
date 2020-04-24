import "../../state/state.module"
import angular from "angular"
import { attributeSideBarComponent } from "./attributeSideBar.component"

angular
	.module("app.codeCharta.ui.attributeSideBar", ["app.codeCharta.state"])
	.component(attributeSideBarComponent.selector, attributeSideBarComponent)
