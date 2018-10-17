import angular from "angular";

import "./threeViewer/threeViewer";
import "../../core/core.module";

import {codeMapComponent} from "./codeMap.component";
import {CodeMapMouseEventService} from "./codeMap.mouseEvent.service";
import {CodeMapRenderService} from "./codeMap.render.service";
import {CodeMapActionsService} from "./codeMap.actions.service";
import {CodeMapUtilService} from "./codeMap.util.service";

angular.module("app.codeCharta.ui.codeMap",["app.codeCharta.ui.codeMap.threeViewer", "app.codeCharta.core"])
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
);