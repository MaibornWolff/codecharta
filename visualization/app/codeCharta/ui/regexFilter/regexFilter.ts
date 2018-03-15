import angular from "angular";
import "angular-messages";
import "../../core/core.module";

import {regexFilterComponent} from "./regexFilter.component";

angular.module("app.codeCharta.ui.regexFilter", ["app.codeCharta.core", "ngMessages"])
    .component(
        regexFilterComponent.selector, regexFilterComponent
    );