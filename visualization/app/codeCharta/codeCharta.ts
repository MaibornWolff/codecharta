"use strict";

import "./core/core.module";
import "./ui/ui";

import {codeChartaComponent, CodeChartaController} from "./codeCharta.component";

import angular from "angular";

angular.module(
    "app.codeCharta",
    ["app.codeCharta.core", "app.codeCharta.ui"]
);

angular.module("app.codeCharta").component(
    codeChartaComponent.selector,
    codeChartaComponent
);


