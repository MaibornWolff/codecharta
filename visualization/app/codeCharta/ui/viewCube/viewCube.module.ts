import angular from "angular"
import "../codeMap/threeViewer/threeViewer.module"
import { viewCubeComponent } from "./viewCube.component"
import { ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service"
import camelCase from "lodash.camelcase"

angular
	.module("app.codeCharta.ui.viewCube", ["app.codeCharta.ui.codeMap.threeViewer"])
	.component(viewCubeComponent.selector, viewCubeComponent)
	.service(camelCase(ViewCubeMouseEventsService.name), ViewCubeMouseEventsService)
