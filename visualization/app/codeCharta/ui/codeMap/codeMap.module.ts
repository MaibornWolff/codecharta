import angular from "angular"
import camelCase from "lodash.camelcase"
import { downgradeComponent, downgradeInjectable } from "@angular/upgrade/static"

import "./threeViewer/threeViewer.module"
import "../../state/state.module"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { CodeMapRenderService } from "./codeMap.render.service"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { AttributeSideBarComponent } from "../attributeSideBar/attributeSideBar.component"
import { ViewCubeComponent } from "../viewCube/viewCube.component"
import { ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ViewCubeModule } from "../viewCube/viewCube.module"
import { AttributeSideBarModule } from "../attributeSideBar/attributeSideBar.module"
import { CodeMapComponent } from "./codeMap.component"

angular
	.module("app.codeCharta.ui.codeMap", ["app.codeCharta.state", "app.codeCharta", "app.codeCharta.ui.codeMap.threeViewer"])
	.factory("viewCubeMouseEvents", downgradeInjectable(ViewCubeMouseEventsService))
	.directive("ccAttributeSideBar", downgradeComponent({ component: AttributeSideBarComponent }))
	.service(camelCase(CodeMapRenderService.name), CodeMapRenderService)
	.service(camelCase(CodeMapMouseEventService.name), CodeMapMouseEventService)
	.service(camelCase(CodeMapLabelService.name), CodeMapLabelService)
	.service(camelCase(CodeMapArrowService.name), CodeMapArrowService)
	.directive("ccViewCube", downgradeComponent({ component: ViewCubeComponent }))

@NgModule({
	imports: [CommonModule, ViewCubeModule, AttributeSideBarModule],
	declarations: [CodeMapComponent],
	exports: [CodeMapComponent]
})
export class CodeMapModule {}
