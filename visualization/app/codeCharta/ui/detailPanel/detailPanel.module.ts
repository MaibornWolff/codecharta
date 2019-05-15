import angular from "angular"

import "../../state/state.module"
import "../codeMap/codeMap.module"

import { detailPanelComponent } from "./detailPanel.component"

angular.module("app.codeCharta.ui.detailPanel", ["app.codeCharta.state", "app.codeCharta.ui.codeMap"])

angular.module("app.codeCharta.ui.detailPanel").component(detailPanelComponent.selector, detailPanelComponent)
