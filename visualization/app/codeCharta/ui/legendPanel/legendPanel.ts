import angular from "angular";
import "../../core/core.module";
import "../../codeMap/codeMap";
import "../../ui/ui";

import {legendPanelComponent} from "./legendPanelComponent";

angular.module("app.codeCharta.ui.legendPanel",["app.codeCharta.core.settings", "app.codeCharta.codeMap", "app.codeCharta.ui"]);

angular.module("app.codeCharta.ui.legendPanel").component(
    legendPanelComponent.selector, legendPanelComponent
);