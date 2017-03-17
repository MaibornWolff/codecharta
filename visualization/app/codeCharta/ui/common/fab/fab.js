"use strict";

import {FabDirective} from "./fabDirective.js";

angular.module("app.codeCharta.ui.common.fab",[]);

angular.module("app.codeCharta.ui.common.fab").directive(
    "fabDirective",
    () => new FabDirective()
);
