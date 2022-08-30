import angular from "angular"
import camelCase from "lodash.camelcase"
import { downgradeComponent, downgradeInjectable } from "@angular/upgrade/static"

import "./threeViewer/threeViewer.module"
import "../../state/state.module"
import { codeMapComponent } from "./codeMap.component"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { CodeMapRenderService } from "./codeMap.render.service"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CodeMapPreRenderService } from "./codeMap.preRender.service"
import { AttributeSideBarComponent } from "../attributeSideBar/attributeSideBar.component"
import { ViewCubeComponent } from "../viewCube/viewCube.component"
import { ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"

angular
	.module("app.codeCharta.ui.codeMap", ["app.codeCharta.state", "app.codeCharta", "app.codeCharta.ui.codeMap.threeViewer"])
	.factory("viewCubeMouseEvents", downgradeInjectable(ViewCubeMouseEventsService))
	.component(codeMapComponent.selector, codeMapComponent)
	.directive("ccAttributeSideBar", downgradeComponent({ component: AttributeSideBarComponent }))
	.service(camelCase(CodeMapRenderService.name), CodeMapRenderService)
	.service(camelCase(CodeMapPreRenderService.name), CodeMapPreRenderService)
	.service(camelCase(CodeMapMouseEventService.name), CodeMapMouseEventService)
	.service(camelCase(CodeMapLabelService.name), CodeMapLabelService)
	.service(camelCase(CodeMapArrowService.name), CodeMapArrowService)
	.directive("ccViewCube", downgradeComponent({ component: ViewCubeComponent }))
