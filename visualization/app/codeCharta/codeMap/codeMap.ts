import angular from "angular";

import "./threeViewer/threeViewer.ts";
import "../core/core.module.ts";

import {CodeMapService} from "./codeMapService.ts";
import {codeMapComponent} from "./codeMapComponent.ts";

angular.module("app.codeCharta.codeMap",["app.codeCharta.codeMap.threeViewer", "app.codeCharta.core"])

.component(codeMapComponent.selector, codeMapComponent)

.service(
    CodeMapService.SELECTOR,
    CodeMapService
);