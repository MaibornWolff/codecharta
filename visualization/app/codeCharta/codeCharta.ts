"use strict";

import "./codeMap/codeMap.ts";
import "./core/core.ts";
import "./ui/ui.js";

import {codeChartaComponent, CodeChartaController} from "./codeChartaComponent.ts";

import angular from "angular";

import "./codeCharta.css";

angular.module(
    "app.codeCharta",
    ["app.codeCharta.codeMap", "app.codeCharta.core", "app.codeCharta.ui"]
);

angular.module("app.codeCharta").component(
    codeChartaComponent.selector,
    codeChartaComponent
);


