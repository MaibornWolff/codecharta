import angular from "angular";

import "./threeViewer/threeViewer.module";
import "../../state/state.module";
import "./treemap/treemap.module";

import {codeMapComponent} from "./codeMap.component";
import {CodeMapMouseEventService} from "./codeMap.mouseEvent.service";
import {CodeMapRenderService} from "./codeMap.render.service";
import {CodeMapActionsService} from "./codeMap.actions.service";
import {CodeMapUtilService} from "./codeMap.util.service";
import {CodeMapLabelService} from "./codeMap.label.service";
import {CodeMapArrowService} from "./codeMap.arrow.service";

angular.module("app.codeCharta.ui.codeMap", [
    "app.codeCharta.state",
    "app.codeCharta",
    "app.codeCharta.ui.codeMap.threeViewer",
    "app.codeCharta.ui.codeMap.treemap"
    ]
).component(
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