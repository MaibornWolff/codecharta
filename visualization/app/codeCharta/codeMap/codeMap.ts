import angular from "angular";

import "./threeViewer/threeViewer";
import "../core/core.module";

import {CodeMapService} from "./codeMapService";
import {codeMapComponent} from "./codeMapComponent";

angular.module("app.codeCharta.codeMap",["app.codeCharta.codeMap.threeViewer", "app.codeCharta.core"])

.component(codeMapComponent.selector, codeMapComponent)

.service(
    CodeMapService.SELECTOR,
    CodeMapService
);