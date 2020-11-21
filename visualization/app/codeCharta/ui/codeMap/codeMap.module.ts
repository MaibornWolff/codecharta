import angular from "angular"

import "./threeViewer/threeViewer.module"
import "../../state/state.module"

import { codeMapComponent } from "./codeMap.component"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { CodeMapRenderService } from "./codeMap.render.service"
import { CodeMapActionsService } from "./codeMap.actions.service"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CodeMapPreRenderService } from "./codeMap.preRender.service"
import camelCase from "lodash.camelcase"

angular
	.module("app.codeCharta.ui.codeMap", ["app.codeCharta.state", "app.codeCharta", "app.codeCharta.ui.codeMap.threeViewer"])
	.component(codeMapComponent.selector, codeMapComponent)
	.service(camelCase(CodeMapRenderService.name), CodeMapRenderService)
	.service(camelCase(CodeMapPreRenderService.name), CodeMapPreRenderService)
	.service(camelCase(CodeMapMouseEventService.name), CodeMapMouseEventService)
	.service(camelCase(CodeMapActionsService.name), CodeMapActionsService)
	.service(camelCase(CodeMapLabelService.name), CodeMapLabelService)
	.service(camelCase(CodeMapArrowService.name), CodeMapArrowService)
