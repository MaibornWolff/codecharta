"use strict";

import "../url/url.js";
import {TooltipService} from "./tooltipService.js";

angular.module("app.codeCharta.core.tooltip",["app.codeCharta.core.url"]);

angular.module("app.codeCharta.core.tooltip").service(
    "tooltipService", TooltipService
);


