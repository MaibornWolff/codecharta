import angular from "angular";
import "../../core/core.ts";
import "../../codeMap/codeMap.ts";

import {legendPanelComponent} from "./legendPanelComponent.ts";

angular.module("app.codeCharta.ui.legendPanel",["app.codeCharta.core.settings", "app.codeCharta.codeMap"]);

angular.module("app.codeCharta.ui.legendPanel").component(
    legendPanelComponent.selector, legendPanelComponent
);