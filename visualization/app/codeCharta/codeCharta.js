"use strict";

import "./codeMap/codeMap.js";
import "./core/core.js";
import "./ui/ui.js";

import {CodeChartaController} from "./codeChartaController.js";
import {CodeChartaDirective} from "./codeChartaDirective.js";

import "./codeCharta.css";

angular.module(
    "app.codeCharta",
    ["app.codeCharta.codeMap", "app.codeCharta.core", "app.codeCharta.ui"]
);

angular.module("app.codeCharta").controller(
    "codeChartaController",
    CodeChartaController
);

angular.module("app.codeCharta").directive(
    "codeChartaDirective", 
    () => new CodeChartaDirective()
);



