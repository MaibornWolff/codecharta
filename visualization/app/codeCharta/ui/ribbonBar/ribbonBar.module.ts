import angular from "angular";
import {ribbonBarComponent} from "./ribbonBar.component";
import "../../core/core.module";

angular.module(
    "app.codeCharta.ui.ribbonBar",
    ["app.codeCharta.core"]
);

angular.module("app.codeCharta.ui.ribbonBar").component(
    ribbonBarComponent.selector, ribbonBarComponent
);

