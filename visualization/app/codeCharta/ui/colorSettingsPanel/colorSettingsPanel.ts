import "../rangeSlider/rangeSlider";
import "../../core/core.module";

import angular from "angular";

import {colorSettingsPanelComponent} from "./colorSettingsPanel.component";

angular.module("app.codeCharta.ui.colorSettingsPanel", ["app.codeCharta.ui.rangeSlider", "app.codeCharta.core"])
    .component(colorSettingsPanelComponent.selector, colorSettingsPanelComponent);


