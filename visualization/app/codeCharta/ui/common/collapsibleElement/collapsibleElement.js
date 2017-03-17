"use strict";

import {CollapsibleElementDirective} from "./collapsibleElementDirective.js";

angular.module("app.codeCharta.ui.common.collapsibleElement",[]);

angular.module("app.codeCharta.ui.common.collapsibleElement").directive(
    "collapsibleElementDirective",
    () => new CollapsibleElementDirective()
);
