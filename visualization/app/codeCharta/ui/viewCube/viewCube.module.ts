import angular from "angular"
import "../codeMap/threeViewer/threeViewer.module"
import { viewCubeComponent } from "./viewCube.component"
import { ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service"
import _ from "lodash"

angular
	.module("app.codeCharta.ui.viewCube", ["app.codeCharta.ui.codeMap.threeViewer"])
	.component(viewCubeComponent.selector, viewCubeComponent)
	.service(_.camelCase(ViewCubeMouseEventsService.name), ViewCubeMouseEventsService)
