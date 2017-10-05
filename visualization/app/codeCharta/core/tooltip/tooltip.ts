"use strict";

import "../url/url.ts";
import {TooltipService} from "./tooltipService.ts";

import angular from "angular";

angular.module("app.codeCharta.core.tooltip",["app.codeCharta.core.url"]);

angular.module("app.codeCharta.core.tooltip").service(
    "tooltipService", TooltipService
);


