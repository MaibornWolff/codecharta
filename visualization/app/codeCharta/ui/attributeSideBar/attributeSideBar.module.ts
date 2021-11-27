import angular from "angular"
import { downgradeComponent } from "@angular/upgrade/static"

import "../../state/state.module"
import { attributeSideBarComponent } from "./attributeSideBar.component"
import { AttributeSideBarHeaderSectionComponent } from "./attributeSideBarHeaderSection/attributeSideBarHeaderSection.component"
import { AttributeSideBarPrimaryMetricsComponent } from "./attributeSideBarPrimaryMetrics/attributeSideBarPrimaryMetrics.component"
import { AttributeSideBarSecondaryMetricsComponent } from "./attributeSideBarSecondaryMetrics/attributeSideBarSecondaryMetrics.component"

angular
	.module("app.codeCharta.ui.attributeSideBar", ["app.codeCharta.state"])
	.directive("ccAttributeSideBarHeaderSection", downgradeComponent({ component: AttributeSideBarHeaderSectionComponent }))
	.directive("ccAttributeSideBarPrimaryMetrics", downgradeComponent({ component: AttributeSideBarPrimaryMetricsComponent }))
	.directive("ccAttributeSideBarSecondaryMetrics", downgradeComponent({ component: AttributeSideBarSecondaryMetricsComponent }))
	.component(attributeSideBarComponent.selector, attributeSideBarComponent)
