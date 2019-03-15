// Plop: Append module import here
import "./scenario/scenario.module";
import "./tooltip/tooltip.module";

import angular from "angular";

angular.module(
    "app.codeCharta.core",
    [
        // Plop: Append component name here
        "app.codeCharta.core.scenario",
        "app.codeCharta.core.tooltip",
    ]
);
