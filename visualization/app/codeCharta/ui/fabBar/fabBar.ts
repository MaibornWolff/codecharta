import angular from "angular";
import "../common/common";
import {fabBarComponent} from "./fabBarComponent";

angular.module("app.codeCharta.ui.fabBar",["app.codeCharta.ui.common"]);

angular.module("app.codeCharta.ui.fabBar").component(
    fabBarComponent.selector,
    fabBarComponent
);
