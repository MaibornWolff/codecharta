"use strict";

import "../../core/core.ts";
import "../../codeMap/codeMap.js";

import {LegendPanelDirective} from "./legendPanelDirective.js";
import {LegendPanelController} from "./legendPanelController.ts";

angular.module("app.codeCharta.ui.legendPanel",["app.codeCharta.core.settings", "app.codeCharta.codeMap"]);

angular.module("app.codeCharta.ui.legendPanel").controller(
    "legendPanelController", LegendPanelController
);

angular.module("app.codeCharta.ui.legendPanel").directive(
    "legendPanelDirective", 
    () => new LegendPanelDirective()
);
