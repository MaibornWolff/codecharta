import {StatisticMapService, STATISTIC_OPS} from "./statisticMapService.js";

angular.module(
    "app.codeCharta.core.statistic", []
);

angular.module("app.codeCharta.core.statistic").service(
    "statisticMapService", StatisticMapService
);
angular.module("app.codeCharta.core.statistic").service(
     "STATISTIC_OPS", STATISTIC_OPS
);