import "../rangeSlider/rangeSlider";
import "../../core/core.module";

import angular from "angular";

import {multipleSettingsPanelComponent} from "./multipleSettingsPanel.component";

angular.module("app.codeCharta.ui.multipleSettingsPanel", ["app.codeCharta.ui.rangeSlider", "app.codeCharta.core"])
    .component(multipleSettingsPanelComponent.selector, multipleSettingsPanelComponent);


