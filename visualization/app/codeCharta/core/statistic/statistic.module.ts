"use strict";

import angular from "angular";
import {StatisticMapService} from "./statistic.service";
import "../../ui/dialog/dialog";

angular.module(
    "app.codeCharta.core.statistic", ["app.codeCharta.ui.dialog"]
).service(
    StatisticMapService.SELECTOR, StatisticMapService
);

