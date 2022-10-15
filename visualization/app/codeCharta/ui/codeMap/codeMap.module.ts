import angular from "angular"
import camelCase from "lodash.camelcase"
import { downgradeInjectable } from "@angular/upgrade/static"

import "./threeViewer/threeViewer.module"
import "../../state/state.module"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { CodeMapRenderService } from "./codeMap.render.service"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ViewCubeModule } from "../viewCube/viewCube.module"
import { AttributeSideBarModule } from "../attributeSideBar/attributeSideBar.module"
import { CodeMapComponent } from "./codeMap.component"

angular
	.module("app.codeCharta.ui.codeMap", ["app.codeCharta.state", "app.codeCharta", "app.codeCharta.ui.codeMap.threeViewer"])
	.factory("viewCubeMouseEvents", downgradeInjectable(ViewCubeMouseEventsService))
	.service(camelCase(CodeMapRenderService.name), CodeMapRenderService)
	.service(camelCase(CodeMapMouseEventService.name), CodeMapMouseEventService)
	.factory("codeMapLabelService", downgradeInjectable(CodeMapLabelService))
	.factory("codeMapArrowService", downgradeInjectable(CodeMapArrowService))

@NgModule({
	imports: [CommonModule, ViewCubeModule, AttributeSideBarModule],
	declarations: [CodeMapComponent],
	exports: [CodeMapComponent]
})
export class CodeMapModule {}
