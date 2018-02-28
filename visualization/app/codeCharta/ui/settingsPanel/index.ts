"use strict";

import "../../ui/ui";
import "../../core/core.module";
import "../codeMap/codeMap";

import angular from "angular";

import {settingsPanelComponent} from "./settingsPanel";

angular.module("app.codeCharta.ui.settingsPanel", ["app.codeCharta.ui", "app.codeCharta.core"])
    .component(settingsPanelComponent.selector, settingsPanelComponent);


