"use strict";

import "../../ui/ui.js";
import "../../core/core.js";
import "../../codeMap/codeMap.js";
import "angularjs-slider";

import {SettingsPanelDirective} from "./settingsPanelDirective.js";
import {SettingsPanelController} from "./settingsPanelController.js";

angular.module(
    "app.codeCharta.ui.settingsPanel",
    ["app.codeCharta.ui", "app.codeCharta.core", "app.codeCharta.codeMap", "rzModule"]
);

angular.module("app.codeCharta.ui.settingsPanel").directive(
    "settingsPanelDirective", 
    () => new SettingsPanelDirective()
);

angular.module("app.codeCharta.ui.settingsPanel").controller(
    "settingsPanelController",
    SettingsPanelController
);

