"use strict";

import "./data/data.ts";
import "./settings/settings.ts";
import "./url/url.ts";
import "./treemap/treemap.ts";
import "./scenario/scenario.ts";
import "./tooltip/tooltip.ts";

angular.module(
    "app.codeCharta.core",
    [
        "app.codeCharta.core.data",
        "app.codeCharta.core.settings",
        "app.codeCharta.core.url",
        "app.codeCharta.core.treemap",
        "app.codeCharta.core.scenario",
        "app.codeCharta.core.tooltip"
    ]
);
