"use strict";

import "./aggregate/aggregate.module";
import "./data/data.module";
import "./settings/settings.module";
import "./url/url.module";
import "./treemap/treemap.module";
import "./scenario/scenario.module";
import "./tooltip/tooltip.module";
import "./statistic/statistic.module";

import angular from "angular";

angular.module(
    "app.codeCharta.core",
    [
        "app.codeCharta.core.aggregate",
        "app.codeCharta.core.data",
        "app.codeCharta.core.settings",
        "app.codeCharta.core.url",
        "app.codeCharta.core.treemap",
        "app.codeCharta.core.scenario",
        "app.codeCharta.core.tooltip",
        "app.codeCharta.core.statistic"
    ]
);
