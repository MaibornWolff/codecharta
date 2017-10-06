"use strict";

import "../../ui/ui.js";
import "../../core/core.ts";
import "../../codeMap/codeMap.js";
import "angularjs-slider";

import angular from "angular";

import {settingsPanelComponent} from "./settingsPanel.ts";

angular.module("app.codeCharta.ui.settingsPanel", ["app.codeCharta.ui", "app.codeCharta.core", "rzModule"])
    .component(settingsPanelComponent.selector, settingsPanelComponent);


