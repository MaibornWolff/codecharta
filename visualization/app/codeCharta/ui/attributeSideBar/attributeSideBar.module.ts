import "../../state/state.module"
import angular from "angular"
import _ from "lodash"
import { attributeSideBarComponent } from "./attributeSideBar.component"
import { AttributeSideBarService } from "./attributeSideBar.service"
import { attributeSideBarDeltasComponent } from "./attributeSideBar.deltas.component"

angular
	.module("app.codeCharta.ui.attributeSideBar", ["app.codeCharta.state"])
	.component(attributeSideBarComponent.selector, attributeSideBarComponent)
	.component(attributeSideBarDeltasComponent.selector, attributeSideBarDeltasComponent)
	.service(_.camelCase(AttributeSideBarService.name), AttributeSideBarService)
