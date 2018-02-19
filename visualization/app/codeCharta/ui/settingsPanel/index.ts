"use strict";

import "../../ui/ui";
import "../../core/core.module";
import "../../codeMap/codeMap";
import "angularjs-slider";

import angular from "angular";

import {settingsPanelComponent} from "./settingsPanel";

import "./settingsPanel.css";

angular.module("app.codeCharta.ui.settingsPanel", ["app.codeCharta.ui", "app.codeCharta.core", "rzModule"])
    .component(settingsPanelComponent.selector, settingsPanelComponent);


