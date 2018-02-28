import "../rangeSlider/rangeSlider";
import "../../core/core.module";

import angular from "angular";

import {displaySettingsPanelComponent} from "./displaySettingsPanel.component";

angular.module("app.codeCharta.ui.displaySettingsPanel", ["app.codeCharta.ui.rangeSlider", "app.codeCharta.core"])
    .component(displaySettingsPanelComponent.selector, displaySettingsPanelComponent);


