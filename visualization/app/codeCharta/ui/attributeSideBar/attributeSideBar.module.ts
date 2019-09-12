import "../../state/state.module"
import angular from "angular"
import _ from "lodash"
import { attributeSideBarComponent } from "./attributeSideBar.component"
import { AttributeSideBarService } from "./attributeSideBar.service"

angular
	.module("app.codeCharta.ui.attributeSideBar", ["app.codeCharta.state"])
	.component(attributeSideBarComponent.selector, attributeSideBarComponent)
	.service(_.camelCase(AttributeSideBarService.name), AttributeSideBarService)
