"use strict";

import {TooltipService} from "./tooltip.service.ts";

import angular from "angular";

angular.module("app.codeCharta.core.tooltip", [])
    .service(
        TooltipService.SELECTOR, TooltipService
    );


