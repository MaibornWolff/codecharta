"use strict";

import angular from "angular";
import {StatisticMapService} from "./statistic.service.ts";

angular.module(
    "app.codeCharta.core.statistic", []
).service(
    StatisticMapService.SELECTOR, StatisticMapService
);

