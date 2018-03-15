import angular from "angular";
import "../../core/core.module";

import {regexFilterComponent} from "./regexFilter.component";

angular.module("app.codeCharta.ui.regexFilter", ["app.codeCharta.core"])
    .component(
        regexFilterComponent.selector, regexFilterComponent
    );