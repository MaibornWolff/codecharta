import angular from "angular";
import "../common/fab/fab.js";
import {fabBarComponent} from "./fabBarComponent.ts";

angular.module("app.codeCharta.ui.fabBar",["app.codeCharta.ui.common.fab"]);

angular.module("app.codeCharta.ui.fabBar").component(
    fabBarComponent.selector,
    fabBarComponent
);
