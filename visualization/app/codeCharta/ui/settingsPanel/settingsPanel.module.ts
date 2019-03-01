"use strict";

import "../ui";
import "../../core/core.module";
import "../codeMap/codeMap";

import "angular-material-expansion-panel";

import angular from "angular";

import {settingsPanelComponent} from "./settingsPanel.component";

angular.module("app.codeCharta.ui.settingsPanel", ["app.codeCharta.ui", "app.codeCharta.core", "material.components.expansionPanels"])
    .component(settingsPanelComponent.selector, settingsPanelComponent);


