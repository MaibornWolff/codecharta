"use strict";

import angular from "angular";
import {StatisticMapService} from "./statistic.service";

angular.module(
    "app.codeCharta.core.statistic", []
).service(
    StatisticMapService.SELECTOR, StatisticMapService
);

