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
import _ from "lodash"

angular
	.module("app.codeCharta.ui.codeMap", ["app.codeCharta.state", "app.codeCharta", "app.codeCharta.ui.codeMap.threeViewer"])
	.component(codeMapComponent.selector, codeMapComponent)
	.service(_.camelCase(CodeMapRenderService.name), CodeMapRenderService)
	.service(_.camelCase(CodeMapPreRenderService.name), CodeMapPreRenderService)
	.service(_.camelCase(CodeMapMouseEventService.name), CodeMapMouseEventService)
	.service(_.camelCase(CodeMapActionsService.name), CodeMapActionsService)
	.service(_.camelCase(CodeMapLabelService.name), CodeMapLabelService)
	.service(_.camelCase(CodeMapArrowService.name), CodeMapArrowService)
