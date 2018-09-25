import angular from "angular";
import {ribbonBarComponent} from "./ribbonBar.component";

angular.module(
    "app.codeCharta.ui.ribbonBar",
    []
);

angular.module("app.codeCharta.ui.ribbonBar").component(
    ribbonBarComponent.selector, ribbonBarComponent
);

