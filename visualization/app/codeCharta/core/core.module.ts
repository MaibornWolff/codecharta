// Plop: Append module import here
import "./tooltip/tooltip.module";

import angular from "angular";

angular.module(
    "app.codeCharta.core",
    [
        // Plop: Append component name here
        "app.codeCharta.core.tooltip",
    ]
);
