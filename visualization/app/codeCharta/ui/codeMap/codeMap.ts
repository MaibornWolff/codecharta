import angular from "angular";

import "./threeViewer/threeViewer";
import "../../core/core.module";

import {CodeMapService} from "./codeMapService";
import {codeMapComponent} from "./codeMapComponent";

angular.module("app.codeCharta.ui.codeMap",["app.codeCharta.ui.codeMap.threeViewer", "app.codeCharta.core"])

.component(codeMapComponent.selector, codeMapComponent)

.service(
    CodeMapService.SELECTOR,
    CodeMapService
);