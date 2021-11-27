import angular from "angular"
import { downgradeComponent } from "@angular/upgrade/static"

import "../../state/state.module"
import { attributeSideBarComponent } from "./attributeSideBar.component"
import { AttributeSideBarHeaderSectionComponent } from "./attributeSideBarHeaderSection/attributeSideBarHeaderSection.component"

angular
	.module("app.codeCharta.ui.attributeSideBar", ["app.codeCharta.state"])
	.directive("ccAttributeSideBarHeaderSection", downgradeComponent({ component: AttributeSideBarHeaderSectionComponent }))
	.component(attributeSideBarComponent.selector, attributeSideBarComponent)
