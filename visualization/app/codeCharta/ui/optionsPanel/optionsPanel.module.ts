import "../../state/state.module"

import angular from "angular"

import { optionsPanelComponent } from "./optionsPanel.component"

angular.module("app.codeCharta.ui.optionsPanel", ["app.codeCharta.state"]).component(optionsPanelComponent.selector, optionsPanelComponent)
