"use strict";

import "../../core/core.ts";
import "../../codeMap/codeMap.js";

import {DetailPanelController} from "./detailPanelController.js";
import {DetailPanelDirective} from "./detailPanelDirective.js";

angular.module(
    "app.codeCharta.ui.detailPanel",
    ["app.codeCharta.core.settings", "app.codeCharta.codeMap"]
);

angular.module("app.codeCharta.ui.detailPanel").controller(
    "detailPanelController", DetailPanelController
);

angular.module("app.codeCharta.ui.detailPanel").directive(
    "detailPanelDirective",
    () => new DetailPanelDirective()
);

