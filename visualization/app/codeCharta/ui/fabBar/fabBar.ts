import angular from "angular";
import "../common/common.ts";
import {fabBarComponent} from "./fabBarComponent.ts";

angular.module("app.codeCharta.ui.fabBar",["app.codeCharta.ui.common"]);

angular.module("app.codeCharta.ui.fabBar").component(
    fabBarComponent.selector,
    fabBarComponent
);
