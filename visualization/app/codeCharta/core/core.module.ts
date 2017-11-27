"use strict";

import "./data/data.module.ts";
import "./settings/settings.module.ts";
import "./url/url.module.ts";
import "./treemap/treemap.module.ts";
import "./scenario/scenario.module.ts";
import "./tooltip/tooltip.module.ts";
import "./statistic/statistic.module.ts";

import angular from "angular";

angular.module(
    "app.codeCharta.core",
    [
        "app.codeCharta.core.data",
        "app.codeCharta.core.settings",
        "app.codeCharta.core.url",
        "app.codeCharta.core.treemap",
        "app.codeCharta.core.scenario",
        "app.codeCharta.core.tooltip",
        "app.codeCharta.core.statistic"
    ]
);
