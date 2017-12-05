import angular from "angular";
import "../../core/core.module";
import "../../codeMap/codeMap";

import {legendPanelComponent} from "./legendPanelComponent";

angular.module("app.codeCharta.ui.legendPanel",["app.codeCharta.core.settings", "app.codeCharta.codeMap"]);

angular.module("app.codeCharta.ui.legendPanel").component(
    legendPanelComponent.selector, legendPanelComponent
);