import "../../state/state.module"
import "../layoutSwitcher/layoutSwitcher.module"

import angular from "angular"

import { experimentalSettingsPanelComponent } from "./experimentalSettingsPanel.component"

angular
	.module("app.codeCharta.ui.experimentalSettingsPanel", ["app.codeCharta.state", "app.codeCharta.ui.layoutSwitcher"])
	.component(experimentalSettingsPanelComponent.selector, experimentalSettingsPanelComponent)
