"use strict";

import "./codeMap/codeMap";
import "./core/core.module";
import "./ui/ui";

import {codeChartaComponent, CodeChartaController} from "./codeChartaComponent";

import angular from "angular";

angular.module(
    "app.codeCharta",
    ["app.codeCharta.codeMap", "app.codeCharta.core", "app.codeCharta.ui"]
);

angular.module("app.codeCharta").component(
    codeChartaComponent.selector,
    codeChartaComponent
);


