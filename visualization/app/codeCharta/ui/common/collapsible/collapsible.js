"use strict";

import {CollapsibleDirective} from "./collapsibleDirective.js";

angular.module("app.codeCharta.ui.common.collapsible",[]);

angular.module("app.codeCharta.ui.common.collapsible").directive(
    "collapsibleDirective",
    () => new CollapsibleDirective()
);
