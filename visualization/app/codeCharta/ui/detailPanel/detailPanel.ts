import angular from "angular";

import "../../core/core.module";
import "../codeMap/codeMap";

import {detailPanelComponent} from "./detailPanelComponent";

angular.module(
    "app.codeCharta.ui.detailPanel",
    ["app.codeCharta.core.settings", "app.codeCharta.ui.codeMap"]
);

angular.module("app.codeCharta.ui.detailPanel").component(
    detailPanelComponent.selector, detailPanelComponent
);

