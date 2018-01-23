import angular from "angular";

import "../../core/core.module";
import "../../codeMap/codeMap";

import "./detailPanel.css";

import {detailPanelComponent} from "./detailPanelComponent";

angular.module(
    "app.codeCharta.ui.detailPanel",
    ["app.codeCharta.core.settings", "app.codeCharta.codeMap"]
);

angular.module("app.codeCharta.ui.detailPanel").component(
    detailPanelComponent.selector, detailPanelComponent
);

