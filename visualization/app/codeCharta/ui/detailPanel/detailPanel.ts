import angular from "angular";

import "../../core/core.module.ts";
import "../../codeMap/codeMap.ts";

import {detailPanelComponent} from "./detailPanelComponent.ts";

angular.module(
    "app.codeCharta.ui.detailPanel",
    ["app.codeCharta.core.settings", "app.codeCharta.codeMap"]
);

angular.module("app.codeCharta.ui.detailPanel").component(
    detailPanelComponent.selector, detailPanelComponent
);

