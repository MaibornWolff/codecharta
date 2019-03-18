import angular from "angular";
import "../../state/state.module";
import "../codeMap/codeMap";

import {legendPanelComponent} from "./legendPanel.component";

angular.module("app.codeCharta.ui.legendPanel",["app.codeCharta.state", "app.codeCharta.ui.codeMap"]);

angular.module("app.codeCharta.ui.legendPanel").component(
    legendPanelComponent.selector, legendPanelComponent
);