"use strict"

import "../ui"
import "../codeMap/codeMap.module"

import "angular-material-expansion-panel"

import angular from "angular"

import { settingsPanelComponent } from "./settingsPanel.component"

angular
	.module("app.codeCharta.ui.settingsPanel", ["material.components.expansionPanels"])
	.component(settingsPanelComponent.selector, settingsPanelComponent)
