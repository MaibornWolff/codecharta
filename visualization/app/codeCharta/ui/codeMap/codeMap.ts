import angular from "angular";

import "./threeViewer/threeViewer";
import "../../state/state.module";
import "../../core/treemap/treemap.module";

import {codeMapComponent} from "./codeMap.component";
import {CodeMapMouseEventService} from "./codeMap.mouseEvent.service";
import {CodeMapRenderService} from "./codeMap.render.service";
import {CodeMapActionsService} from "./codeMap.actions.service";
import {CodeMapUtilService} from "./codeMap.util.service";
import {CodeMapLabelService} from "./codeMap.label.service";
import {CodeMapArrowService} from "./codeMap.arrow.service";

angular.module("app.codeCharta.ui.codeMap",["app.codeCharta.state", "app.codeCharta.core.treemap", "app.codeCharta.ui.codeMap.threeViewer"])
.component(
    codeMapComponent.selector,
    codeMapComponent
).service(
    CodeMapRenderService.SELECTOR,
    CodeMapRenderService
).service(
    CodeMapMouseEventService.SELECTOR,
    CodeMapMouseEventService
).service(
    CodeMapActionsService.SELECTOR,
    CodeMapActionsService
).service(
    CodeMapUtilService.SELECTOR,
    CodeMapUtilService
).service(
    CodeMapLabelService.SELECTOR,
    CodeMapLabelService
).service(
    CodeMapArrowService.SELECTOR,
    CodeMapArrowService
);