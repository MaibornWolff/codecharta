"use strict";

import {TooltipService} from "./tooltipService.ts";

import angular from "angular";

angular.module("app.codeCharta.core.tooltip", [])
    .service(
        "tooltipService", TooltipService
    );


