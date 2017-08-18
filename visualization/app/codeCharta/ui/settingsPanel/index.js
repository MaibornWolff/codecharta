"use strict";

import "../../ui/ui.js";
import "../../core/core.js";
import "../../codeMap/codeMap.js";
import "angularjs-slider";

import {settingsPanelComponent, SettingsPanelController} from "./settingsPanel";

angular.module("app.codeCharta.ui.settingsPanel", ["app.codeCharta.ui", "app.codeCharta.core", "rzModule"])
    .controller("settingsPanelController", SettingsPanelController) // for test TODO create artificial module in test just for this purpose, since we dont need this controller exposed outside of module
    .component(settingsPanelComponent.selector, settingsPanelComponent);


